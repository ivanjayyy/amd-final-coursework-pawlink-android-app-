// app/(tabs)/myReports.tsx
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export default function MyReportsScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState<PetReport[]>([]);

  useEffect(() => {
    if (!user) return;

    // Query pet_reports where userId matches the logged-in user's UID
    const reportsRef = collection(db, "pet_reports");
    const q = query(
      reportsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReports: PetReport[] = [];
        snapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() } as PetReport);
        });
        setMyReports(fetchedReports);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching your reports: ", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const handleDeleteReport = (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to permanently remove this pet report alert?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "pet_reports", reportId));
              Alert.alert("Success", "Report removed successfully.");
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.message || "Could not delete the report.",
              );
            }
          },
        },
      ],
    );
  };

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

          <Text style={styles.detailsText}>
            <Text style={styles.boldText}>Species: </Text>
            {item.species} • <Text style={styles.boldText}>Breed: </Text>
            {item.breed}
          </Text>

          <Text style={styles.detailsText}>
            <Text style={styles.boldText}>Last Seen: </Text>
            {item.lastSeenLocation}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerDate}>
              Posted on:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : ""}
            </Text>
            <TouchableOpacity
              style={styles.deleteLink}
              onPress={() => handleDeleteReport(item.id)}
            >
              <Text style={styles.deleteLinkText}>Remove Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Postings</Text>
      </View>

      {loading ? (
        <View style={styles.centerLayout}>
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : myReports.length === 0 ? (
        <View style={styles.centerLayout}>
          <Text style={styles.emptyText}>
            You haven't submitted any pet reports yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myReports}
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
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#252525",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  },
  detailsText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  boldText: {
    color: "#fff",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 12,
    marginTop: 12,
  },
  footerDate: {
    color: "#666",
    fontSize: 12,
  },
  deleteLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteLinkText: {
    color: "#ff4a4a",
    fontSize: 13,
    fontWeight: "600",
  },
});
