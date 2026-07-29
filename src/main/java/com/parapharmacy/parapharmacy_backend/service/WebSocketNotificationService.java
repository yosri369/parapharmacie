package com.parapharmacy.parapharmacy_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Sends real-time WebSocket updates to the Angular frontend.
 * The Angular client subscribes to /topic/generation/{taskId}
 * and receives JSON progress events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a progress update for a specific task.
     * @param taskId    The UUID of the GenerationTask
     * @param step      Current step name (e.g. "Removing background...")
     * @param progress  0–100 percent
     * @param status    PENDING | PROCESSING | COMPLETED | FAILED
     */
    public void sendProgress(UUID taskId, String step, int progress, String status) {
        String destination = "/topic/generation/" + taskId.toString();
        Map<String, Object> payload = Map.of(
            "taskId", taskId.toString(),
            "step", step,
            "progress", progress,
            "status", status
        );
        log.debug("WebSocket → {} | step={} progress={}%", destination, step, progress);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Sends the final completed poster data to the client.
     */
    public void sendCompletion(UUID taskId, String resultImageUrl, String headline,
                               String caption, String hashtags, String cutoutUrl) {
        String destination = "/topic/generation/" + taskId.toString();
        Map<String, Object> payload = Map.of(
            "taskId", taskId.toString(),
            "status", "COMPLETED",
            "progress", 100,
            "step", "Génération terminée !",
            "resultImageUrl", resultImageUrl,
            "cutoutUrl", cutoutUrl != null ? cutoutUrl : "",
            "headline", headline,
            "caption", caption,
            "hashtags", hashtags
        );
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Sends an error event to the client.
     */
    public void sendError(UUID taskId, String errorMessage) {
        String destination = "/topic/generation/" + taskId.toString();
        Map<String, Object> payload = Map.of(
            "taskId", taskId.toString(),
            "status", "FAILED",
            "progress", 0,
            "step", "Erreur de génération",
            "error", errorMessage
        );
        messagingTemplate.convertAndSend(destination, payload);
    }
}
