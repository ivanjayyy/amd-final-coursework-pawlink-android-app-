// app/(tabs)/report.tsx
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

export default function ReportScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Form State matching our schema layout
  const [status, setStatus] = useState<"lost" | "found">("lost");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!species || !lastSeenLocation || !description) {
      Alert.alert(
        "Missing Info",
        "Please fill out Species, Location, and Description.",
      );
      return;
    }

    setSubmitting(true);

    try {
      // Create a reference to the 'pet_reports' collection
      const reportsRef = collection(db, "pet_reports");

      // Submit the payload matching our schema structure
      await addDoc(reportsRef, {
        userId: user?.uid,
        userEmail: user?.email,
        status,
        petName: status === "found" && !petName ? "Unknown" : petName,
        species: species.trim().toLowerCase(),
        breed: breed.trim() || "Unknown",
        lastSeenLocation: lastSeenLocation.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Pet report posted successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setPetName("");
            setSpecies("");
            setBreed("");
            setLastSeenLocation("");
            setDescription("");
            // Navigate back to main feed
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding report: ", error);
      Alert.alert(
        "Submission Failed",
        error.message || "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.label}>Report Status</Text>
      <View style={styles.statusToggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "lost" && styles.activeLostButton,
          ]}
          onPress={() => setStatus("lost")}
        >
          <Text style={styles.toggleButtonText}>Lost</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "found" && styles.activeFoundButton,
          ]}
          onPress={() => setStatus("found")}
        >
          <Text style={styles.toggleButtonText}>Found</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        Pet Name {status === "found" && "(Optional)"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={
          status === "found" ? "e.g. Unknown or Friendly Cat" : "e.g. Max"
        }
        placeholderTextColor="#aaa"
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>Species *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dog, Cat, Bird"
        placeholderTextColor="#aaa"
        value={species}
        onChangeText={setSpecies}
      />

      <Text style={styles.label}>Breed (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. German Shepherd, Persian"
        placeholderTextColor="#aaa"
        value={breed}
        onChangeText={setBreed}
      />

      <Text style={styles.label}>Last Seen Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Near Central Park, Maple Ave"
        placeholderTextColor="#aaa"
        value={lastSeenLocation}
        onChangeText={setLastSeenLocation}
      />

      <Text style={styles.label}>Distinctive Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe collar color, distinct markings, behavior..."
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  statusToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  activeLostButton: {
    backgroundColor: "#d93838",
    borderColor: "#ff4a4a",
  },
  activeFoundButton: {
    backgroundColor: "#2e7d32",
    borderColor: "#4caf50",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 8,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#8A2BE2", // Purple theme accent
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
