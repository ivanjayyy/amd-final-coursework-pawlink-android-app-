// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";

interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  imageUrl?: string;
  phoneNumbers?: string[]; // <-- Added fields
  contactEmails?: string[]; // <-- Added fields
  reward?: string; // <-- Added field
  createdAt: string;
  userEmail: string;
}

export default function FeedScreen() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<PetReport[]>([]);

  useEffect(() => {
    const reportsRef = collection(db, "pet_reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
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
        console.error(error);
        setLoading(false);
      },
    );
  }, []);

  const renderReportCard = ({ item }: { item: PetReport }) => {
    const isLost = item.status === "lost";

    return (
      <View style={styles.card}>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.cardContent}>
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

          {/* Reward Alert Banner */}
          {isLost && item.reward ? (
            <View style={styles.rewardBanner}>
              <Text style={styles.rewardText}>🎁 Reward: {item.reward}</Text>
            </View>
          ) : null}

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

          {/* Contact Details Grid */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>Contact Information:</Text>
            {item.phoneNumbers &&
              item.phoneNumbers.map((phone, i) => (
                <Text key={`p-${i}`} style={styles.contactItem}>
                  📞 {phone}
                </Text>
              ))}
            {item.contactEmails &&
              item.contactEmails.map((email, i) => (
                <Text key={`e-${i}`} style={styles.contactItem}>
                  ✉️ {email}
                </Text>
              ))}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              By: {item.userEmail ? item.userEmail.split("@")[0] : "User"}
            </Text>
            <Text style={styles.footerText}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : ""}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Community Alerts</Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No pet alerts reported yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportCard}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  signOutText: { color: "#ff4a4a", fontSize: 14, fontWeight: "600" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: { color: "#aaa", fontSize: 16 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 180, backgroundColor: "#252525" },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  petName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  lostBadge: { backgroundColor: "#d93838" },
  foundBadge: { backgroundColor: "#2e7d32" },
  statusText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  rewardBanner: {
    backgroundColor: "rgba(138, 43, 226, 0.15)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#8A2BE2",
  },
  rewardText: { color: "#b172ff", fontWeight: "bold", fontSize: 14 },
  detailsText: { color: "#ccc", fontSize: 14, marginBottom: 4 },
  boldText: { color: "#fff", fontWeight: "600" },
  descriptionText: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  contactContainer: {
    backgroundColor: "#151515",
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#252525",
  },
  contactTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  contactItem: { color: "#bbb", fontSize: 13, marginBottom: 2 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 10,
    marginTop: 12,
  },
  footerText: { color: "#666", fontSize: 12 },
});
