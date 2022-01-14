package org.firstinspires.ftc.teamcode;

import com.google.gson.Gson;
import com.qualcomm.robotcore.hardware.Gamepad;

import java.io.IOException;

import fi.iki.elonen.NanoWSD;

public class WebsocketTest extends NanoWSD {
    public volatile Gamepad gamepad1 = new Gamepad();
    public volatile Gamepad gamepad2 = new Gamepad();

    public WebSocketTest() throws IOException {
        super(6969);
        start();
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        return new WebSocket(handshake, log, gamepad1, gamepad2);
    }

    static class GamepadState {
        public GamepadButtons gamepad1;
        public GamepadButtons gamepad2;
    }

    static class GamepadButtons {
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

    static class WebSocket extends NanoWSD.WebSocket {
        Telemetry.Log log;
        Gamepad gamepad1;
        Gamepad gamepad2;

        WebSocket(IHTTPSession handshakeRequest, Telemetry.Log log, Gamepad gamepad1, Gamepad gamepad2) {
            super(handshakeRequest);
            this.log = log;
            this.gamepad1 = gamepad1;
            this.gamepad2 = gamepad2;
        }

        @Override
        protected void onOpen() {
            try {
                send("test");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        @Override
        protected void onClose(WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
        }

        @Override
        protected void onMessage(WebSocketFrame message) {
            Gson gson = new Gson();
            GamepadState gamepads = gson.fromJson(message.getTextPayload(), GamepadState.class);
            transferGamepad(gamepads.gamepad1, gamepad1);
            transferGamepad(gamepads.gamepad2, gamepad2);
        }

        public void transferGamepad(GamepadButtons from, Gamepad to) {
            to.left_stick_x = from.left_stick_x;
            to.left_stick_y = from.left_stick_y;
            to.right_stick_x = from.right_stick_x;
            to.right_stick_y = from.right_stick_y;
            to.dpad_up = from.dpad_up;
            to.dpad_down = from.dpad_down;
            to.dpad_left = from.dpad_left;
            to.dpad_right = from.dpad_right;
            to.a = from.a;
            to.b = from.b;
            to.x = from.x;
            to.y = from.y;
            to.guide = from.guide;
            to.start = from.start;
            to.back = from.back;
            to.left_bumper = from.left_bumper;
            to.right_bumper = from.right_bumper;
            to.left_stick_button = from.left_stick_button;
            to.right_stick_button = from.right_stick_button;
            to.left_trigger = from.left_trigger;
            to.right_trigger = from.right_trigger;
        }

        @Override
        protected void onPong(WebSocketFrame pong) {
        }

        @Override
        protected void onException(IOException exception) {

        }
    }
}
