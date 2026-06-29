import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PetReport } from "../hooks/useFeedFilter";

interface ProfileBookmarkGridCardProps {
  item: PetReport;
  onPress: () => void;
  onBookmarkToggle: () => void;
}

export const ProfileBookmarkGridCard: React.FC<
  ProfileBookmarkGridCardProps
> = ({ item, onPress, onBookmarkToggle }) => {
  const isLost = item.status === "lost";

  return (
    <View style={styles.gridCardContainer}>
      <TouchableOpacity
        style={styles.gridCardPressable}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Image
          source={{
            uri:
              item.imageUrl ||
              "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500",
          }}
          style={styles.gridCardImage}
          resizeMode="cover"
        />

        {/* Synchronized Unified Floating Bookmark Action */}
        <TouchableOpacity
          style={styles.floatingBookmark}
          onPress={onBookmarkToggle}
        >
          <Text style={styles.bookmarkIconText}>★</Text>
        </TouchableOpacity>

        <View style={styles.gridCardMeta}>
          <Text style={styles.gridCardTitle} numberOfLines={1}>
            {item.petName.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.gridStatusLabel,
              isLost ? styles.gridLostText : styles.gridFoundText,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gridCardContainer: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    position: "relative",
  },
  gridCardPressable: { width: "100%" },
  gridCardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#EAEAEA",
    borderBottomWidth: 2,
    borderColor: "#000",
  },
  floatingBookmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "#8A2BE2",
  },
  bookmarkIconText: { fontSize: 13, fontWeight: "900", color: "#FFF" },
  gridCardMeta: { padding: 8 },
  gridCardTitle: { fontSize: 14, fontWeight: "900", color: "#000" },
  gridStatusLabel: { fontSize: 10, fontWeight: "900", marginTop: 2 },
  gridLostText: { color: "#FF4A4A" },
  gridFoundText: { color: "#2E7D32" },
});
