import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFeedNotifications } from "../hooks/useFeedNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications } = useFeedNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>◀ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LOCAL VECTORS RADAR INTEL</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            RADAR CLEAR. NO LOCAL THREATS RECORDED.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.alertCard,
                item.status === "lost" ? styles.lostBorder : styles.foundBorder,
              ]}
              onPress={() => router.push(`/report-details/${item.reportId}`)}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardStatusLabel}>
                  {item.status.toUpperCase()} INCIDENT ALERT
                </Text>
                <Text style={styles.timestampText}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.actionPrompt}>
                TAP TO DEPLOY RECONNAISSANCE MAP ▶
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 16, // <-- Kept this valid clean property
    paddingHorizontal: 16,
    borderBottomWidth: 4,
    borderColor: "#000000",
    gap: 12,
  },
  backBtn: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  backBtnText: { color: "#000", fontWeight: "900", fontSize: 12 },
  headerTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#666",
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },
  listContainer: { padding: 16 },
  alertCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000",
    padding: 14,
    borderRadius: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  },
  lostBorder: { borderLeftWidth: 8, borderLeftColor: "#FF4A4A" },
  foundBorder: { borderLeftWidth: 8, borderLeftColor: "#2E7D32" },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardStatusLabel: { color: "#FFD700", fontWeight: "900", fontSize: 11 },
  timestampText: { color: "#666", fontWeight: "700", fontSize: 11 },
  messageText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 8,
  },
  actionPrompt: { color: "#8A2BE2", fontSize: 11, fontWeight: "900" },
});
