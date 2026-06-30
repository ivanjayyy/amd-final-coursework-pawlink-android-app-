import { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
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
    let systemUnsubscribe: () => void;

    async function startGeospatialListener() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;

      const currentLoc = await Location.getCurrentPositionAsync({});
      const myLat = currentLoc.coords.latitude;
      const myLng = currentLoc.coords.longitude;

      const reportsRef = collection(db, "pet_reports");
      const q = query(reportsRef, orderBy("createdAt", "desc"), limit(10));

      systemUnsubscribe = onSnapshot(q, (snapshot) => {
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
              // Fallback string if lastSeenLocation is missing from an old document
              const locationLabel = data.lastSeenLocation || "your area";

              matchingAlerts.push({
                id: `notify_${doc.id}`,
                reportId: doc.id,
                petName: data.petName,
                status: data.status,
                // Added the human-readable site location directly into the string:
                message: `Alert! A pet (${data.petName}) was marked ${data.status} near ${locationLabel.toUpperCase()} [${distance.toFixed(1)} KM AWAY].`,
                timestamp: data.createdAt || new Date().toISOString(),
              });
            }
          }
        });
        setNotifications(matchingAlerts);
      });
    }

    startGeospatialListener();
    return () => systemUnsubscribe && systemUnsubscribe();
  }, []);

  return { notifications };
}
