package com.lavalleeale.remoteftc.messages;

import com.lavalleeale.remoteftc.Message;
import com.lavalleeale.remoteftc.RemoteFTC;

public class StatusMessage extends Message {
    public String opModeName;
    public RemoteFTC.OpModeStatus status;
    public String warningMessage;
    public String errorMessage;

    public StatusMessage(String opModeName, RemoteFTC.OpModeStatus status, String warningMessage, String errorMessage) {
        this.opModeName = opModeName;
        this.status = status;
        this.warningMessage = warningMessage;
        this.errorMessage = errorMessage;
        this.type = MessageType.SEND_STATUS;
    }
}
