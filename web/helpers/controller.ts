import { controller } from "src/shared/controller";

// TODO: Move more functions from control.tsx
export function controllerFromGamepad(gamepad: Gamepad) {
  return {
    left_stick_x: gamepad.axes[0],
    left_stick_y: gamepad.axes[1],
    right_stick_x: gamepad.axes[2],
    right_stick_y: gamepad.axes[3],
    dpad_up: gamepad.buttons[12].pressed,
    dpad_down: gamepad.buttons[13].pressed,
    dpad_left: gamepad.buttons[14].pressed,
    dpad_right: gamepad.buttons[15].pressed,
    a: gamepad.buttons[0].pressed,
    b: gamepad.buttons[1].pressed,
    x: gamepad.buttons[2].pressed,
    y: gamepad.buttons[3].pressed,
    guide: gamepad.buttons[16].pressed,
    start: gamepad.buttons[9].pressed,
    back: gamepad.buttons[8].pressed,
    left_bumper: gamepad.buttons[4].pressed,
    right_bumper: gamepad.buttons[5].pressed,
    left_stick_button: gamepad.buttons[10].pressed,
    right_stick_button: gamepad.buttons[11].pressed,
    left_trigger: gamepad.buttons[6].pressed ? 1 : 0,
    right_trigger: gamepad.buttons[7].pressed ? 1 : 0,
    index: gamepad.index,
  } as controller;
}
