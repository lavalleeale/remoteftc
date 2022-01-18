package com.lavalleeale.remoteftc.messages;

import com.lavalleeale.remoteftc.Message;

public class GamepadStateMessage extends Message {
    public GamepadButtons gamepad1;
    public GamepadButtons gamepad2;
    public static class GamepadButtons {
        public float left_stick_x = 0f;
        public float left_stick_y = 0f;
        public float right_stick_x = 0f;
        public float right_stick_y = 0f;
        public boolean dpad_up = false;
        public boolean dpad_down = false;
        public boolean dpad_left = false;
        public boolean dpad_right = false;
        public boolean a = false;
        public boolean b = false;
        public boolean x = false;
        public boolean y = false;
        public boolean guide = false;
        public boolean start = false;
        public boolean back = false;
        public boolean left_bumper = false;
        public boolean right_bumper = false;
        public boolean left_stick_button = false;
        public boolean right_stick_button = false;
        public float left_trigger = 0f;
        public float right_trigger = 0f;
    }
}