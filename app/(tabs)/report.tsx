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

  // Dynamic Contact States
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [reward, setReward] = useState("");

  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

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
        },
      );

      const json = await response.json();
      return json.success ? json.data.url : null;
    } catch (err) {
      console.error("Network upload error:", err);
      return null;
    }
  };

  const handleAddPhone = () => setPhoneNumbers([...phoneNumbers, ""]);
  const handleRemovePhone = (index: number) => {
    const updated = [...phoneNumbers];
    updated.splice(index, 1);
    setPhoneNumbers(updated);
  };
  const handlePhoneChange = (text: string, index: number) => {
    const updated = [...phoneNumbers];
    updated[index] = text;
    setPhoneNumbers(updated);
  };

  const handleAddEmail = () => setEmails([...emails, ""]);
  const handleRemoveEmail = (index: number) => {
    const updated = [...emails];
    updated.splice(index, 1);
    setEmails(updated);
  };
  const handleEmailChange = (text: string, index: number) => {
    const updated = [...emails];
    updated[index] = text;
    setEmails(updated);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
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
    // Filter out blank inputs from our dynamic lists
    const cleanPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");
    const cleanEmails = emails.map((e) => e.trim()).filter((e) => e !== "");

    if (!species || !lastSeenLocation || !description) {
      Alert.alert(
        "Missing Info",
        "Please fill out Species, Location, and Description.",
      );
      return;
    }

    if (cleanPhones.length === 0) {
      Alert.alert(
        "Contact Required",
        "Please provide at least one valid phone number.",
      );
      return;
    }

    setSubmitting(true);

    try {
      let cloudImageUrl = null;
      if (imageUri) {
        cloudImageUrl = await uploadImageToImgBB(imageUri);
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
        imageUrl: cloudImageUrl,
        phoneNumbers: cleanPhones,
        contactEmails: cleanEmails,
        reward: status === "lost" ? reward.trim() : "",
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
            setPhoneNumbers([""]);
            setEmails([""]);
            setReward("");
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
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
      keyboardShouldPersistTaps="handled"
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

      {status === "lost" && (
        <View>
          <Text style={styles.label}>Reward Offered (Optional)</Text>
          <TextInput
            style={[styles.input, { borderColor: "#8A2BE2" }]}
            placeholder="e.g. Rs. 5,000 or Cash Reward"
            placeholderTextColor="#aaa"
            value={reward}
            onChangeText={setReward}
          />
        </View>
      )}

      <Text style={styles.label}>
        Pet Name {status === "found" && "(Optional)"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={status === "found" ? "e.g. Unknown" : "e.g. Max"}
        placeholderTextColor="#aaa"
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>Species *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dog, Cat"
        placeholderTextColor="#aaa"
        value={species}
        onChangeText={setSpecies}
      />

      <Text style={styles.label}>Breed (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Persian"
        placeholderTextColor="#aaa"
        value={breed}
        onChangeText={setBreed}
      />

      <Text style={styles.label}>Last Seen Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dehiwala, Colombo"
        placeholderTextColor="#aaa"
        value={lastSeenLocation}
        onChangeText={setLastSeenLocation}
      />

      <Text style={styles.label}>Distinctive Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe details..."
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* --- PHONE NUMBERS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>Phone Numbers * (At least one)</Text>
        <TouchableOpacity onPress={handleAddPhone}>
          <Text style={styles.addButtonText}>+ Add Phone</Text>
        </TouchableOpacity>
      </View>
      {phoneNumbers.map((phone, index) => (
        <View key={`phone-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. 0771234567"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => handlePhoneChange(text, index)}
          />
          {phoneNumbers.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePhone(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* --- EMAILS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>Contact Emails (Optional)</Text>
        <TouchableOpacity onPress={handleAddEmail}>
          <Text style={styles.addButtonText}>+ Add Email</Text>
        </TouchableOpacity>
      </View>
      {emails.map((emailItem, index) => (
        <View key={`email-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. contact@domain.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailItem}
            onChangeText={(text) => handleEmailChange(text, index)}
          />
          {emails.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveEmail(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={styles.label}>Pet Photo</Text>
      <View style={styles.photoActionRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Text style={styles.mediaButtonText}>Camera</Text>
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
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { padding: 20, paddingBottom: 60 },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  statusToggleRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  toggleButton: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  activeLostButton: { backgroundColor: "#d93838", borderColor: "#ff4a4a" },
  activeFoundButton: { backgroundColor: "#2e7d32", borderColor: "#4caf50" },
  toggleButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
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
  textArea: { height: 90, textAlignVertical: "top" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  addButtonText: { color: "#8A2BE2", fontWeight: "bold", fontSize: 14 },
  dynamicRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: "#2a2a2a",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  removeButtonText: { color: "#ff4a4a", fontWeight: "bold" },
  photoActionRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  mediaButton: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mediaButtonText: { color: "#aaa", fontSize: 13, fontWeight: "600" },
  previewContainer: { alignItems: "center", marginTop: 10 },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
  },
  removeImageBadge: { marginTop: 8, padding: 6 },
  removeImageText: { color: "#ff4a4a", fontSize: 13, fontWeight: "500" },
  submitButton: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
