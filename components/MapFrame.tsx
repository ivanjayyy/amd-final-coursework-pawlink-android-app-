import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface MapFrameProps {
  loadingMap: boolean;
  mapRegion: Region | null;
  markerCoordinate: { latitude: number; longitude: number } | null;
  onRegionChange: (reg: Region) => void;
  onMapPress: (coords: { latitude: number; longitude: number }) => void;
}

export const MapFrame: React.FC<MapFrameProps> = ({
  loadingMap,
  mapRegion,
  markerCoordinate,
  onRegionChange,
  onMapPress,
}) => {
  return (
    <View style={styles.mapContainerFrame}>
      {loadingMap || !mapRegion ? (
        <View style={styles.mapLoaderPlaceholder}>
          <ActivityIndicator size="small" color="#FFD700" />
          <Text style={styles.mapLoaderText}>CALIBRATING COORD ARRAYS...</Text>
        </View>
      ) : (
        <MapView
          style={styles.actualMapStyle}
          region={mapRegion}
          onRegionChangeComplete={onRegionChange}
          onPress={(e) => onMapPress(e.nativeEvent.coordinate)}
        >
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              title="Incident Vector Point"
              pinColor="#8A2BE2"
            />
          )}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainerFrame: {
    height: 200,
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 12,
  },
  actualMapStyle: { ...StyleSheet.absoluteFillObject },
  mapLoaderPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mapLoaderText: { color: "#666", fontSize: 11, fontWeight: "700" },
});
