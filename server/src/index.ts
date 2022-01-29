import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { room, MyWebSocket } from "./types";
import { handleMessage } from "./handleMessage";
import { handleDisconnect } from "./handleDisconnect";

export const rooms: room[] = [];

const wss = new WebSocketServer({ port: 4000 });
wss.on("connection", (ws: MyWebSocket) => {
  ws.uuid = uuidv4();
  console.log("connection");

  // @ts-expect-error
  ws.on("close", handleDisconnect);
  // @ts-expect-error
  ws.on("message", handleMessage);
});
