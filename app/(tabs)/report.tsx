// app/(tabs)/report.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

  // Form State
  const [status, setStatus] = useState<"lost" | "found">("lost");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // REPLACE THIS WITH YOUR ACTUAL IMGBB API KEY
  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

  // Free Upload Helper Function
  const uploadImageToImgBB = async (uri: string): Promise<string | null> => {
    try {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append("image", { uri, name: filename, type } as any);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const json = await response.json();
      if (json.success) {
        return json.data.url; // Returns the clean web link string
      } else {
        console.error("ImgBB Upload Failed: ", json);
        return null;
      }
    } catch (err) {
      console.error("Error running network upload: ", err);
      return null;
    }
  };

  // Gallery Picker
  const pickImage = async () => {
    const { status: cameraRollStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraRollStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need storage access permissions to upload pet photos!",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Camera Handler
  const takePhoto = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera privileges to snapshot immediate sightings!",
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

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
      let cloudImageUrl = null;

      if (imageUri) {
        cloudImageUrl = await uploadImageToImgBB(imageUri);
        if (!cloudImageUrl) {
          Alert.alert(
            "Upload Warning",
            "Failed to host image online, submitting without photo.",
          );
        }
      }

      const reportsRef = collection(db, "pet_reports");

      await addDoc(reportsRef, {
        userId: user?.uid,
        userEmail: user?.email,
        status,
        petName: status === "found" && !petName ? "Unknown" : petName,
        species: species.trim().toLowerCase(),
        breed: breed.trim() || "Unknown",
        lastSeenLocation: lastSeenLocation.trim(),
        description: description.trim(),
        imageUrl: cloudImageUrl, // Permanent URL saved directly into your data doc
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Pet report posted successfully!", [
        {
          text: "OK",
          onPress: () => {
            setPetName("");
            setSpecies("");
            setBreed("");
            setLastSeenLocation("");
            setDescription("");
            setImageUri(null);
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

      <Text style={styles.label}>Pet Photo</Text>
      <View style={styles.photoActionRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Text style={styles.mediaButtonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageBadge}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageText}>✕ Remove Photo</Text>
          </TouchableOpacity>
        </View>
      )}

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
  photoActionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mediaButtonText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 10,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
  },
  removeImageBadge: {
    marginTop: 8,
    padding: 6,
  },
  removeImageText: {
    color: "#ff4a4a",
    fontSize: 13,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#8A2BE2",
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
