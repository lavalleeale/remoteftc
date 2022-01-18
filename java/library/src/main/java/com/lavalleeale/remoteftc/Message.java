package com.lavalleeale.remoteftc;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;
import com.lavalleeale.remoteftc.messages.GamepadStateMessage;
import com.lavalleeale.remoteftc.messages.InitOpmodeMessage;
import com.lavalleeale.remoteftc.messages.OpmodesMessage;
import com.lavalleeale.remoteftc.messages.StartOpmodeMessage;
import com.lavalleeale.remoteftc.messages.StatusMessage;
import com.lavalleeale.remoteftc.messages.StopOpmodeMessage;

import java.lang.reflect.Type;

public abstract class Message {
    private static final Gson gson = new GsonBuilder()
            .registerTypeAdapter(Message.class, new MessageDeserializer()).create();
    public MessageType type;

    public enum MessageType {
        SEND_OPMODES(OpmodesMessage.class),
        INIT_OPMODE(InitOpmodeMessage.class),
        START_OPMODE(StartOpmodeMessage.class),
        STOP_OPMODE(StopOpmodeMessage.class),
        SEND_STATUS(StatusMessage.class),
        RECEIVE_GAMEPAD_STATE(GamepadStateMessage.class);
        final Class<? extends Message> messageClass;

        MessageType(Class<? extends Message> messageClass) {
            this.messageClass = messageClass;
        }
    }

    public static Message fromJson(String payload) {
        return gson.fromJson(payload, Message.class);
    }

    public String toString() {
        return gson.toJson(this);
    }

    private static class MessageDeserializer implements JsonDeserializer<Message> {
        @Override
        public Message deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
            JsonObject messageObj = jsonElement.getAsJsonObject();
            MessageType messageType = jsonDeserializationContext.deserialize(messageObj.get("type"), MessageType.class);
            if (messageType == null || messageType.messageClass == null) {
                return null;
            }
            Type msgType = TypeToken.get(messageType.messageClass).getType();
            return jsonDeserializationContext.deserialize(jsonElement, msgType);
        }
    }
}
