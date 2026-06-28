// components/report/SpeciesSelector.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const SPECIES_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

interface Props {
  selectedSpecies: string;
  onSpeciesChange: (species: string) => void;
}

export default function SpeciesSelector({
  selectedSpecies,
  onSpeciesChange,
}: Props) {
  return (
    <View>
      <Text style={styles.label}>SPECIES IDENTIFICATION *</Text>
      <View style={styles.checkboxContainer}>
        {SPECIES_OPTIONS.map((opt) => {
          const isSelected =
            selectedSpecies.toLowerCase() === opt.toLowerCase();
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.checkboxRow,
                isSelected && styles.checkboxRowActive,
              ]}
              onPress={() => onSpeciesChange(opt)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  isSelected && styles.checkboxBoxActive,
                ]}
              >
                {isSelected && <Text style={styles.checkboxTickMark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.checkboxLabelText,
                  isSelected && styles.checkboxLabelTextActive,
                ]}
              >
                {opt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginTop: 16,
  },
  checkboxContainer: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    padding: 12,
    gap: 10,
    marginBottom: 4,
  } as ViewStyle,
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    padding: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
  } as ViewStyle,
  checkboxRowActive: {
    backgroundColor: "#FFFDE6",
    borderColor: "#FFD700",
  } as ViewStyle,
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#121212",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  checkboxBoxActive: {
    borderColor: "#000",
    backgroundColor: "#8A2BE2",
  } as ViewStyle,
  checkboxTickMark: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  } as TextStyle,
  checkboxLabelText: {
    color: "#BBBBBB",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  } as TextStyle,
  checkboxLabelTextActive: { color: "#000000" } as TextStyle,
});
