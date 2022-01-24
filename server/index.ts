import { Server, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

declare class MyWebSocket extends WebSocket {
  uuid: string;
  opmodes: opmode[] | null;
  room: room | null;
}

type room = {
  proxy: MyWebSocket;
  clients: MyWebSocket[];
  code: string | number;
};

const rooms: room[] = [];

const wss = new Server({ port: 4000 });
wss.on("connection", (ws: MyWebSocket) => {
  ws.uuid = uuidv4();
  console.log("connection");
  ws.on("close", () => {
    console.log("disconnect");
    if (ws.room) {
      if (ws.room.proxy.uuid === ws.uuid) {
        ws.room.clients.map((watcher) =>
          watcher.send(JSON.stringify({ type: "disconnect" }))
        );
        var index = rooms.indexOf(ws.room);
        if (index !== -1) {
          rooms.splice(index, 1);
        }
      } else {
        const proxy = ws.room.proxy;
        ws.room.clients = ws.room.clients.filter(
          (socket) => socket.uuid !== ws.uuid
        );
        proxy.send(
          JSON.stringify({
            type: "watcherCount",
            value: ws.room.clients?.length,
          })
        );
      }
    }
  });
  //connection is up, let's add a simple simple event
  ws.on("message", (messageBuffer: Buffer) => {
    const message = messageBuffer.toString("utf-8");
    let genericData = JSON.parse(message) as clientToServer;
    if (genericData.type === "joinroom") {
      const data = genericData as joinRoom;
      const room = rooms.find((room) => room.code == data.roomcode);
      if (room) {
        room.clients.push(ws);
        ws.room = room;
        ws.send(JSON.stringify({ type: "opmodes", value: room.proxy.opmodes }));
        room.proxy.send(
          JSON.stringify({
            type: "watcherCount",
            value: room.clients?.length,
          })
        );
      }
    } else if (genericData.type === "SEND_OPMODES") {
      const data = genericData as opmodes;
      ws.opmodes = data.opmodes;
      ws.room?.clients?.map((watcher) =>
        watcher.send(JSON.stringify({ type: "opmodes", value: data.opmodes }))
      );
    } else if (genericData.type === "proxy") {
      const data = genericData as proxy;
      var code: string | number;
      if (rooms.find((room) => room.code == data.code)) {
        code = Math.floor(100000 + Math.random() * 900000);
      } else {
        code =
          data.code === "random"
            ? Math.floor(100000 + Math.random() * 900000)
            : data.code;
      }
      const room = { proxy: ws, clients: [], code: code };
      rooms.push(room);
      ws.room = room;
      ws.send(
        JSON.stringify({
          type: "roomcode",
          value: code,
        })
      );
      ws.opmodes = [];
    } else if (ws.room?.proxy.uuid === ws.uuid) {
      ws.room.clients.map((watcher) => watcher.send(message));
    } else if (ws.room) {
      ws.room.proxy?.send(message);
    }
  });
});
type clientToServer = joinRoom | opmodes | proxy;
type joinRoom = {
  type: "joinroom";
  roomcode: string | number;
};
type opmodes = {
  type: "SEND_OPMODES";
  opmodes: opmode[];
};
type proxy = {
  type: "proxy";
  code: string;
};
type opmode = {
  flavor: "TELEOP" | "AUTONOMOUS";
  group: String;
  name: String;
  source: undefined | "ANDROID_STUDIO" | "BLOCKLY" | "ONBOTJAVA";
};
