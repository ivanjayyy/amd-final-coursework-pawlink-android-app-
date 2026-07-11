import React, { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";

// Same shape as react-native-maps' Region, redefined so we no longer
// depend on that library at all.
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapFrameProps {
  loadingMap: boolean;
  mapRegion: Region | null;
  markerCoordinate: { latitude: number; longitude: number } | null;
  onRegionChange: (reg: Region) => void;
  onMapPress: (coords: { latitude: number; longitude: number }) => void;
}

// Rough conversion so callers that read latitudeDelta/longitudeDelta
// (e.g. to show a zoom level) still get a sensible number back.
const zoomToDelta = (zoom: number) => 360 / Math.pow(2, zoom);
const deltaToZoom = (delta: number) => Math.log2(360 / delta);

const buildHtml = (lat: number, lng: number, zoom: number) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; background: #1A1A1A; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', { attributionControl: false, zoomControl: false })
        .setView([${lat}, ${lng}], ${zoom});

      // Free, no-API-key OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      let marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

      function post(msg) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }

      marker.on('dragend', () => {
        const p = marker.getLatLng();
        post({ type: 'press', latitude: p.lat, longitude: p.lng });
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        post({ type: 'press', latitude: e.latlng.lat, longitude: e.latlng.lng });
      });

      map.on('moveend', () => {
        const c = map.getCenter();
        post({ type: 'region', latitude: c.lat, longitude: c.lng, zoom: map.getZoom() });
      });

      // Called from React Native via injectJavaScript to recenter/move
      // the marker when the location changes from outside the map
      // (e.g. the search box or "use my location").
      window.setMapPoint = function (lat, lng, zoom) {
        const target = [lat, lng];
        map.setView(target, zoom || map.getZoom());
        marker.setLatLng(target);
      };
    </script>
  </body>
</html>
`;

export const MapFrame: React.FC<MapFrameProps> = ({
  loadingMap,
  mapRegion,
  markerCoordinate,
  onRegionChange,
  onMapPress,
}) => {
  const webviewRef = useRef<WebView>(null);
  const hasLoadedOnce = useRef(false);

  // Baked-in HTML only for the very first render of the map - after
  // that we move the existing map instead of re-mounting the WebView.
  const initialHtml = useMemo(() => {
    if (!mapRegion) return "";
    const zoom = deltaToZoom(mapRegion.longitudeDelta || 0.01);
    return buildHtml(mapRegion.latitude, mapRegion.longitude, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mapRegion]);

  useEffect(() => {
    if (!hasLoadedOnce.current || !mapRegion) return;
    const zoom = deltaToZoom(mapRegion.longitudeDelta || 0.01);
    webviewRef.current?.injectJavaScript(
      `window.setMapPoint && window.setMapPoint(${mapRegion.latitude}, ${mapRegion.longitude}, ${zoom}); true;`,
    );
  }, [mapRegion?.latitude, mapRegion?.longitude]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "press") {
        onMapPress({ latitude: data.latitude, longitude: data.longitude });
      } else if (data.type === "region") {
        onRegionChange({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: zoomToDelta(data.zoom),
          longitudeDelta: zoomToDelta(data.zoom),
        });
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <View style={styles.mapContainerFrame}>
      {loadingMap || !mapRegion ? (
        <View style={styles.mapLoaderPlaceholder}>
          <ActivityIndicator size="small" color="#FF9F43" />
          <Text style={styles.mapLoaderText}>CALIBRATING COORD ARRAYS...</Text>
        </View>
      ) : (
        <WebView
          ref={webviewRef}
          key="pawlink-map" // mount once; subsequent updates go through injectJavaScript
          originWhitelist={["*"]}
          source={{ html: initialHtml }}
          onLoadEnd={() => (hasLoadedOnce.current = true)}
          onMessage={handleMessage}
          style={styles.actualMapStyle}
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainerFrame: {
    height: 200,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 12,
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
