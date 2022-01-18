package com.lavalleeale.remoteftc;

import android.content.Context;

import com.google.gson.Gson;
import com.qualcomm.robotcore.hardware.Gamepad;

import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.OnDestroy;
import org.firstinspires.ftc.ftccommon.internal.FtcRobotControllerWatchdogService;
import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import fi.iki.elonen.NanoWSD;

public class Webserver extends NanoWSD {
    public Websocket socket;
    public static final List<Websocket> sockets = new ArrayList<>();

    public Webserver() throws IOException {
        super(6969);
        start();
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        socket = new Websocket(handshake);
        return socket;
    }

    void sendAll(Message payload) {
        for (Websocket socket : sockets) {
            socket.send(payload);
        }
    }
}
