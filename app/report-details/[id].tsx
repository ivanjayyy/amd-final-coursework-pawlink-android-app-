// app/report-details/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { db } from "../../config/firebase";

interface PetReport {
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

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<PetReport | null>(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "pet_reports", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport(docSnap.data() as PetReport);
        }
      } catch (err) {
        console.error("Error retrieving detail payload:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>REPORT DATA NOT FOUND</Text>
      </View>
    );
  }

  const isLost = report.status === "lost";

  return (
    <View style={styles.container}>
      {/* Top Header Panel with Native Back Navigation */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INCIDENT REPORT DETAILED INTEL</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {report.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: report.imageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.rowJustified}>
            <Text style={styles.petName}>{report.petName.toUpperCase()}</Text>
            <View
              style={[
                styles.statusBadge,
                isLost ? styles.lostBadge : styles.foundBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {report.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {isLost && report.reward ? (
            <View style={styles.rewardBanner}>
              <Text style={styles.rewardText}>
                🎁 REWARD: {report.reward.toUpperCase()}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>SPECIES / BREED</Text>
            <Text style={styles.infoValue}>
              {report.species.toUpperCase()} • {report.breed.toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>LAST REPORTED VECTOR LOCATION</Text>
            <Text style={styles.infoValue}>
              {report.lastSeenLocation.toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>
              BEHAVIORAL & DISTINCTIVE DESCRIPTION
            </Text>
            <Text style={styles.descriptionValue}>{report.description}</Text>
          </View>

          {/* Contact Details Grid */}
          <View style={styles.contactPanel}>
            <Text style={styles.contactPanelTitle}>
              SECURE CONTACT INTELLIGENCE
            </Text>
            {report.phoneNumbers?.map((phone, i) => (
              <Text key={`p-${i}`} style={styles.contactText}>
                📞 {phone}
              </Text>
            ))}
            {report.contactEmails?.map((email, i) => (
              <Text key={`e-${i}`} style={styles.contactText}>
                ✉️ {email}
              </Text>
            ))}
          </View>

          <Text style={styles.footerAgentText}>
            REPORT FILED BY AGENT:{" "}
            {report.userEmail
              ? report.userEmail.split("@")[0].toUpperCase()
              : "HERO"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" } as ViewStyle,
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  } as ViewStyle,
  errorText: {
    color: "#FF4A4A",
    fontWeight: "900",
    letterSpacing: 1,
  } as TextStyle,
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 4,
    borderColor: "#000000",
    gap: 12,
  } as ViewStyle,
  backBtn: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  } as ViewStyle,
  backBtnText: { color: "#000", fontWeight: "900", fontSize: 12 } as TextStyle,
  headerTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
    flex: 1,
  } as TextStyle,
  scrollContainer: { paddingBottom: 40 } as ViewStyle,
  imageContainer: {
    borderWidth: 3,
    borderColor: "#000",
    margin: 16,
    borderRadius: 4,
    overflow: "hidden",
  } as ViewStyle,
  mainImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#222",
  } as ImageStyle,
  metaContainer: { paddingHorizontal: 16 } as ViewStyle,
  rowJustified: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  petName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  } as TextStyle,
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
  } as ViewStyle,
  lostBadge: { backgroundColor: "#FF4A4A" } as ViewStyle,
  foundBadge: { backgroundColor: "#2E7D32" } as ViewStyle,
  statusText: { color: "#FFF", fontWeight: "900", fontSize: 12 } as TextStyle,
  rewardBanner: {
    backgroundColor: "#FFFDE6",
    borderWidth: 2,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  } as ViewStyle,
  rewardText: {
    color: "#FF4A4A",
    fontWeight: "900",
    fontSize: 14,
  } as TextStyle,
  infoBlock: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#000",
    padding: 14,
    borderRadius: 4,
    marginBottom: 12,
  } as ViewStyle,
  infoLabel: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  } as TextStyle,
  infoValue: { color: "#FFF", fontSize: 14, fontWeight: "700" } as TextStyle,
  descriptionValue: {
    color: "#DDD",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  } as TextStyle,
  contactPanel: {
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#000",
    padding: 14,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 16,
  } as ViewStyle,
  contactPanelTitle: {
    color: "#8A2BE2",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.5,
  } as TextStyle,
  contactText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  } as TextStyle,
  footerAgentText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  } as TextStyle,
});
