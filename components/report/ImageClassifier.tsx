// components/report/ImageClassifier.tsx
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  onValidationComplete: (cloudUrl: string | null, isValid: boolean) => void;
}

export default function ImageClassifier({ onValidationComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";
  // Replace with your real Gemini API Key from Google AI Studio
  const GEMINI_API_KEY = "AIzaSyAnooGJm8QgedEhge4dVhQ_Py_3UH_a3z4";

  const analyzeImageWithGemini = async (
    base64Data: string,
    mimeType: string,
  ): Promise<boolean> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const promptText =
      "Analyze this image carefully. Your job is to enforce platform validation rules. " +
      "Is this image a real, live animal (e.g., dog, cat, bird, rabbit, pet)? " +
      "Also check if it contains highly inappropriate content like graphic weapons, explicit nudity, human blood, or extreme gore. " +
      "Respond strictly with a single JSON object matching this schema: " +
      '{"isAnimal": boolean, "isInappropriate": boolean, "reason": "short explanation"}. ' +
      "Do not include markdown formatting, backticks, or any other conversational text.";

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Clean up potential markdown formatting blocks if Gemini accidentally returns them
      const cleanJsonText = rawText.replace(/```json|```/g, "").trim();
      const parsedDetails = JSON.parse(cleanJsonText);

      if (parsedDetails.isInappropriate) {
        Alert.alert(
          "AI SECURITY ALERT",
          `Content flagged: ${parsedDetails.reason}`,
        );
        return false;
      }

      return parsedDetails.isAnimal === true;
    } catch (error) {
      console.error("Gemini Vision Verification crash:", error);
      return false;
    }
  };

  const processImageVerification = async (localUri: string) => {
    setPreview(localUri);
    setAnalyzing(true);
    setStatusText("RUNNING AI VISION SCANNER...");

    try {
      // 1. Get image metadata to determine the exact mime-type format
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const extension = match ? match[1] : "jpeg";
      const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;

      // 2. Read the local asset binary directly into Base64 format
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: "base64", // Pass the string directly here
      });

      // 3. Process structural confirmation through GenAI Vision
      const isRealPet = await analyzeImageWithGemini(base64Data, mimeType);

      if (!isRealPet) {
        setStatusText("AI REJECTED: NO PET VALIDATED");
        onValidationComplete(null, false);
        Alert.alert(
          "VALIDATION FAILED",
          "The scanned entity does not appear to be a real animal or contains inappropriate material.",
        );
        return;
      }

      // 4. Secure cloud hosting pathway once AI verification clears
      setStatusText("AI APPROVED. UPLOADING CLOUD ASSET...");
      const formData = new FormData();
      formData.append("image", {
        uri: localUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const json = await response.json();

      if (json.success) {
        setStatusText("VERIFICATION SECURED");
        onValidationComplete(json.data.url, true);
      } else {
        throw new Error("Cloud sync failed");
      }
    } catch (err) {
      setStatusText("SCAN CORRUPTED");
      onValidationComplete(null, false);
      Alert.alert("Error", "Failed during target validation layer pipeline.");
    } finally {
      setAnalyzing(false);
    }
  };

  const launchMedia = async (mode: "camera" | "gallery") => {
    let res;
    if (mode === "camera") {
      await ImagePicker.requestCameraPermissionsAsync();
      res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6, // Slices asset footprint to optimize pipeline execution speeds
      });
    } else {
      res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });
    }
    if (!res.canceled) processImageVerification(res.assets[0].uri);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>TELEMETRY IMAGE SCANNER *</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => launchMedia("gallery")}
          disabled={analyzing}
        >
          <Text style={styles.btnText}>GALLERY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => launchMedia("camera")}
          disabled={analyzing}
        >
          <Text style={styles.btnText}>CAMERA</Text>
        </TouchableOpacity>
      </View>

      {statusText ? <Text style={styles.statusLine}>{statusText}</Text> : null}
      {analyzing && (
        <ActivityIndicator color="#8A2BE2" style={{ marginVertical: 8 }} />
      )}

      {preview && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: preview }} style={styles.img} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 16 } as ViewStyle,
  label: { color: "#FFD700", fontSize: 14, fontWeight: "900", marginBottom: 8 },
  row: { flexDirection: "row", gap: 12 } as ViewStyle,
  btn: {
    flex: 1,
    backgroundColor: "#333",
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  } as ViewStyle,
  btnText: { color: "#FFF", fontWeight: "900" } as TextStyle,
  statusLine: {
    color: "#8A2BE2",
    fontSize: 12,
    fontWeight: "900",
    marginVertical: 6,
    textAlign: "center",
  } as TextStyle,
  previewContainer: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  } as ViewStyle,
  img: { width: "100%", height: 180 } as ImageStyle,
});
