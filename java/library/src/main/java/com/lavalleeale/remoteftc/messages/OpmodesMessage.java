package com.lavalleeale.remoteftc.messages;

import com.lavalleeale.remoteftc.Message;

import org.firstinspires.ftc.robotcore.internal.opmode.OpModeMeta;

import java.util.List;

public class OpmodesMessage extends Message {
    List<OpModeMeta> opmodes;
    public OpmodesMessage(List<OpModeMeta> opmodes) {
        this.opmodes = opmodes;
        this.type = MessageType.SEND_OPMODES;
    }
}
