import { WebSocket } from "ws";
import { MyWebSocket, clientToServer, joinRoom, opmodes, proxy } from "./types";
import { RawData } from "ws";
import { rooms } from ".";

export function handleMessage(this: MyWebSocket, messageBuffer: RawData) {
  const message = messageBuffer.toString("utf-8");
  let genericData = JSON.parse(message) as clientToServer;
  console.log(this, messageBuffer);
  if (genericData.type === "joinroom") {
    const data = genericData as joinRoom;
    const room = rooms.find((room) => room.code == data.roomcode);
    if (room) {
      room.clients.push(this);
      this.room = room;
      this.send(JSON.stringify({ type: "opmodes", value: room.proxy.opmodes }));
      room.proxy.send(
        JSON.stringify({
          type: "watcherCount",
          value: room.clients?.length,
        })
      );
    }
  } else if (genericData.type === "SEND_OPMODES") {
    const data = genericData as opmodes;
    this.opmodes = data.opmodes;
    this.room?.clients?.map((watcher) =>
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
    const room = { proxy: this, clients: [], code: code };
    rooms.push(room);
    this.room = room;
    this.send(
      JSON.stringify({
        type: "roomcode",
        value: code,
      })
    );
    this.opmodes = [];
  } else if (this.uuid && this.room?.proxy.uuid === this.uuid) {
    console.log(this.room?.proxy.uuid, this.uuid);
    this.room.clients.map((watcher) => watcher.send(message));
  } else if (this.room) {
    this.room.proxy?.send(message);
  }
}
