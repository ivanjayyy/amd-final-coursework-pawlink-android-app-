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
  phoneNumbers?: string[];
  contactEmails?: string[];
  reward?: string;
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.petName}>{item.petName.toUpperCase()}</Text>
            <View
              style={[
                styles.statusBadge,
                isLost ? styles.lostBadge : styles.foundBadge,
              ]}
            >
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Comic Style Reward Banner */}
          {isLost && item.reward ? (
            <View style={styles.rewardBanner}>
              <Text style={styles.rewardText}>
                🎁 REWARD: {item.reward.toUpperCase()}
              </Text>
            </View>
          ) : null}

          <Text style={styles.detailsText}>
            <Text style={styles.boldText}>SPECIES: </Text>
            {item.species.toUpperCase()} •{" "}
            <Text style={styles.boldText}>BREED: </Text>
            {item.breed.toUpperCase()}
          </Text>

          <Text style={styles.detailsText}>
            <Text style={styles.boldText}>LAST SEEN: </Text>
            {item.lastSeenLocation.toUpperCase()}
          </Text>

          <Text style={styles.descriptionText}>{item.description}</Text>

          {/* Graphic Panel Contact Grid */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>CONTACT INTEL:</Text>
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
              AGENT:{" "}
              {item.userEmail
                ? item.userEmail.split("@")[0].toUpperCase()
                : "HERO"}
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
      {/* Big Comic Style Header */}
      <View style={styles.comicHeaderContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>PAWLINK</Text>
        </View>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>COMMUNITY ALERTS</Text>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => signOut(auth)}
          >
            <Text style={styles.signOutText}>LEAVE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            NO PET ALERTS ACTIVE IN THIS SECTOR.
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
  container: { flex: 1, backgroundColor: "#121212" },
  comicHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 4,
    borderColor: "#000000",
  },
  logoBadge: {
    backgroundColor: "#FFD700", // Bright golden comic yellow
    borderWidth: 4,
    borderColor: "#000000",
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 4,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 8,
  },
  logoText: {
    color: "#000000",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 4,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1.5,
  },
  signOutBtn: {
    backgroundColor: "#FF4A4A",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  signOutText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF", // High contrast white interior panels
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#000000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
  },
  imageContainer: {
    borderBottomWidth: 3,
    borderColor: "#000000",
  },
  cardImage: { width: "100%", height: 200, backgroundColor: "#EAEAEA" },
  cardContent: { padding: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  petName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
  },
  lostBadge: { backgroundColor: "#FF4A4A" },
  foundBadge: { backgroundColor: "#2E7D32" },
  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  rewardBanner: {
    backgroundColor: "#FFFDE6", // Halftone cream style pop banner
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
  rewardText: {
    color: "#FF4A4A",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  detailsText: {
    color: "#222222",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  boldText: { color: "#000000", fontWeight: "900" },
  descriptionText: {
    color: "#444444",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  contactContainer: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 2,
    borderColor: "#000000",
  },
  contactTitle: {
    color: "#8A2BE2",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 1,
  },
  contactItem: {
    color: "#111",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 10,
    marginTop: 12,
  },
  footerText: { color: "#666", fontSize: 11, fontWeight: "700" },
});
