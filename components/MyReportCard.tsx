import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { PetReport, generateAndShareFlyer } from "../services/flyerService";

interface ReportCardProps {
  item: PetReport;
  onEdit: (item: PetReport) => void;
  onDelete: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
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

        {isLost && item.reward ? (
          <Text style={styles.detailsText}>
            <Text style={[styles.boldText, { color: "#FF4A4A" }]}>
              REWARD:{" "}
            </Text>
            {item.reward.toUpperCase()}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.footerDate}>
            FILED:{" "}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : ""}
          </Text>

          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.flyerButton}
              onPress={() => generateAndShareFlyer(item)}
            >
              <Text style={styles.flyerButtonText}>📄 FLYER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => onEdit(item)}
            >
              <Text style={styles.updateButtonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
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
  imageContainer: { borderBottomWidth: 3, borderColor: "#000000" },
  cardImage: { width: "100%", height: 150, backgroundColor: "#EAEAEA" },
  cardContent: { padding: 14 },
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
  lostBadge: { backgroundColor: "#FF4A4A" },
  foundBadge: { backgroundColor: "#2E7D32" },
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
  boldText: { color: "#000000", fontWeight: "900" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 12,
    marginTop: 12,
  },
  footerDate: { color: "#666", fontSize: 11, fontWeight: "700" },
  actionButtonGroup: { flexDirection: "row", gap: 6, alignItems: "center" },
  flyerButton: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 1.5, height: 1.5 },
  },
  flyerButtonText: { color: "#000", fontSize: 11, fontWeight: "900" },
  updateButton: {
    backgroundColor: "#8A2BE2",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 1.5, height: 1.5 },
  },
  updateButtonText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  deleteButton: {
    backgroundColor: "#FF4A4A",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 1.5, height: 1.5 },
  },
  deleteButtonText: { color: "#000", fontSize: 11, fontWeight: "900" },
});
