package com.energy.integrator.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiGatewayService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.ai.predictor-url:http://localhost:8083}")
    private String predictorBaseUrl;

    @Value("${app.ai.llm-url:http://localhost:8084}")
    private String llmBaseUrl;

    public ResponseEntity<String> predict(Map<String, Object> payload) {
        return forwardJsonRequest(predictorBaseUrl + "/predict", payload);
    }

    public ResponseEntity<String> query(Map<String, Object> payload) {
        return forwardJsonRequest(llmBaseUrl + "/query", payload);
    }

    public ResponseEntity<String> troubleshoot(Map<String, Object> payload) {
        return forwardJsonRequest(llmBaseUrl + "/troubleshoot", payload);
    }

    private ResponseEntity<String> forwardJsonRequest(String url, Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            return restTemplate.exchange(url, HttpMethod.POST, request, String.class);
        } catch (HttpStatusCodeException exception) {
            return ResponseEntity.status(exception.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(exception.getResponseBodyAsString());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"message\":\"Upstream AI service is unavailable.\"}");
        }
    }
}
