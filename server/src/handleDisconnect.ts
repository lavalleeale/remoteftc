import { rooms } from ".";
import { MyWebSocket } from "./types";

export function handleDisconnect(this: MyWebSocket) {
  console.log("disconnect");
  if (this.room) {
    if (this.room.proxy.uuid === this.uuid) {
      this.room.clients.map((watcher) =>
        watcher.send(JSON.stringify({ type: "disconnect" }))
      );
      var index = rooms.indexOf(this.room);
      if (index !== -1) {
        rooms.splice(index, 1);
      }
    } else {
      const proxy = this.room.proxy;
      this.room.clients = this.room.clients.filter(
        (socket) => socket.uuid !== this.uuid
      );
      proxy.send(
        JSON.stringify({
          type: "watcherCount",
          value: this.room.clients?.length,
        })
      );
    }
  }
}
