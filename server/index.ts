import { Server, WebSocket } from "ws";

const room: { proxy: WebSocket | null; users: WebSocket[] } = {
  proxy: null,
  users: [],
};

const wss = new Server({ port: 4000 });
wss.on("connection", (ws: WebSocket) => {
  console.log("connection");
  //connection is up, let's add a simple simple event
  ws.on("message", (type: Buffer) => {
    switch (type.toString("utf-8")) {
      case "proxy":
        room.proxy = ws;
        break;
      default:
        break;
    }
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});
