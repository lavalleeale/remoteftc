import { WebSocket } from "ws";

export declare class MyWebSocket extends WebSocket {
  uuid: string;
  opmodes: opmode[] | null;
  activeOpmode: string | null;
  room: room | null;
}

export type room = {
  proxy: MyWebSocket;
  clients: MyWebSocket[];
  code: string | number;
};

export type clientToServer = joinRoom | opmodes | proxy | activeOpmode;
export type joinRoom = {
  type: "joinroom";
  roomcode: string | number;
};
export type activeOpmode = {
  type: "activeOpmode";
  message: any;
};
export type opmodes = {
  type: "opmodesList";
  message: opmode[];
};
export type proxy = {
  type: "proxy";
  code: string;
};
export type opmode = {
  flavor: "TELEOP" | "AUTONOMOUS";
  group: String;
  name: String;
};
