import { WebSocket } from "ws";

export declare class MyWebSocket extends WebSocket {
  uuid: string;
  opmodes: opmode[] | null;
  room: room | null;
}

export type room = {
  proxy: MyWebSocket;
  clients: MyWebSocket[];
  code: string | number;
};

export type clientToServer = joinRoom | opmodes | proxy;
export type joinRoom = {
  type: "joinroom";
  roomcode: string | number;
};
export type opmodes = {
  type: "SEND_OPMODES";
  opmodes: opmode[];
};
export type proxy = {
  type: "proxy";
  code: string;
};
export type opmode = {
  flavor: "TELEOP" | "AUTONOMOUS";
  group: String;
  name: String;
  source: undefined | "ANDROID_STUDIO" | "BLOCKLY" | "ONBOTJAVA";
};
