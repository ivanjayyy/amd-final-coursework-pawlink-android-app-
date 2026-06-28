// app/(tabs)/index.tsx
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
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { auth, db } from "../../config/firebase";
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
  userEmail: string;
}

export default function FeedScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<PetReport[]>([]);
  const [bookmarkedReportIds, setBookmarkedReportIds] = useState<string[]>([]);

  // Synchronize dynamic lists directly from Cloud Firestore based on current Auth context state
  useEffect(() => {
    if (!user) return;

    // Real-time Feed Pipeline
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
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    // Isolated Cloud User Bookmarks Pipeline
    const bookmarksRef = collection(db, "user_bookmarks");
    const bookmarksQuery = query(bookmarksRef, where("userId", "==", user.uid));
    const unsubscribeBookmarks = onSnapshot(bookmarksQuery, (snapshot) => {
      const activeIds: string[] = [];
      snapshot.forEach((doc) => {
        activeIds.push(doc.data().reportId);
      });
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
          reportId: reportId,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Cloud bookmark synchronization crash: ", err);
    }
  };

  const renderReportCard = ({ item }: { item: PetReport }) => {
    const isLost = item.status === "lost";
    const isBookmarked = bookmarkedReportIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={() => router.push(`/report-details/${item.id}`)}
      >
        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Floating Custom Ribbon Bookmark Flag Element */}
        <TouchableOpacity
          style={[
            styles.floatingBookmark,
            isBookmarked ? styles.bookmarkActive : styles.bookmarkInactive,
          ]}
          onPress={() => handleToggleBookmark(item.id)}
        >
          <Text
            style={[styles.bookmarkIconText, isBookmarked && { color: "#FFF" }]}
          >
            {isBookmarked ? "★" : "☆"}
          </Text>
          <View
            style={[
              styles.bookmarkTailCut,
              isBookmarked ? styles.tailActive : styles.tailInactive,
            ]}
          />
        </TouchableOpacity>

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
            {item.species.toUpperCase()}
          </Text>

          <Text style={styles.detailsText} numberOfLines={1}>
            <Text style={styles.boldText}>LAST SEEN: </Text>
            {item.lastSeenLocation.toUpperCase()}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              CLICK TO EXPAND DETAILED INTEL
            </Text>
            <Text style={styles.arrowIndicator}>▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.emptyText}>NO ACTIVE INTEL IN THIS SECTOR.</Text>
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
  container: { flex: 1, backgroundColor: "#121212" } as ViewStyle,
  comicHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 4,
    borderColor: "#000000",
  } as ViewStyle,
  logoBadge: {
    backgroundColor: "#FFD700",
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
  } as ViewStyle,
  logoText: {
    color: "#000000",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 4,
  } as TextStyle,
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  } as ViewStyle,
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1.5,
  } as TextStyle,
  signOutBtn: {
    backgroundColor: "#FF4A4A",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  } as ViewStyle,
  signOutText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  } as TextStyle,
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  } as ViewStyle,
  emptyText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  } as TextStyle,
  listContainer: { padding: 16, paddingBottom: 40 } as ViewStyle,
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#000000",
    overflow: "visible", // Allows the banner ribbon layout depth override
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    position: "relative",
  } as ViewStyle,
  imageContainer: {
    borderBottomWidth: 3,
    borderColor: "#000000",
    overflow: "hidden",
  } as ViewStyle,
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#EAEAEA",
  } as ImageStyle,
  floatingBookmark: {
    position: "absolute",
    top: -5,
    right: 15,
    width: 32,
    height: 44,
    borderWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    zIndex: 10,
  } as ViewStyle,
  bookmarkInactive: { backgroundColor: "#FFD700" } as ViewStyle,
  bookmarkActive: { backgroundColor: "#8A2BE2" } as ViewStyle,
  bookmarkIconText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
  } as TextStyle,
  bookmarkTailCut: {
    position: "absolute",
    bottom: -3,
    left: -3,
    width: 32,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  } as ViewStyle,
  tailInactive: { borderBottomColor: "#FFFFFF" } as ViewStyle,
  tailActive: { borderBottomColor: "#FFFFFF" } as ViewStyle,
  cardContent: { padding: 12 } as ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  petName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1,
  } as TextStyle,
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
  } as ViewStyle,
  lostBadge: { backgroundColor: "#FF4A4A" } as ViewStyle,
  foundBadge: { backgroundColor: "#2E7D32" } as ViewStyle,
  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  } as TextStyle,
  detailsText: {
    color: "#222222",
    fontSize: 13,
    marginBottom: 3,
    fontWeight: "600",
  } as TextStyle,
  boldText: { color: "#000000", fontWeight: "900" } as TextStyle,
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 8,
    marginTop: 8,
  } as ViewStyle,
  footerText: {
    color: "#8A2BE2",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  } as TextStyle,
  arrowIndicator: {
    color: "#000",
    fontWeight: "900",
    fontSize: 12,
  } as TextStyle,
});
