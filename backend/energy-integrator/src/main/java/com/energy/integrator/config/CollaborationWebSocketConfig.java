package com.energy.integrator.config;

import com.energy.integrator.websocket.CollaborationWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class CollaborationWebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private CollaborationWebSocketHandler collaborationWebSocketHandler;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsRaw;

    @Value("${app.collaboration.websocket-path:/ws/collaborate}")
    private String websocketPath;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        String[] origins = allowedOriginsRaw.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        registry.addHandler(collaborationWebSocketHandler, websocketPath)
            .setAllowedOrigins(origins);
    }
}
