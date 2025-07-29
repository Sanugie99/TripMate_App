package com.korea.trip.dto;

import lombok.Data;

@Data
public class TransportOption {
    private Long id;
    private String type;
    private String departure;
    private String arrival;
    private String departureTime;
    private String arrivalTime;
    private String price;
    
    public TransportOption(Long id, String type, String departure, String arrival, String departureTime, String arrivalTime, String price) {
        this.id = id;
        this.type = type;
        this.departure = departure;
        this.arrival = arrival;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.price = price;
    }
} 