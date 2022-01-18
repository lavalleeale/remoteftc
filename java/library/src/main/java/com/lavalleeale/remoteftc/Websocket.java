package com.lavalleeale.remoteftc;

import com.lavalleeale.remoteftc.messages.OpmodesMessage;

import java.io.IOException;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

public class Websocket extends NanoWSD.WebSocket {
    Websocket(NanoHTTPD.IHTTPSession handshakeRequest) {
        super(handshakeRequest);
    }

    @Override
    protected void onOpen() {
        Webserver.sockets.add(this);
        this.send(new OpmodesMessage(RemoteFTC.instance.opModesList));
    }

    @Override
    protected void onClose(NanoWSD.WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
        Webserver.sockets.remove(this);
    }

    public void send(Message message) {
        try {
            this.send(message.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onMessage(NanoWSD.WebSocketFrame message) {
        Message decodedMessage = Message.fromJson(message.getTextPayload());
        RemoteFTC.instance.runMessage(decodedMessage);
    }

    @Override
    protected void onPong(NanoWSD.WebSocketFrame pong) {
    }

    @Override
    protected void onException(IOException exception) {

    }
}