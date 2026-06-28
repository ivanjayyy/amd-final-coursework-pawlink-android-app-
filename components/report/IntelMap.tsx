// components/report/IntelMap.tsx
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface Props {
  currentAddress: string;
  onLocationResolved: (address: string) => void;
  onCoordinatesChanged: (
    coords: { latitude: number; longitude: number } | null,
  ) => void;
}

export default function IntelMap({
  currentAddress,
  onLocationResolved,
  onCoordinatesChanged,
}: Props) {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    initializeCurrentLocation();
  }, []);

  const initializeCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        onLocationResolved("Location manually designated by agent");
        return;
      }
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      setMapRegion(region);
      const coords = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      };
      setMarkerCoordinate(coords);
      onCoordinatesChanged(coords);
      reverseGeocode(coords.latitude, coords.longitude);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMap(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Set a race condition or handle native rejection gracefully
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (res && res.length > 0) {
        const p = res[0];
        // Construct an elegant address backup structure
        const formattedAddress = `${p.name ? p.name + ", " : ""}${p.subregion || p.city || "Sector Grid Location"}`;
        onLocationResolved(formattedAddress);
      } else {
        // Fallback if array returns completely empty
        onLocationResolved(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      console.warn(
        "Geocoding service timed out or dropped connection. Using fallback coordinates.",
      );
      // Fallback directly to flat raw coordinate data instead of crashing out the screen
      onLocationResolved(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await Location.geocodeAsync(searchQuery.trim());
    if (results && results.length > 0) {
      const point = results[0];
      setMapRegion({
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
      setMarkerCoordinate({
        latitude: point.latitude,
        longitude: point.longitude,
      });
      onCoordinatesChanged({
        latitude: point.latitude,
        longitude: point.longitude,
      });
      onLocationResolved(searchQuery.trim());
    }
  };

  return (
    <View>
      <Text style={styles.label}>LAST SEEN INCIDENT VECTOR MAP *</Text>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.input}
          placeholder="SEARCH SECTOR LOCATION..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.scanBtn} onPress={handleSearch}>
          <Text style={styles.scanBtnText}>SCAN</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapFrame}>
        {loadingMap || !mapRegion ? (
          <ActivityIndicator size="small" color="#FFD700" />
        ) : (
          <MapView
            style={StyleSheet.absoluteFillObject}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={(e) => {
              const c = e.nativeEvent.coordinate;
              setMarkerCoordinate(c);
              onCoordinatesChanged(c);
              reverseGeocode(c.latitude, c.longitude);
            }}
          >
            {markerCoordinate && (
              <Marker coordinate={markerCoordinate} pinColor="#8A2BE2" />
            )}
          </MapView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  } as ViewStyle,
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    color: "#000",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000",
    fontWeight: "700",
  } as TextStyle,
  scanBtn: {
    backgroundColor: "#FFD700",
    borderWidth: 3,
    borderColor: "#000",
    padding: 14,
    borderRadius: 4,
  } as ViewStyle,
  scanBtnText: { color: "#000", fontWeight: "900" } as TextStyle,
  mapFrame: {
    height: 200,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  } as ViewStyle,
});
