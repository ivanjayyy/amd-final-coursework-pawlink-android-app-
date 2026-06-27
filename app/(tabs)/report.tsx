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
      <Text style={styles.label}>REPORT STATUS</Text>
      <View style={styles.statusToggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "lost" && styles.activeLostButton,
          ]}
          onPress={() => setStatus("lost")}
        >
          <Text style={styles.toggleButtonText}>LOST</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "found" && styles.activeFoundButton,
          ]}
          onPress={() => setStatus("found")}
        >
          <Text style={styles.toggleButtonText}>FOUND</Text>
        </TouchableOpacity>
      </View>

      {status === "lost" && (
        <View style={styles.comicPanel}>
          <Text style={[styles.label, { color: "#FF4A4A" }]}>
            REWARD OFFERED (OPTIONAL)
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: "#FFD700", backgroundColor: "#FFFDE6" },
            ]}
            placeholder="e.g. Rs. 5,000 or Cash Reward"
            placeholderTextColor="#777"
            value={reward}
            onChangeText={setReward}
          />
        </View>
      )}

      <Text style={styles.label}>
        PET NAME {status === "found" && "(OPTIONAL)"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={status === "found" ? "e.g. Unknown" : "e.g. Max"}
        placeholderTextColor="#777"
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>SPECIES *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dog, Cat"
        placeholderTextColor="#777"
        value={species}
        onChangeText={setSpecies}
      />

      <Text style={styles.label}>BREED (OPTIONAL)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Persian"
        placeholderTextColor="#777"
        value={breed}
        onChangeText={setBreed}
      />

      <Text style={styles.label}>LAST SEEN LOCATION *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Dehiwala, Colombo"
        placeholderTextColor="#777"
        value={lastSeenLocation}
        onChangeText={setLastSeenLocation}
      />

      <Text style={styles.label}>DISTINCTIVE DESCRIPTION *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe details..."
        placeholderTextColor="#777"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* --- PHONE NUMBERS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>PHONE NUMBERS *</Text>
        <TouchableOpacity style={styles.comicTextBtn} onPress={handleAddPhone}>
          <Text style={styles.addButtonText}>+ ADD PHONE</Text>
        </TouchableOpacity>
      </View>
      {phoneNumbers.map((phone, index) => (
        <View key={`phone-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. 0771234567"
            placeholderTextColor="#777"
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
        <Text style={styles.label}>CONTACT EMAILS (OPTIONAL)</Text>
        <TouchableOpacity style={styles.comicTextBtn} onPress={handleAddEmail}>
          <Text style={styles.addButtonText}>+ ADD EMAIL</Text>
        </TouchableOpacity>
      </View>
      {emails.map((emailItem, index) => (
        <View key={`email-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. contact@domain.com"
            placeholderTextColor="#777"
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

      <Text style={styles.label}>PET PHOTO</Text>
      <View style={styles.photoActionRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>GALLERY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Text style={styles.mediaButtonText}>CAMERA</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageBadge}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageText}>✕ REMOVE PHOTO</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { padding: 20, paddingBottom: 60 },
  label: {
    color: "#FFD700", // Pop comic yellow
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  },
  statusToggleRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  toggleButton: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    // Comic cell shadow block
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  },
  activeLostButton: { backgroundColor: "#FF4A4A" },
  activeFoundButton: { backgroundColor: "#2E7D32" },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000000",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  },
  textArea: { height: 90, textAlignVertical: "top" },
  comicPanel: {
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  comicTextBtn: {
    backgroundColor: "#8A2BE2",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  addButtonText: { color: "#FFF", fontWeight: "900", fontSize: 11 },
  dynamicRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: "#FF4A4A",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
  removeButtonText: { color: "#000", fontWeight: "900" },
  photoActionRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  mediaButton: {
    flex: 1,
    backgroundColor: "#333",
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  },
  mediaButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 10,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#1E1E1E",
  },
  removeImageBadge: {
    width: "100%",
    backgroundColor: "#FF4A4A",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  removeImageText: { color: "#000", fontSize: 13, fontWeight: "900" },
  submitButton: {
    backgroundColor: "#8A2BE2", // Classic punchy purple panel
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
  },
  disabledButton: { backgroundColor: "#555" },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 2,
  },
});
