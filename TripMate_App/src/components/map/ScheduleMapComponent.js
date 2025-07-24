import React, { useRef, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';

const ScheduleMapComponent = ({ dailyPlan, selectedDate, selectedPlace }) => {
  const mapRef = useRef(null);
  const places = selectedDate ? dailyPlan[selectedDate] || [] : [];

  // Filter places with valid coordinates first to ensure data integrity
  const validPlaces = places.filter(p =>
    (p.lat !== undefined || p.latitude !== undefined) &&
    (p.lng !== undefined || p.longitude !== undefined)
  );

  // Create the path for the Polyline from only the valid places
  const path = validPlaces.map(p => ({
    latitude: p.lat ?? p.latitude,
    longitude: p.lng ?? p.longitude,
  }));

  const initialRegion = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    if (mapRef.current) {
      if (selectedPlace) {
        const selectedPlaceCoord = {
          latitude: selectedPlace.lat ?? selectedPlace.latitude,
          longitude: selectedPlace.lng ?? selectedPlace.longitude,
        };
        // Animate only if the selected place has valid coordinates
        if (selectedPlaceCoord.latitude !== undefined && selectedPlaceCoord.longitude !== undefined) {
          mapRef.current.animateToRegion({
            ...selectedPlaceCoord,
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
    }
  }, [selectedPlace, path]); // Depend on `path` to re-fit map when it changes

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={path.length > 0 ? undefined : initialRegion}
    >
      {validPlaces.map((place, idx) => {
        const isSelected = selectedPlace && (selectedPlace.tempId === place.tempId);
        const coord = {
          latitude: place.lat ?? place.latitude,
          longitude: place.lng ?? place.longitude,
        };
        return (
          <Marker
            // Combine tempId and index to guarantee a unique key
            key={`${place.tempId}-${idx}`}
            coordinate={coord}
            title={place.name}
            description={place.address}
            pinColor={isSelected ? 'blue' : 'red'}
          />
        );
      })}

      {path.length > 1 && (
        <Polyline
          coordinates={path}
          strokeColor="#007BFF"
          strokeWidth={4}
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
