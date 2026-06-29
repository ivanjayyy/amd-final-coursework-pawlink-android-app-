import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PetReport } from "../hooks/useFeedFilter";

interface ReportCardProps {
  item: PetReport;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmarkToggle: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  item,
  isBookmarked,
  onPress,
  onBookmarkToggle,
}) => {
  const isLost = item.status === "lost";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={onPress}
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

      <TouchableOpacity
        style={[
          styles.floatingBookmark,
          isBookmarked ? styles.bookmarkActive : styles.bookmarkInactive,
        ]}
        onPress={onBookmarkToggle}
      >
        <Text
          style={[styles.bookmarkIconText, isBookmarked && { color: "#FFF" }]}
        >
          {isBookmarked ? "★" : "☆"}
        </Text>
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
          <Text style={styles.footerText}>CLICK TO EXPAND DETAILED INTEL</Text>
          <Text style={styles.arrowIndicator}>▶</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    position: "relative",
  },
  imageContainer: {
    borderBottomWidth: 3,
    borderColor: "#000000",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 150, backgroundColor: "#EAEAEA" },
  floatingBookmark: {
    position: "absolute",
    top: 10,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  bookmarkInactive: { backgroundColor: "#FFD700" },
  bookmarkActive: { backgroundColor: "#8A2BE2" },
  bookmarkIconText: { fontSize: 16, fontWeight: "900", color: "#000" },
  cardContent: { padding: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  lostBadge: { backgroundColor: "#FF4A4A" },
  foundBadge: { backgroundColor: "#2E7D32" },
  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  detailsText: {
    color: "#222222",
    fontSize: 13,
    marginBottom: 3,
    fontWeight: "600",
  },
  boldText: { color: "#000000", fontWeight: "900" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 8,
    marginTop: 8,
  },
  footerText: {
    color: "#8A2BE2",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  arrowIndicator: { color: "#000", fontWeight: "900", fontSize: 12 },
});
