"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export type BattleEvent =
  | { type: "started"; timeLeft: number }
  | { type: "opponent:joined"; username: string }
  | { type: "opponent:progress"; progress: number; linesOfCode: number }
  | { type: "opponent:submitted"; verdict: string; testsPassed: number; totalTests: number }
  | { type: "battle:winner"; winnerId: string; winnerUsername: string; eloChanges: Record<string, { delta: number; newRating: number }> }
  | { type: "battle:first_finish"; winnerId: string; message: string }
  | { type: "battle:timeout"; message: string }
  | { type: "battle:opponent_left"; username: string }
  | { type: "battle:timer"; timeLeft: number }
  | { type: "submit:result"; verdict: string; testsPassed: number; totalTests: number };

interface UseBattleSocketOptions {
  battleId: string;
  userId: string;
  username: string;
  onEvent: (event: BattleEvent) => void;
}

const SOCKET_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export function useBattleSocket({
  battleId,
  userId,
  username,
  onEvent,
}: UseBattleSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!battleId || !userId) return;

    const socket = io(`${SOCKET_URL}/battle`, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("battle:join", { battleId, userId, username });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("battle:started", ({ timeLeft }: { timeLeft: number }) => {
      onEvent({ type: "started", timeLeft });
    });

    socket.on("opponent:joined", ({ username: oppUsername }: { username: string }) => {
      onEvent({ type: "opponent:joined", username: oppUsername });
    });

    socket.on("opponent:progress", (data: { progress: number; linesOfCode: number }) => {
      onEvent({ type: "opponent:progress", ...data });
    });

    socket.on("opponent:submitted", (data: { verdict: string; testsPassed: number; totalTests: number }) => {
      onEvent({ type: "opponent:submitted", ...data });
    });

    socket.on("battle:winner", (data: { winnerId: string; winnerUsername: string; eloChanges: Record<string, { delta: number; newRating: number }> }) => {
      onEvent({ type: "battle:winner", ...data });
    });

    socket.on("battle:first_finish", (data: { winnerId: string; message: string }) => {
      onEvent({ type: "battle:first_finish", ...data });
    });

    socket.on("battle:timeout", ({ message }: { message: string }) => {
      onEvent({ type: "battle:timeout", message });
    });

    socket.on("battle:opponent_left", ({ username: oppUsername }: { username: string }) => {
      onEvent({ type: "battle:opponent_left", username: oppUsername });
    });

    socket.on("battle:timer", ({ timeLeft }: { timeLeft: number }) => {
      onEvent({ type: "battle:timer", timeLeft });
    });

    socket.on("submit:result", (data: { verdict: string; testsPassed: number; totalTests: number }) => {
      onEvent({ type: "submit:result", ...data });
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId, userId, username]);

  const emitCodeUpdate = useCallback(
    (progress: number, linesOfCode: number) => {
      socketRef.current?.emit("battle:code_update", {
        battleId,
        progress,
        linesOfCode,
      });
    },
    [battleId]
  );

  const emitSubmitResult = useCallback(
    (data: {
      verdict: string;
      runtime: number | null;
      memory: number | null;
      testsPassed: number;
      totalTests: number;
    }) => {
      socketRef.current?.emit("battle:submit_result", {
        battleId,
        userId,
        ...data,
      });
    },
    [battleId, userId]
  );

  return { connected, emitCodeUpdate, emitSubmitResult };
}

// ─── Matchmaking Socket Hook ──────────────────────────────────────────────────

export type MatchmakingEvent =
  | { type: "queue:waiting"; position: number; estimatedWait: number }
  | { type: "queue:left" }
  | { type: "match:found"; battleId: string; opponent: { username: string; rating: number } };

interface UseMatchmakingSocketOptions {
  onEvent: (event: MatchmakingEvent) => void;
}

export function useMatchmakingSocket({ onEvent }: UseMatchmakingSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/matchmaking`, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("queue:waiting", (data: { position: number; estimatedWait: number }) => {
      onEvent({ type: "queue:waiting", ...data });
    });

    socket.on("queue:left", () => {
      onEvent({ type: "queue:left" });
    });

    socket.on("match:found", (data: { battleId: string; opponent: { username: string; rating: number } }) => {
      onEvent({ type: "match:found", ...data });
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinQueue = useCallback(
    (data: {
      userId: string;
      username: string;
      rating: number;
      ratingRange: number;
      difficulty: string;
    }) => {
      socketRef.current?.emit("queue:join", data);
    },
    []
  );

  const leaveQueue = useCallback(() => {
    socketRef.current?.emit("queue:leave");
  }, []);

  return { connected, joinQueue, leaveQueue };
}
