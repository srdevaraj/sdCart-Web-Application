package com.sdcart.delivery;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Allows any authenticated user (customer, admin) to subscribe to
 * real-time delivery status events for a specific order.
 *
 * <p>The client connects via {@code EventSource("/api/v1/delivery/order-events/{orderPublicId}")}
 * and receives {@code delivery_status_updated} events as the delivery person advances
 * through the delivery lifecycle.
 */
@RestController
@RequestMapping("/api/v1/delivery")
public class DeliveryOrderEventController {

    private final DeliveryEventService deliveryEventService;

    public DeliveryOrderEventController(DeliveryEventService deliveryEventService) {
        this.deliveryEventService = deliveryEventService;
    }

    @GetMapping(value = "/order-events/{orderPublicId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrderEvents(@PathVariable String orderPublicId) {
        return deliveryEventService.subscribeOrder(orderPublicId);
    }
}
