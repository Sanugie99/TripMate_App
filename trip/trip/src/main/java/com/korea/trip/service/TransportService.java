package com.korea.trip.service;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.Comparator;

import org.springframework.stereotype.Service;

import com.korea.trip.dto.BusInfo;
import com.korea.trip.dto.KorailInfo;
import com.korea.trip.dto.TransportRequest;
import com.korea.trip.dto.TransportResult;
import com.korea.trip.dto.TransportOption;
import com.korea.trip.dto.TransportPageResponse;
import com.korea.trip.dto.TerminalInfo;
import com.korea.trip.util.BusUtil;
import com.korea.trip.util.KorailUtil;
import com.korea.trip.dto.StationInfo;

import jakarta.annotation.PostConstruct;

@Service
public class TransportService {

    private final KorailUtil korailUtil;
    private final BusUtil busUtil;

    private Map<String, List<TerminalInfo>> busTerminalMap;
    private Map<String, List<StationInfo>> korailStationMap;

    public TransportService(KorailUtil korailUtil, BusUtil busUtil) {
        this.korailUtil = korailUtil;
        this.busUtil = busUtil;
    }

    @PostConstruct
    public void init() {
        this.busTerminalMap = busUtil.fetchTerminalMap();
        System.out.println("버스터미널 목록: " + busTerminalMap.keySet());

        this.korailStationMap = korailUtil.getCityStationMap();
        System.out.println("코레일 역 목록: " + korailStationMap.keySet());
    }

    public TransportResult recommendTransport(TransportRequest request) {
        // 출발지, 도착지 도시명 정규화
        String depCity = korailUtil.simplifyCityName(request.getDeparture());
        String arrCity = korailUtil.simplifyCityName(request.getArrival());
        String date = formatDate(request.getDate());
        String departureTime = request.getDepartureTime(); // 출발시간

        System.out.println("요청 출발 도시 (정규화): " + depCity);
        System.out.println("요청 도착 도시 (정규화): " + arrCity);
        System.out.println("요청 날짜: " + date);
        System.out.println("요청 출발시간: " + departureTime);

        if (departureTime != null && !departureTime.trim().isEmpty()) {
            System.out.println("✅ 출발시간 필터링 적용: " + departureTime + " 이후 출발편만 표시");
        } else {
            System.out.println("ℹ️ 출발시간 필터링 미적용: 모든 출발편 표시");
        }

        // 🚌 버스
        List<String> busDepIds = busUtil.getTerminalIdsByCity(depCity);
        List<String> busArrIds = busUtil.getTerminalIdsByCity(arrCity);

        List<CompletableFuture<List<BusInfo>>> busFutures = new ArrayList<>();
        for (String depId : busDepIds) {
            for (String arrId : busArrIds) {
                busFutures.add(busUtil.fetchBusAsync(depId, arrId, date));
            }
        }
        CompletableFuture.allOf(busFutures.toArray(new CompletableFuture[0])).join();

        List<BusInfo> busResults = busFutures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .toList();

        List<String> busList = busResults.stream()
            .filter(bus -> bus.getDepPlandTime().length() >= 12 && bus.getArrPlandTime().length() >= 12)
            .filter(bus -> filterByDepartureTime(bus.getDepPlandTime(), departureTime))
            .sorted(Comparator.comparing(BusInfo::getDepPlandTime))
            .map(bus -> String.format("%s | %s → %s | %s → %s | %d원",
                bus.getGradeNm(),
                bus.getDepPlaceNm(),
                bus.getArrPlaceNm(),
                bus.getDepPlandTime().substring(8, 12),
                bus.getArrPlandTime().substring(8, 12),
                bus.getCharge()))
            .toList();

        System.out.println("🚌 버스 필터링 결과: " + busList.size() + "개");

        // 🚄 코레일 - 주요역 목록 가져오기
        List<StationInfo> depStations = korailUtil.getMajorStationsByCityKeyword(depCity);
        List<StationInfo> arrStations = korailUtil.getMajorStationsByCityKeyword(arrCity);

        System.out.println("출발지 주요역 목록: " + depStations);
        System.out.println("도착지 주요역 목록: " + arrStations);

        List<CompletableFuture<List<KorailInfo>>> korailFutures = new ArrayList<>();
        for (StationInfo depStation : depStations) {
            for (StationInfo arrStation : arrStations) {
                korailFutures.add(korailUtil.fetchKorailAsync(depStation.getStationCode(), arrStation.getStationCode(), date));
            }
        }
        CompletableFuture.allOf(korailFutures.toArray(new CompletableFuture[0])).join();

        List<KorailInfo> korailResults = korailFutures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .toList();

        List<String> korailList = korailResults.stream()
            .filter(train -> train.getDepPlandTime().length() >= 12 && train.getArrPlandTime().length() >= 12)
            .filter(train -> filterByDepartureTime(train.getDepPlandTime(), departureTime))
            .sorted(Comparator.comparing(KorailInfo::getDepPlandTime))
            .map(train -> String.format("%s | %s역 → %s역 | %s → %s | %d원",
                train.getTrainGrade(),
                train.getDepStationName(),
                train.getArrStationName(),
                train.getDepPlandTime().substring(8, 12),
                train.getArrPlandTime().substring(8, 12),
                train.getAdultcharge()))
            .toList();

        System.out.println("🚄 기차 필터링 결과: " + korailList.size() + "개");

        TransportResult result = new TransportResult();
        result.setBusOptions(busList.isEmpty() ? List.of("해당 날짜에 버스 정보가 없습니다.") : busList);
        result.setKorailOptions(korailList.isEmpty() ? List.of("해당 날짜에 열차 정보가 없습니다.") : korailList);

        return result;
    }

    public TransportPageResponse recommendTransportWithPagination(TransportRequest request, int page, int size) {
        TransportResult result = recommendTransport(request);
        
        List<TransportOption> allOptions = new ArrayList<>();
        
        // 기차 옵션 변환
        for (int i = 0; i < result.getKorailOptions().size(); i++) {
            String option = result.getKorailOptions().get(i);
            if (!option.contains("해당 날짜에")) {
                allOptions.add(parseTransportOption(option, "기차", (long) (i + 1)));
            }
        }
        
        // 버스 옵션 변환
        for (int i = 0; i < result.getBusOptions().size(); i++) {
            String option = result.getBusOptions().get(i);
            if (!option.contains("해당 날짜에")) {
                allOptions.add(parseTransportOption(option, "버스", (long) (result.getKorailOptions().size() + i + 1)));
            }
        }
        
        // 페이지네이션 적용
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, allOptions.size());
        
        List<TransportOption> pageContent = allOptions.subList(startIndex, endIndex);
        int totalPages = (int) Math.ceil((double) allOptions.size() / size);
        
        return new TransportPageResponse(pageContent, totalPages, allOptions.size(), page, size);
    }

    private TransportOption parseTransportOption(String optionString, String type, Long id) {
        // 예: "KTX | 서울역 → 부산역 | 1023 → 1335 | 59800원"
        String[] parts = optionString.split(" \\| ");
        if (parts.length >= 4) {
            String transportType = parts[0];
            String route = parts[1];
            String time = parts[2];
            String price = parts[3];
            
            String[] routeParts = route.split(" → ");
            String departure = routeParts[0].replace("역", "");
            String arrival = routeParts[1].replace("역", "");
            
            String[] timeParts = time.split(" → ");
            String departureTime = formatTime(timeParts[0]);
            String arrivalTime = formatTime(timeParts[1]);
            
            return new TransportOption(id, transportType, departure, arrival, departureTime, arrivalTime, price);
        }
        
        // 파싱 실패 시 기본값 반환
        return new TransportOption(id, type, "출발지", "도착지", "00:00", "00:00", "0원");
    }

    private String formatTime(String time) {
        // "1023" -> "10:23"
        if (time.length() == 4) {
            return time.substring(0, 2) + ":" + time.substring(2, 4);
        }
        return time;
    }

    private String formatDate(String rawDate) {
        LocalDate date;
        
        // yyyy-MM-dd 형식인지 확인
        if (rawDate.contains("-")) {
            DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            date = LocalDate.parse(rawDate, inputFormatter);
        } else {
            // yyyyMMdd 형식
            DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            date = LocalDate.parse(rawDate, inputFormatter);
        }
        
        return date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    /**
     * 출발시간 필터링 메서드
     * @param apiDepartureTime API에서 받은 출발시간 (yyyyMMddHHmm 형식)
     * @param requestedTime 사용자가 요청한 출발시간 (HH:mm 형식)
     * @return 필터링 통과 여부
     */
    private boolean filterByDepartureTime(String apiDepartureTime, String requestedTime) {
        if (requestedTime == null || requestedTime.trim().isEmpty()) {
            return true;
        }

        try {
            String apiTime = apiDepartureTime.substring(8, 12);
            String[] timeParts = requestedTime.split(":");
            String requestedTimeFormatted = String.format("%02d%02d",
                Integer.parseInt(timeParts[0]), Integer.parseInt(timeParts[1]));

            int apiTimeInt = Integer.parseInt(apiTime);
            int requestedTimeInt = Integer.parseInt(requestedTimeFormatted);

            return apiTimeInt >= requestedTimeInt;

        } catch (Exception e) {
            System.err.println("시간 필터링 오류: " + e.getMessage());
            return true;
        }
    }
}
