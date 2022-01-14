import { Server, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

declare class MyWebSocket extends WebSocket {
  watchers: MyWebSocket[] | null;
  code: number | null;
  uuid: string;
  proxyuuid: string | null;
  opmodes: string[] | null;
}

const wss = new Server({ port: 4000 });
wss.on("connection", (ws: MyWebSocket) => {
  ws.uuid = uuidv4();
  console.log("connection");
  ws.on("close", () => {
    if (ws.watchers !== null && ws.watchers !== undefined) {
      ws.watchers.map((watcher) =>
        watcher.send(JSON.stringify({ type: "disconnect" }))
      );
    } else {
      const proxy = [...(wss.clients as Set<MyWebSocket>)].find(
        (socket) => socket.uuid == ws.proxyuuid
      );
      if (proxy) {
        proxy.watchers = proxy.watchers!.filter(
          (socket) => socket.uuid !== ws.uuid
        );
        proxy.send(
          JSON.stringify({
            type: "watcherCount",
            value: proxy.watchers?.length,
          })
        );
        proxy.watchers!.map((watcher) =>
          watcher.send(
            JSON.stringify({
              type: "watcherCount",
              value: proxy.watchers?.length,
            })
          )
        );
      }
    }
  });
  //connection is up, let's add a simple simple event
  ws.on("message", (messageBuffer: Buffer) => {
    const message = messageBuffer.toString("utf-8");
    if (message === "proxy") {
      ws.code = Math.floor(100000 + Math.random() * 900000);
      ws.send(
        JSON.stringify({
          type: "roomcode",
          value: ws.code,
        })
      );
      ws.watchers = [];
    } else {
      let genericData = JSON.parse(message) as clientToServer;
      if (genericData.type === "joinroom") {
        const data = genericData as joinRoom;
        const proxy = [...(wss.clients as Set<MyWebSocket>)].find(
          (socket) => socket.code == data.roomcode
        );
        if (proxy) {
          ws.proxyuuid = proxy.uuid;
          ws.send(JSON.stringify({ type: "opmodes", value: proxy.opmodes }));
          proxy.watchers!.push(ws);
          proxy.send(
            JSON.stringify({
              type: "watcherCount",
              value: proxy.watchers?.length,
            })
          );
          proxy.watchers!.map((watcher) =>
            watcher.send(
              JSON.stringify({
                type: "watcherCount",
                value: proxy.watchers?.length,
              })
            )
          );
        }
      } else if (genericData.type === "RECEIVE_OP_MODE_LIST") {
        const data = genericData as opmodes;
        ws.opmodes = data.opModeList;
      } else if (ws.watchers) {
        ws.watchers.map((watcher) => watcher.send(message));
      } else if (ws.proxyuuid) {
        const proxy = [...(wss.clients as Set<MyWebSocket>)].find(
          (socket) => socket.uuid == ws.proxyuuid
        );
        proxy?.send(message);
      }
    }
  });
});
type clientToServer = joinRoom | opmodes;
type joinRoom = {
  type: "joinroom";
  roomcode: number;
};
type opmodes = {
  type: "RECEIVE_OP_MODE_LIST";
  opModeList: string[];
};
