// src/hooks/useRegister.ts
import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // Adjust path if needed
import { uploadProfileImage } from "../services/imageService";

export function useRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "PERMISSION DENIED",
        "We need photo library access to upload an avatar!",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("ALL INTEL FIELDS MUST BE FILLED");
      return;
    }
    if (password !== confirmPassword) {
      setError("PASSCODES DO NOT MATCH");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let profilePicUrl =
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

      if (imageUri) {
        const cloudUrl = await uploadProfileImage(imageUri);
        if (cloudUrl) profilePicUrl = cloudUrl;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username.trim(),
        email: user.email,
        profilePicture: profilePicUrl,
        createdAt: new Date().toISOString(),
        role: "USER", // <-- Updated to strict uppercase "USER"
      });
    } catch (err: any) {
      setError(err.message || "FAILED TO CREATE AGENT FILE");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    imageUri,
    loading,
    error,
    pickImage,
    handleRegister,
  };
}
