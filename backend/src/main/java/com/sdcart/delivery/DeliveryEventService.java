package com.sdcart.delivery;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * In-process SSE broker. Maintains two registries:
 * <ul>
 *   <li>Per delivery-person channel (keyed by user ID) — used to push new order assignments.</li>
 *   <li>Per order channel (keyed by order public-id string) — used to push delivery status
 *       changes to any subscriber watching a specific order (customer, admin).</li>
 * </ul>
 * This is a single-instance solution. For multi-instance deployments, replace
 * the in-memory sets with a Redis pub/sub channel.
 */
@Slf4j
@Service
public class DeliveryEventService {

    private static final long SSE_TIMEOUT_MS = 5 * 60 * 1000L; // 5 minutes

    // userId → set of active emitters
    private final Map<Long, Set<SseEmitter>> deliveryChannels = new ConcurrentHashMap<>();
    // orderPublicId → set of active emitters
    private final Map<String, Set<SseEmitter>> orderChannels = new ConcurrentHashMap<>();

    // -------------------------------------------------------------------------
    // Delivery person channel
    // -------------------------------------------------------------------------

    public SseEmitter subscribeDelivery(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        Set<SseEmitter> emitters = deliveryChannels.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>());
        emitters.add(emitter);

        Runnable cleanup = () -> {
            deliveryChannels.computeIfPresent(userId, (k, v) -> { v.remove(emitter); return v.isEmpty() ? null : v; });
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        sendKeepAlive(emitter);
        return emitter;
    }

    public void pushToDeliveryPerson(Long userId, String eventName, Object data) {
        Set<SseEmitter> emitters = deliveryChannels.getOrDefault(userId, Set.of());
        send(emitters, eventName, data, userId + " (delivery)");
    }

    // -------------------------------------------------------------------------
    // Order channel (watched by customer / admin tracking a specific order)
    // -------------------------------------------------------------------------

    public SseEmitter subscribeOrder(String orderPublicId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        Set<SseEmitter> emitters = orderChannels.computeIfAbsent(orderPublicId, k -> new CopyOnWriteArraySet<>());
        emitters.add(emitter);

        Runnable cleanup = () -> {
            orderChannels.computeIfPresent(orderPublicId, (k, v) -> { v.remove(emitter); return v.isEmpty() ? null : v; });
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        sendKeepAlive(emitter);
        return emitter;
    }

    public void pushToOrderSubscribers(String orderPublicId, String eventName, Object data) {
        Set<SseEmitter> emitters = orderChannels.getOrDefault(orderPublicId, Set.of());
        send(emitters, eventName, data, "order:" + orderPublicId);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void send(Set<SseEmitter> emitters, String eventName, Object data, String channelLabel) {
        Set<SseEmitter> dead = ConcurrentHashMap.newKeySet();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                dead.add(emitter);
                log.debug("SSE send failed for channel {} — removing stale emitter", channelLabel);
            }
        }
        emitters.removeAll(dead);
    }

    private void sendKeepAlive(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ignored) {
            // ignored — client will reconnect
        }
    }
}
