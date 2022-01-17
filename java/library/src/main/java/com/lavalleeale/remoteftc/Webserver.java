package com.lavalleeale.remoteftc;

import android.content.Context;

import com.qualcomm.robotcore.hardware.Gamepad;

import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.OnDestroy;
import org.firstinspires.ftc.ftccommon.internal.FtcRobotControllerWatchdogService;
import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.IOException;

import fi.iki.elonen.NanoWSD;

public class Webserver extends NanoWSD  {
    public Websocket socket;

    public Webserver() throws IOException {
        super(6969);
        start();
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        socket = new Websocket(handshake);
        return socket;
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
}
