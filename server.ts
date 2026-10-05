import { createServer } from "http";
import next from "next";
import { initSocketServer } from "./lib/socket-server";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // Attach Socket.IO to the same HTTP server
  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(
      `> AlgoArena server ready at http://localhost:${port} [${dev ? "development" : "production"}]`
    );
  });
});
