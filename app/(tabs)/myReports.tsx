import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";
import { PetReport } from "../../services/flyerService";
import { ReportCard } from "../../components/MyReportCard";
import { EditReportModal } from "../../components/EditReportModal";

export default function MyReportsScreen() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState<PetReport[]>([]);
  const [editingReport, setEditingReport] = useState<PetReport | null>(null);

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

  const handleUpdateReport = async (
    id: string,
    updatedFields: Partial<PetReport>,
  ) => {
    try {
      const docRef = doc(db, "pet_reports", id);
      await updateDoc(docRef, updatedFields);
      Alert.alert("UPDATED", "Intel grid records adjusted successfully.");
      setEditingReport(null);
    } catch (err: any) {
      Alert.alert("UPDATE FAILED", err.message || "Could not update details.");
    }
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
          renderItem={({ item }) => (
            <ReportCard
              item={item}
              onEdit={setEditingReport}
              onDelete={handleDeleteReport}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <EditReportModal
        visible={editingReport !== null}
        report={editingReport}
        onClose={() => setEditingReport(null)}
        onSave={handleUpdateReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
    color: "#FFD700",
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
  listContainer: { padding: 16, paddingBottom: 40 },
});
