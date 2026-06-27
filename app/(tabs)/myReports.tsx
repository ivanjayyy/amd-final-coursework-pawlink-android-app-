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
      "DELETE REPORT",
      "Are you sure you want to permanently remove this pet report alert?",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "DELETE",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "pet_reports", reportId));
              Alert.alert("SUCCESS", "Report removed successfully.");
            } catch (err: any) {
              Alert.alert(
                "ERROR",
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

          <View style={styles.cardFooter}>
            <Text style={styles.footerDate}>
              FILED:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : ""}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteReport(item.id)}
            >
              <Text style={styles.deleteButtonText}>REMOVE POST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>MY POSTINGS</Text>
      </View>

      {loading ? (
        <View style={styles.centerLayout}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : myReports.length === 0 ? (
        <View style={styles.centerLayout}>
          <Text style={styles.emptyText}>
            YOU HAVEN'T SUBMITTED ANY PET REPORTS YET.
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 4,
    borderColor: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFD700", // Yellow accent text
    letterSpacing: 2,
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
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF", // High contrast white
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
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#EAEAEA",
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  petName: {
    fontSize: 20,
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
  lostBadge: {
    backgroundColor: "#FF4A4A",
  },
  foundBadge: {
    backgroundColor: "#2E7D32",
  },
  statusText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  detailsText: {
    color: "#222222",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  boldText: {
    color: "#000000",
    fontWeight: "900",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 12,
    marginTop: 12,
  },
  footerDate: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#FF4A4A",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
  deleteButtonText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
