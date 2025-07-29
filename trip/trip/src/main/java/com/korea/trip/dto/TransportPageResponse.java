package com.korea.trip.dto;

import java.util.List;
import lombok.Data;

@Data
public class TransportPageResponse {
    private List<TransportOption> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int size;
    
    public TransportPageResponse(List<TransportOption> content, int totalPages, long totalElements, int currentPage, int size) {
        this.content = content;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.currentPage = currentPage;
        this.size = size;
    }
} 