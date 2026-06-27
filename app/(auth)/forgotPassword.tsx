// app/(auth)/forgotPassword.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // Firebase sends the reset link automatically to the provided email
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        "Email Sent",
        "A password reset link has been sent to your email address. Please check your inbox and spam folder.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert(
        "Reset Failed",
        err.message || "Something went wrong. Please check the email entered.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered email address below, and we will send you a link
        to reset your password.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#8A2BE2", // Consistent purple accent
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#aaa",
    fontSize: 14,
  },
});
