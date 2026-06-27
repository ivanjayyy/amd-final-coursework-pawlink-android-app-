// app/(auth)/login.tsx
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("ALL INTEL FIELDS MUST BE FILLED");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError(err.message || "FAILED TO ACCESS AGENT PROFILE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Identity Panel */}
      <View style={styles.brandPanel}>
        <Text style={styles.brandTitleText}>PAWLINK</Text>
        <Text style={styles.brandSubtitleText}>RESCUE NETWORK GRID</Text>
      </View>

      <Text style={styles.title}>WELCOME BACK, AGENT</Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error.toUpperCase()}</Text>
        </View>
      ) : null}

      <Text style={styles.inputLabel}>COMMS ROUTING EMAIL</Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER REGISTRATION EMAIL..."
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.inputLabel}>SECRET ACCESS CODE</Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER PASSWORD ENTRY..."
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.forgotPasswordLink}
        onPress={() => router.push("/(auth)/forgotPassword")}
      >
        <Text style={styles.forgotPasswordText}>RECOVER ACCESS CODE?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>ACCESS GRANTED</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.linkText}>NEW AGENT? INITIALIZE SIGN UP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#121212",
  },
  brandPanel: {
    backgroundColor: "#FFD700",
    borderWidth: 4,
    borderColor: "#000000",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 4,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    marginBottom: 36,
  },
  brandTitleText: {
    color: "#000000",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 4,
  },
  brandSubtitleText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: -2,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 3,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1.5,
  },
  errorBanner: {
    backgroundColor: "#FFFDE6",
    borderWidth: 2,
    borderColor: "#FF4A4A",
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF4A4A",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#AAA",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
