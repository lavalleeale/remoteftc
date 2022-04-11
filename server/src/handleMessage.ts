import { WebSocket } from "ws";
import { MyWebSocket, clientToServer, joinRoom, opmodes, proxy } from "./types";
import { RawData } from "ws";
import { rooms } from ".";

export function handleMessage(this: MyWebSocket, messageBuffer: RawData) {
  const message = messageBuffer.toString("utf-8");
  let genericData = JSON.parse(message) as clientToServer;
  if (genericData.type === "joinroom") {
    const data = genericData as joinRoom;
    const room = rooms.find((room) => room.code == data.roomcode);
    if (room) {
      room.clients.push(this);
      this.room = room;
      this.send(JSON.stringify({ type: "opmodes", value: room.proxy.opmodes }));
      this.send(
        JSON.stringify({ type: "activeOpmode", value: room.proxy.activeOpmode })
      );
      room.proxy.send(
        JSON.stringify({
          type: "watcherCount",
          value: room.clients?.length,
        })
      );
    }
  } else if (genericData.type === "opmodesList") {
    const opmodes = genericData.message;
    this.opmodes = opmodes;
    this.room?.clients?.map((watcher) =>
      watcher.send(JSON.stringify({ type: "opmodes", value: opmodes }))
    );
  } else if (genericData.type === "activeOpmode") {
    const opmode = genericData.message;
    this.activeOpmode = opmode;
    this.room?.clients?.map((watcher) =>
      watcher.send(JSON.stringify({ type: "activeOpmode", value: opmode }))
    );
  } else if (genericData.type === "proxy") {
    const data = genericData as proxy;
    var code: string | number;
    if (rooms.find((room) => room.code == data.code)) {
      code = Math.floor(100000 + Math.random() * 900000);
    } else {
      code =
        data.code === "random"
          ? process.env.NODE_ENV === "production"
            ? Math.floor(100000 + Math.random() * 900000)
            : 111111
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
    this.room.clients.map((watcher) => watcher.send(message));
  } else if (this.room) {
    this.room.proxy?.send(message);
  }
}
