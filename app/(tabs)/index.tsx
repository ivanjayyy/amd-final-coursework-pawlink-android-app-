import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";
import { useFeedFilter, PetReport } from "../../hooks/useFeedFilter";
import { FeedFilterPanel } from "../../components/FeedFilterPanel";
import { ReportCard } from "../../components/ReportCard";

export default function FeedScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<PetReport[]>([]);
  const [bookmarkedReportIds, setBookmarkedReportIds] = useState<string[]>([]);

  const {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedSpecies,
    setSelectedSpecies,
    filteredReports,
  } = useFeedFilter(reports);

  useEffect(() => {
    if (!user) return;

    const reportsRef = collection(db, "pet_reports");
    const reportsQuery = query(reportsRef, orderBy("createdAt", "desc"));
    const unsubscribeReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const fetched: PetReport[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as PetReport);
        });
        setReports(fetched);
        setLoading(false);
      },
      () => setLoading(false),
    );

    const bookmarksRef = collection(db, "user_bookmarks");
    const bookmarksQuery = query(bookmarksRef, where("userId", "==", user.uid));
    const unsubscribeBookmarks = onSnapshot(bookmarksQuery, (snapshot) => {
      const activeIds: string[] = [];
      snapshot.forEach((doc) => activeIds.push(doc.data().reportId));
      setBookmarkedReportIds(activeIds);
    });

    return () => {
      unsubscribeReports();
      unsubscribeBookmarks();
    };
  }, [user]);

  const handleToggleBookmark = async (reportId: string) => {
    if (!user) return;
    const bookmarkDocId = `${user.uid}_${reportId}`;
    const docReference = doc(db, "user_bookmarks", bookmarkDocId);

    try {
      if (bookmarkedReportIds.includes(reportId)) {
        await deleteDoc(docReference);
      } else {
        await setDoc(docReference, {
          userId: user.uid,
          reportId,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Cloud bookmark synchronization crash: ", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.comicHeaderContainer}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>PAWLINK</Text>
          </View>
          <TouchableOpacity
            style={styles.alertIconBtn}
            onPress={() => router.push("./notifications")}
          >
            <Text style={styles.alertIconText}>🔔</Text>
          </TouchableOpacity>
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

      <FeedFilterPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSpecies={selectedSpecies}
        setSelectedSpecies={setSelectedSpecies}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>NO ACTIVE MATCHES SEEN.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReportCard
              item={item}
              isBookmarked={bookmarkedReportIds.includes(item.id)}
              onPress={() => router.push(`/report-details/${item.id}`)}
              onBookmarkToggle={() => handleToggleBookmark(item.id)}
            />
          )}
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
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoBadge: {
    backgroundColor: "#FFD700",
    borderWidth: 4,
    borderColor: "#000000",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 4,
    transform: [{ rotate: "-1deg" }],
  },
  logoText: {
    color: "#000",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
  },
  alertIconBtn: {
    backgroundColor: "#8A2BE2",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  alertIconText: { fontSize: 18 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 11,
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
  signOutText: { color: "#000", fontSize: 11, fontWeight: "900" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: { color: "#FFD700", fontSize: 13, fontWeight: "900" },
  listContainer: { padding: 16, paddingBottom: 40 },
});
