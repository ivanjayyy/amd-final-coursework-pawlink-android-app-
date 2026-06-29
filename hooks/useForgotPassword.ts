// src/hooks/useForgotPassword.ts
import { useState } from "react";
import { Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../config/firebase";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!email) {
      setError("EMAIL FIELD MUST BE FILLED TO TRANSMIT RECOVERY");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        "TRANSMISSION SUCCESSFUL",
        "A secure access recovery link has been routed to your frequency.",
        [
          {
            text: "ACKNOWLEDGED",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (err: any) {
      setError(err.message || "COULD NOT ROUTE RECOVERY SIGNAL");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    handlePasswordReset,
  };
}
