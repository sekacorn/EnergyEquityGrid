package com.energy.integrator.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class CollaborationRoomService {

    private static final int MAX_UPDATES_PER_ROOM = 50;

    private final Map<String, RoomState> rooms = new ConcurrentHashMap<>();

    public Map<String, Object> joinRoom(String room, String sessionId, String displayName) {
        RoomState state = rooms.computeIfAbsent(room, key -> new RoomState());
        state.participants.put(sessionId, displayName);
        return buildState(room, state);
    }

    public Map<String, Object> leaveRoom(String room, String sessionId) {
        RoomState state = rooms.get(room);
        if (state == null) {
            return Map.of("room", room, "participants", List.of(), "updates", List.of());
        }

        state.participants.remove(sessionId);
        if (state.participants.isEmpty() && state.updates.isEmpty()) {
            rooms.remove(room);
            return Map.of("room", room, "participants", List.of(), "updates", List.of());
        }

        return buildState(room, state);
    }

    public Map<String, Object> addUpdate(String room, String author, String content) {
        RoomState state = rooms.computeIfAbsent(room, key -> new RoomState());
        state.updates.add(new Update(author, content, Instant.now().toString()));
        while (state.updates.size() > MAX_UPDATES_PER_ROOM) {
            state.updates.remove(0);
        }
        return buildState(room, state);
    }

    public Map<String, Object> getRoomState(String room) {
        RoomState state = rooms.get(room);
        if (state == null) {
            return Map.of("room", room, "participants", List.of(), "updates", List.of());
        }
        return buildState(room, state);
    }

    private Map<String, Object> buildState(String room, RoomState state) {
        List<String> participants = new ArrayList<>(state.participants.values());
        participants.sort(String::compareToIgnoreCase);

        List<Map<String, String>> updates = new ArrayList<>();
        for (Update update : state.updates) {
            updates.add(Map.of(
                "author", update.author,
                "content", update.content,
                "timestamp", update.timestamp
            ));
        }

        return Map.of(
            "room", room,
            "participants", participants,
            "updates", updates
        );
    }

    private static class RoomState {
        private final ConcurrentHashMap<String, String> participants = new ConcurrentHashMap<>();
        private final CopyOnWriteArrayList<Update> updates = new CopyOnWriteArrayList<>();
    }

    private record Update(String author, String content, String timestamp) {}
}
