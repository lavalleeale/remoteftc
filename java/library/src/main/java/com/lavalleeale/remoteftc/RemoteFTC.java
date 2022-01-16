package com.lavalleeale.remoteftc;

import android.content.Context;

import com.qualcomm.ftccommon.FtcEventLoop;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;

import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.OnCreateEventLoop;
import org.firstinspires.ftc.ftccommon.external.OnDestroy;
import org.firstinspires.ftc.ftccommon.internal.FtcRobotControllerWatchdogService;
import org.firstinspires.ftc.robotcore.internal.opmode.OpModeManagerImpl;
import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.IOException;

public class RemoteFTC implements OpModeManagerImpl.Notifications {
    public static RemoteFTC instance;
    public Webserver webserver;
    private final Object opModeLock = new Object();
    public OpMode activeOpMode;
    public OpModeStatus opModeStatus;
    public OpModeManagerImpl opModeManager;

    public RemoteFTC() {
        try {
            webserver = new Webserver();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

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

        if (RemoteFTC.instance != null) {
            RemoteFTC.instance.webserver.stop();
            RemoteFTC.instance = null;
        }
    }

    @OnCreateEventLoop
    public static void attachEventLoop(Context context, FtcEventLoop eventLoop) {
        if (RemoteFTC.instance.opModeManager != null) {
            RemoteFTC.instance.opModeManager.unregisterListener(RemoteFTC.instance);
        }

        RemoteFTC.instance.opModeManager = eventLoop.getOpModeManager();
        if (RemoteFTC.instance.opModeManager != null) {
            RemoteFTC.instance.opModeManager.registerListener(RemoteFTC.instance);
        }
    }

    @Override
    public void onOpModePreInit(OpMode opMode) {
        synchronized (opModeLock) {
            opModeStatus = OpModeStatus.INIT;
            activeOpMode = opMode;
        }
    }

    @Override
    public void onOpModePreStart(OpMode opMode) {
        synchronized (opModeLock) {
            opModeStatus = OpModeStatus.RUNNING;
            activeOpMode = opMode;
        }
    }

    @Override
    public void onOpModePostStop(OpMode opMode) {
        synchronized (opModeLock) {
            opModeStatus = OpModeStatus.STOPPED;
            activeOpMode = opMode;
        }
    }
    enum OpModeStatus {
        INIT,
        RUNNING,
        STOPPED
    }
}
