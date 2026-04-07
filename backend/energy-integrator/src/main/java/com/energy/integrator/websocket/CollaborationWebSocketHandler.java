package com.energy.integrator.websocket;

import com.energy.integrator.service.CollaborationRoomService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CollaborationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionNames = new ConcurrentHashMap<>();

    @Autowired
    private CollaborationRoomService collaborationRoomService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, String> payload = objectMapper.readValue(message.getPayload(), new TypeReference<>() {});
        String type = payload.getOrDefault("type", "");

        if ("join".equals(type)) {
            handleJoin(session, payload);
            return;
        }

        if ("annotation".equals(type)) {
            handleAnnotation(session, payload);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String room = sessionRooms.remove(session.getId());
        sessionNames.remove(session.getId());
        sessions.remove(session.getId());

        if (room != null) {
            Map<String, Object> state = collaborationRoomService.leaveRoom(room, session.getId());
            broadcastState(room, state);
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, String> payload) throws IOException {
        String room = payload.getOrDefault("room", "").trim();
        String displayName = payload.getOrDefault("displayName", "Guest").trim();

        if (room.isEmpty()) {
            sendMessage(session, Map.of("type", "error", "message", "Room name is required."));
            return;
        }

        sessionRooms.put(session.getId(), room);
        sessionNames.put(session.getId(), displayName.isEmpty() ? "Guest" : displayName);
        Map<String, Object> state = collaborationRoomService.joinRoom(room, session.getId(), sessionNames.get(session.getId()));
        broadcastState(room, state);
    }

    private void handleAnnotation(WebSocketSession session, Map<String, String> payload) throws IOException {
        String room = sessionRooms.get(session.getId());
        if (room == null) {
            sendMessage(session, Map.of("type", "error", "message", "Join a room before sending updates."));
            return;
        }

        String content = payload.getOrDefault("content", "").trim();
        if (content.isEmpty()) {
            return;
        }

        String author = sessionNames.getOrDefault(session.getId(), "Guest");
        Map<String, Object> state = collaborationRoomService.addUpdate(room, author, content);
        broadcastState(room, state);
    }

    private void broadcastState(String room, Map<String, Object> state) throws IOException {
        Map<String, Object> message = Map.of(
            "type", "state",
            "room", state.get("room"),
            "participants", state.get("participants"),
            "updates", state.get("updates")
        );

        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (room.equals(sessionRooms.get(entry.getKey())) && entry.getValue().isOpen()) {
                sendMessage(entry.getValue(), message);
            }
        }
    }

    private void sendMessage(WebSocketSession session, Map<String, Object> payload) throws IOException {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
    }
}
