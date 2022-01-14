package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;

import org.firstinspires.ftc.teamcode.WebsocketTest;
import com.qualcomm.robotcore.hardware.Gamepad;

import java.io.IOException;

@Autonomous(name = "Test Websocket")
public class WebsocketOpmode extends OpMode {
    WebsocketTest test;
    OptimizedRobot robot;
    Gamepad controller1;
    Gamepad controller2;

    @Override
    public void init() {
        try {
            test = new WebSocketTest();
        } catch (IOException e) {
            e.printStackTrace();
        }
        controller1 = test.gamepad1;
        controller2 = test.gamepad2;
    }

    @Override
    public void loop() {
        if (Thread.currentThread().isInterrupted()) {
            test.stop();
        }
        telemetry.log().add(String.valueOf(controller1.left_stick_x));
    }
}