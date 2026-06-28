// app/(tabs)/report.tsx
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

// Modular Component Extractions
import ContactFields from "../../components/report/ContactFields";
import ImageClassifier from "../../components/report/ImageClassifier";
import IntelMap from "../../components/report/IntelMap";
import SpeciesSelector from "../../components/report/SpeciesSelector";
import StatusToggle from "../../components/report/StatusToggle";
import TextInputField from "../../components/report/TextInputField"; // Optional minor shell or use normal text inputs

export default function ReportScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Form Parameters
  const [status, setStatus] = useState<"lost" | "found">("lost");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");

  // Validation States managed by AI Layer
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAiValidated, setIsAiValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Map States
  const [resolvedAddress, setResolvedAddress] = useState(
    "Locating agent positioning data...",
  );
  const [markerCoordinate, setMarkerCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Contact States
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);

  const handleSubmit = async () => {
    const cleanPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");
    const cleanEmails = emails.map((e) => e.trim()).filter((e) => e !== "");

    if (!resolvedAddress || !description.trim()) {
      Alert.alert(
        "Missing Info",
        "Please ensure description and location address tracking are loaded.",
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

    if (imageUri && !isAiValidated) {
      Alert.alert(
        "AI Engine Restriction",
        "Image telemetry failed animal validation checks.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "pet_reports"), {
        userId: user?.uid,
        userEmail: user?.email,
        status,
        petName: status === "found" && !petName ? "Unknown" : petName,
        species: species.toLowerCase(),
        breed: breed.trim() || "Unknown",
        lastSeenLocation: resolvedAddress,
        coordinates: markerCoordinate
          ? { lat: markerCoordinate.latitude, lng: markerCoordinate.longitude }
          : null,
        description: description.trim(),
        imageUrl: imageUri, // Already cloud uploaded URL returned by ImageClassifier
        phoneNumbers: cleanPhones,
        contactEmails: cleanEmails,
        reward: status === "lost" ? reward.trim() : "",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Pet report posted successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
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
      <StatusToggle status={status} onStatusChange={setStatus} />

      {status === "lost" && (
        <View style={styles.comicPanel}>
          <Text style={[styles.label, { color: "#FF4A4A" }]}>
            REWARD OFFERED (OPTIONAL)
          </Text>
          <TextInputField
            placeholder="e.g. Rs. 5,000 or Cash Reward"
            value={reward}
            onChangeText={setReward}
            borderColor="#FFD700"
            backgroundColor="#FFFDE6"
          />
        </View>
      )}

      <SpeciesSelector selectedSpecies={species} onSpeciesChange={setSpecies} />

      <Text style={styles.label}>
        PET NAME {status === "found" && "(OPTIONAL)"}
      </Text>
      <TextInputField
        placeholder={status === "found" ? "e.g. Unknown" : "e.g. Max"}
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>BREED (OPTIONAL)</Text>
      <TextInputField
        placeholder="e.g. Persian, German Shepherd"
        value={breed}
        onChangeText={setBreed}
      />

      <IntelMap
        onLocationResolved={setResolvedAddress}
        onCoordinatesChanged={setMarkerCoordinate}
        currentAddress={resolvedAddress}
      />

      <Text style={styles.label}>DISTINCTIVE DESCRIPTION *</Text>
      <TextInputField
        placeholder="Describe unique features or marks..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <ContactFields
        phoneNumbers={phoneNumbers}
        setPhoneNumbers={setPhoneNumbers}
        emails={emails}
        setEmails={setEmails}
      />

      <ImageClassifier
        onValidationComplete={(url, isValid) => {
          setImageUri(url);
          setIsAiValidated(isValid);
        }}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (submitting || (imageUri && !isAiValidated)) && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        // Highlight-Start: Force evaluation to a strict true/false boolean
        disabled={!!submitting || (!!imageUri && !isAiValidated)}
        // Highlight-End
      >
        <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" } as ViewStyle,
  contentContainer: { padding: 20, paddingBottom: 60 } as ViewStyle,
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  } as TextStyle,
  comicPanel: { marginBottom: 4 } as ViewStyle,
  textArea: { height: 90, textAlignVertical: "top" } as TextStyle,
  submitButton: {
    backgroundColor: "#8A2BE2",
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
  } as ViewStyle,
  disabledButton: { backgroundColor: "#555" } as ViewStyle,
  submitButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 2,
  } as TextStyle,
});
