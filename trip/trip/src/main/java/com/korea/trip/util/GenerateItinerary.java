
package com.korea.trip.util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.korea.trip.dto.MultiDayScheduleResponse;
import com.korea.trip.dto.PlaceDTO;
import com.korea.trip.dto.ScheduleResponse;

@Component
public class GenerateItinerary {

    private final KakaoPlaceUtil kakaoPlaceUtil;

    public GenerateItinerary(KakaoPlaceUtil kakaoPlaceUtil) {
        this.kakaoPlaceUtil = kakaoPlaceUtil;
    }

    public ScheduleResponse generate(String departure, String arrival, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, String transportType) {
        String dateString = startTime.toLocalDate().toString();

        // 1. 관광지(AT4) 검색
        List<PlaceDTO> attractions = kakaoPlaceUtil.searchPlaces(arrival + " 관광지", "AT4");
        
        // --- ERROR FIX: Return empty schedule if no attractions are found ---
        if (attractions.isEmpty()) {
            return buildScheduleResponse(departure, arrival, dateString, Collections.emptyList());
        }

        // 2. 기준점: 첫 번째 관광지
        PlaceDTO base = attractions.get(0);
        double MAX_DISTANCE_KM = 20.0;

        // 3. 관광지 필터링
        List<PlaceDTO> selectedAttractions = attractions.stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        // 4. 음식점(FD6), 카페(CE7) 검색 및 필터링
        List<PlaceDTO> selectedRestaurants = kakaoPlaceUtil.searchPlaces(arrival, "FD6").stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        List<PlaceDTO> selectedCafes = kakaoPlaceUtil.searchPlaces(arrival, "CE7").stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        // 5. 장소 통합 및 우선순위 정렬
        List<PlaceDTO> all = new ArrayList<>();
        all.addAll(selectedAttractions);
        all.addAll(selectedRestaurants);
        all.addAll(selectedCafes);

        Map<String, Integer> priority = Map.of("AT4", 1, "FD6", 2, "CE7", 3);
        all.sort(Comparator.comparingInt(p -> priority.getOrDefault(p.getCategoryCode(), 99)));

        // 6. 최종 일정 반환
        return buildScheduleResponse(departure, arrival, dateString, all);
    }

    private ScheduleResponse buildScheduleResponse(String departure, String arrival, String date, List<PlaceDTO> places) {
        ScheduleResponse response = new ScheduleResponse();
        response.setTitle(departure + " → " + arrival + " 추천 장소");
        response.setDate(date);
        response.setPlaces(places);
        return response;
    }

    private double getDistance(PlaceDTO p1, PlaceDTO p2) {
        final int EARTH_RADIUS = 6371;
        double lat1 = Math.toRadians(p1.getLat());
        double lng1 = Math.toRadians(p1.getLng());
        double lat2 = Math.toRadians(p2.getLat());
        double lng2 = Math.toRadians(p2.getLng());
        double dLat = lat2 - lat1;
        double dLng = lng2 - lng1;
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    public MultiDayScheduleResponse generateMultiDaySchedule(String departure, String arrival, String startDateStr, int days) {
        LocalDate startDate = LocalDate.parse(startDateStr);
        Map<String, List<PlaceDTO>> dailyPlan = new LinkedHashMap<>();
        Set<PlaceDTO> usedPlaces = new HashSet<>();

        for (int i = 0; i < days; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            List<PlaceDTO> dayPlaces = recommendDailyPlaces(arrival, usedPlaces);
            usedPlaces.addAll(dayPlaces);
            dailyPlan.put(currentDate.toString(), dayPlaces);
        }

        MultiDayScheduleResponse response = new MultiDayScheduleResponse();
        response.setTitle(departure + " → " + arrival + " " + days + "일 여행 일정");
        response.setDailyPlan(dailyPlan);
        return response;
    }

    private List<PlaceDTO> recommendDailyPlaces(String locationKeyword, Set<PlaceDTO> excludedPlaces) {
        List<PlaceDTO> places = new ArrayList<>();
        places.addAll(findDistinctPlaces(locationKeyword + " 관광지", "AT4", 2, excludedPlaces));
        places.addAll(findDistinctPlaces(locationKeyword + " 맛집", "FD6", 3, excludedPlaces));
        places.addAll(findDistinctPlaces(locationKeyword + " 카페", "CE7", 2, excludedPlaces));
        return places;
    }

    private List<PlaceDTO> findDistinctPlaces(String keyword, String category, int count, Set<PlaceDTO> excludedPlaces) {
        List<PlaceDTO> candidates = kakaoPlaceUtil.searchPlaces(keyword, category);
        return candidates.stream()
                .filter(p -> !excludedPlaces.contains(p))
                .limit(count)
                .collect(Collectors.toList());
    }
}
