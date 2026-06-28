// components/report/StatusToggle.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  status: "lost" | "found";
  onStatusChange: (status: "lost" | "found") => void;
}

export default function StatusToggle({ status, onStatusChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>REPORT STATUS</Text>
      <View style={styles.statusToggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "lost" && styles.activeLostButton,
          ]}
          onPress={() => onStatusChange("lost")}
        >
          <Text style={styles.toggleButtonText}>LOST</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "found" && styles.activeFoundButton,
          ]}
          onPress={() => onStatusChange("found")}
        >
          <Text style={styles.toggleButtonText}>FOUND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  statusToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  } as ViewStyle,
  toggleButton: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  } as ViewStyle,
  activeLostButton: { backgroundColor: "#FF4A4A" } as ViewStyle,
  activeFoundButton: { backgroundColor: "#2E7D32" } as ViewStyle,
  toggleButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  } as TextStyle,
});
