import type { Server as HTTPServer } from "http";
import type { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "socket.io";
import dbConnect from "./mongodb";
import { Battle, Problem, User, Submission } from "./models";
import { applyEloChange } from "./elo";
import {
  enqueuePlayer,
  dequeuePlayer,
  findMatch,
  atomicMatch,
  isRedisAvailable,
  inMemoryQueue,
} from "./matchmaking-exports";

// Re-export for use in server.ts
export let io: SocketIOServer;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  setupMatchmakingNamespace();
  setupBattleNamespace();

  console.log("[Socket.IO] Server initialized");
  return io;
}

// ─── Matchmaking Namespace ──────────────────────────────────────────────────

function setupMatchmakingNamespace() {
  const ns = io.of("/matchmaking");

  ns.on("connection", (socket: Socket) => {
    console.log(`[Matchmaking] Client connected: ${socket.id}`);

    socket.on(
      "queue:join",
      async (data: {
        userId: string;
        username: string;
        rating: number;
        ratingRange: number;
        difficulty: string;
      }) => {
        const { userId, username, rating, ratingRange, difficulty } = data;

        // Map socket id → userId for cleanup on disconnect
        socket.data.userId = userId;
        socket.data.username = username;

        console.log(`[Matchmaking] ${username} (${rating} Elo) joining queue`);

        const entry = {
          userId,
          username,
          rating,
          ratingRange,
          difficulty,
          joinedAt: Date.now(),
        };

        const redisOk = await isRedisAvailable();

        if (redisOk) {
          await enqueuePlayer(entry);
          const opponent = await findMatch(userId, rating, ratingRange, difficulty);

          if (opponent) {
            const matched = await atomicMatch(userId, opponent);
            if (matched) {
              await createBattleAndNotify(matched.player1Meta, matched.player2Meta, ns);
              return;
            }
          }
        } else {
          // Fallback to in-memory queue
          inMemoryQueue.enqueue(entry);
          const opponent = inMemoryQueue.findMatch(userId, rating, ratingRange, difficulty);

          if (opponent) {
            inMemoryQueue.dequeue(userId);
            inMemoryQueue.dequeue(opponent.userId);
            await createBattleAndNotify(entry, opponent, ns);
            return;
          }
        }

        socket.emit("queue:waiting", {
          position: 1,
          estimatedWait: 15,
        });
      }
    );

    socket.on("queue:leave", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      const redisOk = await isRedisAvailable();
      if (redisOk) {
        await dequeuePlayer(userId);
      } else {
        inMemoryQueue.dequeue(userId);
      }

      socket.emit("queue:left");
    });

    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      const redisOk = await isRedisAvailable();
      if (redisOk) {
        await dequeuePlayer(userId);
      } else {
        inMemoryQueue.dequeue(userId);
      }
    });
  });
}

async function createBattleAndNotify(
  player1: { userId: string; username: string; rating: number; difficulty: string },
  player2: { userId: string; username: string; rating: number; difficulty: string },
  ns: ReturnType<SocketIOServer["of"]>
) {
  try {
    await dbConnect;

    // Pick a random problem matching difficulty
    const difficulty = player1.difficulty !== "Any" ? player1.difficulty : player2.difficulty;

    const filter =
      difficulty && difficulty !== "Any"
        ? { difficulty: difficulty.toUpperCase(), isArena: true }
        : { isArena: true };

    const problems = await Problem.find(filter, "_id").lean();

    if (problems.length === 0) {
      console.error("[Matchmaking] No problems found for difficulty:", difficulty);
      const sockets = await ns.fetchSockets();
      for (const s of sockets) {
        if (s.data.userId === player1.userId || s.data.userId === player2.userId) {
          s.emit("queue:error", { message: "No problems available in the database for this difficulty." });
        }
      }
      return;
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const battle = await Battle.create({
      player1Id: player1.userId,
      player2Id: player2.userId,
      problemId: problem._id,
      status: "ACTIVE",
      startedAt: new Date(),
    });

    console.log(
      `[Matchmaking] Battle created: ${battle._id} between ${player1.username} vs ${player2.username}`
    );

    // Notify both players
    const matchPayload = {
      battleId: battle._id.toString(),
      problem: { id: problem._id.toString() },
    };

    // Find sockets by userId and emit
    const sockets = await ns.fetchSockets();
    for (const s of sockets) {
      if (s.data.userId === player1.userId || s.data.userId === player2.userId) {
        s.emit("match:found", {
          ...matchPayload,
          opponent:
            s.data.userId === player1.userId
              ? { username: player2.username, rating: player2.rating }
              : { username: player1.username, rating: player1.rating },
        });
      }
    }
  } catch (err) {
    console.error("[Matchmaking] Error creating battle:", err);
  }
}

// ─── Battle Namespace ───────────────────────────────────────────────────────

// Track battle timers server-side
const battleTimers = new Map<string, { timer: NodeJS.Timeout; timeLeft: number }>();
const BATTLE_DURATION_SECONDS = 20 * 60; // 20 minutes

function setupBattleNamespace() {
  const ns = io.of("/battle");

  ns.on("connection", (socket: Socket) => {
    console.log(`[Battle] Client connected: ${socket.id}`);

    socket.on(
      "battle:join",
      async (data: { battleId: string; userId: string; username: string }) => {
        const { battleId, userId, username } = data;

        socket.data.battleId = battleId;
        socket.data.userId = userId;
        socket.data.username = username;

        socket.join(battleId);

        console.log(`[Battle] ${username} joined battle ${battleId}`);

        // Check if both players are in the room
        const room = await ns.in(battleId).fetchSockets();
        if (room.length === 2) {
          // Start the authoritative server timer
          if (!battleTimers.has(battleId)) {
            startBattleTimer(battleId, ns);
          }

          const currentTimeLeft = battleTimers.get(battleId)?.timeLeft ?? BATTLE_DURATION_SECONDS;

          ns.to(battleId).emit("battle:started", {
            timeLeft: currentTimeLeft,
          });
        }

        // Notify others in room
        socket.to(battleId).emit("opponent:joined", { username });
      }
    );

    socket.on(
      "battle:code_update",
      (data: { battleId: string; progress: number; linesOfCode: number }) => {
        // Broadcast progress to opponent only
        socket
          .to(data.battleId)
          .emit("opponent:progress", {
            progress: Math.min(100, Math.max(0, data.progress)),
            linesOfCode: data.linesOfCode,
          });
      }
    );

    socket.on(
      "battle:submit_result",
      async (data: {
        battleId: string;
        userId: string;
        verdict: string;
        runtime: number | null;
        memory: number | null;
        testsPassed: number;
        totalTests: number;
      }) => {
        const { battleId, userId, verdict } = data;

        if (verdict !== "ACCEPTED") {
          // Wrong answer — notify user, broadcast to opponent
          socket.emit("submit:result", {
            verdict,
            testsPassed: data.testsPassed,
            totalTests: data.totalTests,
          });
          socket.to(battleId).emit("opponent:submitted", {
            verdict,
            testsPassed: data.testsPassed,
            totalTests: data.totalTests,
          });
          return;
        }

        // Winner! Resolve battle
        try {
          await dbConnect;

          const battle = await Battle.findById(battleId);
          if (!battle || battle.status !== "ACTIVE") return;

          // Record their submission
          await Submission.create({
            userId,
            problemId: battle.problemId,
            battleId: battle._id,
            code: "", // Idealy we'd have the code here
            language: "unknown",
            status: "ACCEPTED",
            runtime: data.runtime,
            memory: data.memory,
            score: 0, // will be updated when battle resolves
          });

          if (!battle.winnerId) {
            // First person to finish!
            battle.winnerId = userId;
            await battle.save();
            
            // Notify clients that someone finished
            ns.to(battleId).emit("battle:first_finish", { 
               winnerId: userId,
               message: `${socket.data.username} has solved the problem!`
            });
            // Also notify the user of their own success
            socket.emit("submit:result", { verdict, testsPassed: data.testsPassed, totalTests: data.totalTests });
          } else if (battle.winnerId !== userId) {
            // Second person finished! End the battle.
            await resolveBattlePoints(battleId, battle.winnerId, ns);
          } else {
            // The first winner submitted again. Just acknowledge it to them.
            socket.emit("submit:result", { verdict, testsPassed: data.testsPassed, totalTests: data.totalTests });
          }
        } catch (err) {
          console.error("[Battle] Error handling submit:", err);
        }
      }
    );

    socket.on("disconnect", async () => {
      const { battleId, userId, username } = socket.data;
      if (!battleId) return;

      socket.to(battleId).emit("battle:opponent_left", { username });
      console.log(`[Battle] ${username} disconnected from battle ${battleId}`);
      
      // If a player disconnects, we could auto-resolve if the other already finished, 
      // but timeout will handle it anyway.
    });
  });
}

async function resolveBattlePoints(battleId: string, winnerId: string, ns: ReturnType<SocketIOServer["of"]>) {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle || battle.status === "FINISHED") return;

    const loserId = battle.player1Id === winnerId ? battle.player2Id : battle.player1Id;

    const [winner, loser] = await Promise.all([
      User.findOne({ clerkId: winnerId }),
      User.findOne({ clerkId: loserId }),
    ]);

    if (!winner || !loser) return;

    const { newWinnerRating, newLoserRating, winnerDelta, loserDelta } = applyEloChange(winner.rating, loser.rating);

    // Update DB
    await Promise.all([
      Battle.findByIdAndUpdate(battleId, {
        status: "FINISHED",
        endedAt: new Date(),
      }),
      User.findByIdAndUpdate(winner._id, {
        rating: newWinnerRating,
        $inc: { wins: 1 },
      }),
      User.findByIdAndUpdate(loser._id, {
        rating: newLoserRating,
        $inc: { losses: 1 },
      }),
      Submission.findOneAndUpdate({ battleId, userId: winnerId }, { score: winnerDelta }),
      Submission.findOneAndUpdate({ battleId, userId: loserId }, { score: loserDelta }),
    ]);

    stopBattleTimer(battleId);

    ns.to(battleId).emit("battle:winner", {
      winnerId,
      winnerUsername: winner.username,
      eloChanges: {
        [winner.clerkId]: { delta: winnerDelta, newRating: newWinnerRating },
        [loser.clerkId]: { delta: loserDelta, newRating: newLoserRating },
      },
    });
  } catch (err) {
    console.error("[Battle] Error resolving points:", err);
  }
}

function startBattleTimer(battleId: string, ns: ReturnType<SocketIOServer["of"]>) {
  const timerData = { timer: null as any, timeLeft: BATTLE_DURATION_SECONDS };

  const timer = setInterval(async () => {
    timerData.timeLeft -= 1;
    const timeLeft = timerData.timeLeft;

    // Broadcast every 10 seconds to keep clients in sync
    if (timeLeft % 10 === 0 || timeLeft <= 30) {
      ns.to(battleId).emit("battle:timer", { timeLeft });
    }

    if (timeLeft <= 0) {
      stopBattleTimer(battleId);
      
      // If time is up, resolve based on if someone finished already
      dbConnect.then(async () => {
        const battle = await Battle.findById(battleId);
        if (battle && battle.status === "ACTIVE") {
          if (battle.winnerId) {
            // One person finished, the other ran out of time
            await resolveBattlePoints(battleId, battle.winnerId, ns);
          } else {
            // Draw
            ns.to(battleId).emit("battle:timeout", { message: "Time is up! Battle ended in a draw." });
            await Battle.findByIdAndUpdate(battleId, {
              status: "FINISHED",
              endedAt: new Date(),
            }).catch(() => {});
          }
        }
      }).catch(console.error);
    }
  }, 1000);

  timerData.timer = timer;
  battleTimers.set(battleId, timerData);
}

function stopBattleTimer(battleId: string) {
  const data = battleTimers.get(battleId);
  if (data && data.timer) {
    clearInterval(data.timer);
    battleTimers.delete(battleId);
  }
}
