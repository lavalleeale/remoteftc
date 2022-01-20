package com.lavalleeale.remoteftc;

import android.content.Context;

import com.lavalleeale.remoteftc.messages.GamepadStateMessage;
import com.lavalleeale.remoteftc.messages.InitOpmodeMessage;
import com.lavalleeale.remoteftc.messages.OpmodesMessage;
import com.lavalleeale.remoteftc.messages.StartOpmodeMessage;
import com.lavalleeale.remoteftc.messages.StatusMessage;
import com.qualcomm.ftccommon.FtcEventLoop;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.hardware.Gamepad;
import com.qualcomm.robotcore.util.RobotLog;

import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.OnCreateEventLoop;
import org.firstinspires.ftc.ftccommon.external.OnDestroy;
import org.firstinspires.ftc.ftccommon.internal.FtcRobotControllerWatchdogService;
import org.firstinspires.ftc.robotcore.internal.opmode.OpModeManagerImpl;
import org.firstinspires.ftc.robotcore.internal.opmode.OpModeMeta;
import org.firstinspires.ftc.robotcore.internal.opmode.RegisteredOpModes;
import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class RemoteFTC implements OpModeManagerImpl.Notifications {
    public static RemoteFTC instance;
    public Webserver webserver;
    private final Object opModeLock = new Object();
    public OpMode activeOpMode;
    public OpModeStatus opModeStatus;
    public OpModeManagerImpl opModeManager;
    private ScheduledExecutorService statusExecutor;
    public final List<OpModeMeta> opModesList = new ArrayList<>();

    public RemoteFTC() {
        try {
            webserver = new Webserver();
            statusExecutor = Executors.newScheduledThreadPool(1);
            statusExecutor.scheduleAtFixedRate(sendStatus, 1000, 50, TimeUnit.MILLISECONDS);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    final Runnable sendStatus = new Runnable() {
        public void run() {
            if (instance.webserver != null && instance.opModeManager != null) {
                instance.webserver.sendAll(new StatusMessage(opModeManager.getActiveOpModeName(), opModeStatus, RobotLog.getGlobalWarningMessage().message, RobotLog.getGlobalErrorMsg(), opModeManager.getRobotState()));
            }
        }
    };

    @OnCreate
    public static void start(Context context) {
        if (instance == null) {
            instance = new RemoteFTC();
        }
    }

    @OnDestroy
    public static void stop(Context context) {
        if (!FtcRobotControllerWatchdogService.isLaunchActivity(AppUtil.getInstance().getRootActivity())) {
            // prevent premature stop when the app is launched via hardware attachment
            return;
        }

        if (instance != null) {
            instance.webserver.stop();
            instance.statusExecutor.shutdown();
            instance = null;
        }
    }

    @OnCreateEventLoop
    public static void attachEventLoop(Context context, FtcEventLoop eventLoop) {
        if (instance.opModeManager != null) {
            instance.opModeManager.unregisterListener(instance);
        }

        instance.opModeManager = eventLoop.getOpModeManager();
        if (instance.opModeManager != null) {
            instance.opModeManager.registerListener(instance);
        }
        synchronized (instance.opModesList) {
            instance.opModesList.clear();
        }

        Thread t = new Thread(new ListOpModesRunnable());
        t.start();
    }

    private static class ListOpModesRunnable implements Runnable {
        @Override
        public void run() {
            RegisteredOpModes.getInstance().waitOpModesRegistered();
            synchronized (instance.opModesList) {
                instance.opModesList.addAll(RegisteredOpModes.getInstance().getOpModes());

                instance.webserver.sendAll(new OpmodesMessage(instance.opModesList));
            }
        }
    }

    @Override
    public void onOpModePreInit(OpMode opMode) {
        synchronized (opModeLock) {
            activeOpMode = opMode;
            opModeStatus = OpModeStatus.INIT;
        }
    }

    @Override
    public void onOpModePreStart(OpMode opMode) {
        synchronized (opModeLock) {
            activeOpMode = opMode;
            opModeStatus = OpModeStatus.RUNNING;
        }
    }

    @Override
    public void onOpModePostStop(OpMode opMode) {
        synchronized (opModeLock) {
            opModeStatus = OpModeStatus.STOPPED;
            activeOpMode = opMode;
        }
    }

    private void transferGamepad(GamepadStateMessage.GamepadButtons from, Gamepad to) {
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

    private void updateControllers(GamepadStateMessage message) {
        if (RemoteFTC.instance.opModeStatus == RemoteFTC.OpModeStatus.STOPPED || RemoteFTC.instance.activeOpMode.gamepad1.getGamepadId() != Gamepad.ID_UNASSOCIATED ||
                RemoteFTC.instance.activeOpMode.gamepad2.getGamepadId() != Gamepad.ID_UNASSOCIATED) {
            return;
        }
        transferGamepad(message.gamepad1, RemoteFTC.instance.activeOpMode.gamepad1);
        transferGamepad(message.gamepad2, RemoteFTC.instance.activeOpMode.gamepad2);
    }

    void runMessage(Message message) {
        switch (message.type) {
            case INIT_OPMODE:
                opModeManager.initActiveOpMode(((InitOpmodeMessage) message).opModeName);
                break;
            case START_OPMODE:
                opModeManager.startActiveOpMode();
                break;
            case STOP_OPMODE:
                opModeManager.stopActiveOpMode();
                break;
            case RECEIVE_GAMEPAD_STATE:
                updateControllers((GamepadStateMessage) message);
                break;
            default:
                break;
        }
    }

    public enum OpModeStatus {
        INIT,
        RUNNING,
        STOPPED
    }
}
