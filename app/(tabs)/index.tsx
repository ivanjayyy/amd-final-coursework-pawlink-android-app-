// app/(tabs)/index.tsx
import { signOut } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";

interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  createdAt: string;
  userEmail: string;
}

export default function FeedScreen() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<PetReport[]>([]);

  useEffect(() => {
    // 1. Point to our collection and order by newest reports first
    const reportsRef = collection(db, "pet_reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));

    // 2. Setup real-time synchronized listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReports: PetReport[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() } as PetReport);
        });
        setReports(fetchedReports);
        setLoading(false);
      },
      (error) => {
        console.error("Error reading live feed: ", error);
        setLoading(false);
      },
    );

    // Clean up listener when screen closes
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  // Individual Pet Card Component Layout
  const renderReportCard = ({ item }: { item: PetReport }) => {
    const isLost = item.status === "lost";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.petName}>{item.petName}</Text>
          <View
            style={[
              styles.statusBadge,
              isLost ? styles.lostBadge : styles.foundBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.detailsText}>
          <Text style={styles.boldText}>Species: </Text>
          {item.species} • <Text style={styles.boldText}>Breed: </Text>
          {item.breed}
        </Text>

        <Text style={styles.detailsText}>
          <Text style={styles.boldText}>Last Seen: </Text>
          {item.lastSeenLocation}
        </Text>

        <Text style={styles.descriptionText}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            Posted by: {item.userEmail.split("@")[0]}
          </Text>
          <Text style={styles.footerText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Community Alerts</Text>
        <TouchableOpacity style={styles.signOutLink} onPress={handleSignOut}>
          <Text style={styles.signOutLinkText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLayout}>
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centerLayout}>
          <Text style={styles.emptyText}>
            No pet reports found. The neighborhood is currently safe!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  signOutLink: {
    padding: 6,
  },
  signOutLinkText: {
    color: "#ff4a4a",
    fontSize: 14,
    fontWeight: "600",
  },
  centerLayout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  lostBadge: {
    backgroundColor: "#d93838",
  },
  foundBadge: {
    backgroundColor: "#2e7d32",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  detailsText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
  },
  boldText: {
    color: "#fff",
    fontWeight: "600",
  },
  descriptionText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 10,
    marginTop: 4,
  },
  footerText: {
    color: "#777",
    fontSize: 12,
  },
});
