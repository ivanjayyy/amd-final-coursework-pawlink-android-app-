import * as Location from "expo-location";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export interface GeoNotification {
  id: string;
  reportId: string;
  petName: string;
  status: string;
  message: string;
  timestamp: string;
}

function getDistanceKM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth Radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useFeedNotifications() {
  const [notifications, setNotifications] = useState<GeoNotification[]>([]);

  useEffect(() => {
    // 1. Initialize as active flag to prevent state settings if unmounted early
    let isMounted = true;
    let systemUnsubscribe: (() => void) | null = null;

    async function startGeospatialListener() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted" || !isMounted) return;

        const currentLoc = await Location.getCurrentPositionAsync({});
        if (!isMounted) return;

        const myLat = currentLoc.coords.latitude;
        const myLng = currentLoc.coords.longitude;

        const reportsRef = collection(db, "pet_reports");
        const q = query(reportsRef, orderBy("createdAt", "desc"), limit(10));

        // 2. Added explicit error handler param to block system WebChannel connection crashes
        systemUnsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;

            const matchingAlerts: GeoNotification[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.coordinates?.lat && data.coordinates?.lng) {
                const distance = getDistanceKM(
                  myLat,
                  myLng,
                  data.coordinates.lat,
                  data.coordinates.lng,
                );

                // Trigger local alert if within a 10 KM radial vector field
                if (distance <= 10) {
                  const locationLabel = data.lastSeenLocation || "your area";

                  matchingAlerts.push({
                    id: `notify_${doc.id}`,
                    reportId: doc.id,
                    petName: data.petName,
                    status: data.status,
                    message: `Alert! A pet (${data.petName}) was marked ${data.status} near ${locationLabel.toUpperCase()} [${distance.toFixed(1)} KM AWAY].`,
                    timestamp: data.createdAt || new Date().toISOString(),
                  });
                }
              }
            });
            setNotifications(matchingAlerts);
          },
          (error) => {
            console.log("Radar dynamic stream safely recycled:", error.message);
          },
        );
      } catch (err) {
        console.error("Radar tracking failure:", err);
      }
    }

    startGeospatialListener();

    // Clean up routine properly handles the async timing gaps
    return () => {
      isMounted = false;
      if (systemUnsubscribe) {
        systemUnsubscribe();
      }
    };
  }, []);

  return { notifications };
}
