package com.lavalleeale.remoteftc;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.qualcomm.robotcore.hardware.Gamepad;

import java.io.IOException;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

public class Websocket extends NanoWSD.WebSocket {
    Gson gson = new Gson();

    Websocket(NanoHTTPD.IHTTPSession handshakeRequest) {
        super(handshakeRequest);
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
    protected void onClose(NanoWSD.WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
    }

    @Override
    protected void onMessage(NanoWSD.WebSocketFrame message) {
        try {
            Webserver.GamepadState gamepads = gson.fromJson(message.getTextPayload(), Webserver.GamepadState.class);
            if (RemoteFTC.instance.opModeStatus == RemoteFTC.OpModeStatus.STOPPED) {
                return;
            }

            if (RemoteFTC.instance.activeOpMode.gamepad1.getGamepadId() != Gamepad.ID_UNASSOCIATED ||
                    RemoteFTC.instance.activeOpMode.gamepad2.getGamepadId() != Gamepad.ID_UNASSOCIATED) {
                return;
            }
            transferGamepad(gamepads.gamepad1, RemoteFTC.instance.activeOpMode.gamepad1);
            transferGamepad(gamepads.gamepad2, RemoteFTC.instance.activeOpMode.gamepad2);
        } catch (JsonSyntaxException ignored) {

        }
//        try {
//            send("time: " + (endTime-startTime));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
    }

    public void transferGamepad(Webserver.GamepadButtons from, Gamepad to) {
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
    protected void onPong(NanoWSD.WebSocketFrame pong) {
    }

    @Override
    protected void onException(IOException exception) {

    }
}