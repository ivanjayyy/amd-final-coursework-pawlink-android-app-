import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

interface FeedFilterPanelProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  selectedStatus: "all" | "lost" | "found";
  setSelectedStatus: (status: "all" | "lost" | "found") => void;
  selectedSpecies: string;
  setSelectedSpecies: (species: string) => void;
}

const SPECIES_LIST = ["all", "dog", "cat", "rabbit", "bird"];

export const FeedFilterPanel: React.FC<FeedFilterPanelProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSpecies,
  setSelectedSpecies,
}) => {
  return (
    <View style={styles.panelContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="SEARCH RECORDS VECTORS..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.toggleRow}>
        {(["all", "lost", "found"] as const).map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusBtn,
              selectedStatus === st && styles.activeStatusBtn,
            ]}
            onPress={() => setSelectedStatus(st)}
          >
            <Text
              style={[
                styles.statusBtnText,
                selectedStatus === st && styles.activeText,
              ]}
            >
              {st.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.speciesScroll}
      >
        {SPECIES_LIST.map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[
              styles.speciesChip,
              selectedSpecies === sp && styles.activeSpeciesChip,
            ]}
            onPress={() => setSelectedSpecies(sp)}
          >
            <Text
              style={[
                styles.speciesChipText,
                selectedSpecies === sp && styles.activeText,
              ]}
            >
              {sp.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderBottomWidth: 4,
    borderColor: "#000",
  },
  searchInput: {
    backgroundColor: "#FFF",
    color: "#000",
    fontWeight: "700",
    padding: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 10,
  },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statusBtn: {
    flex: 1,
    backgroundColor: "#262626",
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  activeStatusBtn: { backgroundColor: "#8A2BE2" },
  statusBtnText: {
    color: "#AAA",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  speciesScroll: { gap: 6 },
  speciesChip: {
    backgroundColor: "#262626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
  },
  activeSpeciesChip: { backgroundColor: "#FFD700" },
  speciesChipText: { color: "#AAA", fontWeight: "900", fontSize: 11 },
  activeText: { color: "#000" },
});
