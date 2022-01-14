export const emptyController = {
  left_stick_x: 0,
  left_stick_y: 0,
  right_stick_x: 0,
  right_stick_y: 0,
  dpad_up: false,
  dpad_down: false,
  dpad_left: false,
  dpad_right: false,
  a: false,
  b: false,
  x: false,
  y: false,
  guide: false,
  start: false,
  back: false,
  left_bumper: false,
  right_bumper: false,
  left_stick_button: false,
  right_stick_button: false,
  left_trigger: 0,
  right_trigger: 0,
} as controller;

export type controller = {
  left_stick_x: number;
  left_stick_y: number;
  right_stick_x: number;
  right_stick_y: number;
  dpad_up: boolean;
  dpad_down: boolean;
  dpad_left: boolean;
  dpad_right: boolean;
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  guide: boolean;
  start: boolean;
  back: boolean;
  left_bumper: boolean;
  right_bumper: boolean;
  left_stick_button: boolean;
  right_stick_button: boolean;
  left_trigger: number;
  right_trigger: number;
  index: number;
};
export type controllers = {
  type: "RECEIVE_GAMEPAD_STATE";
  gamepad1: controller;
  gamepad2: controller;
};
