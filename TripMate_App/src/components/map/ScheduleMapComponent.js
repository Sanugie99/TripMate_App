import React, { useRef, useEffect, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet, Platform } from 'react-native';

const ScheduleMapComponent = ({ dailyPlan, selectedDate, selectedPlace }) => {
  const mapRef = useRef(null);
  const [isMapReady, setMapReady] = useState(false); // 🚀 [추가] 지도 준비 상태

  // 🚀 [수정] 데이터 유효성 검사를 더 강화하고, 유효한 데이터만 필터링
  const places = (dailyPlan && selectedDate && Array.isArray(dailyPlan[selectedDate]))
    ? dailyPlan[selectedDate]
    : [];

  const validPlaces = places.filter(p => {
    const lat = p.lat ?? p.latitude;
    const lng = p.lng ?? p.longitude;
    return typeof lat === 'number' && typeof lng === 'number';
  });







  const path = validPlaces.map(p => ({
    latitude: p.lat ?? p.latitude,
    longitude: p.lng ?? p.longitude,
  }));

  // 🚀 [수정] 항상 서울을 기본 지역으로 설정하여 충돌 방지
  const initialRegion = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // 🚀 [수정] 지도 준비 상태(isMapReady)와 데이터(path)가 모두 준비되었을 때만 지도 조작
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (selectedPlace) {
      const lat = selectedPlace.lat ?? selectedPlace.latitude;
      const lng = selectedPlace.lng ?? selectedPlace.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } else if (path.length > 0) {
      mapRef.current.fitToCoordinates(path, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [selectedPlace, path, isMapReady, dailyPlan, selectedDate]); // dailyPlan과 selectedDate 의존성 추가

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion} // 항상 고정된 초기 지역 사용
      onMapReady={() => setMapReady(true)} // 지도가 준비되면 상태 업데이트
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={true}
      showsBuildings={true}
      showsTraffic={false}
      showsIndoors={true}
      mapType="standard"
      loadingEnabled={true}
      loadingIndicatorColor="#007BFF"
      loadingBackgroundColor="#ffffff"
    >
      {validPlaces.map((place, idx) => { // iOS에서는 isMapReady 조건 제거
        const coord = {
          latitude: place.lat ?? place.latitude,
          longitude: place.lng ?? place.longitude,
        };

        return (
          <Marker
            key={`${place.tempId || place.id || idx}-${idx}`}
            coordinate={coord}
            title={place.name || '장소'}
            description={place.address || ''}
            pinColor={selectedPlace?.tempId === place.tempId ? 'blue' : 'red'}
            tracksViewChanges={false} // iOS에서 성능 최적화
            opacity={1}
            flat={false}
            anchor={{ x: 0.5, y: 1.0 }}
            centerOffset={{ x: 0, y: 0 }}
          />
        );
      })}

      {path.length > 1 && ( // iOS에서는 isMapReady 조건 제거
        <Polyline
          coordinates={path}
          strokeColor="#007BFF"
          strokeWidth={Platform.OS === 'ios' ? 3 : 4}
          lineDashPattern={Platform.OS === 'ios' ? [1, 0] : undefined}
          geodesic={true}
          tappable={false}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ScheduleMapComponent;
