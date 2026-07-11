// app/(auth)/login.tsx
import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLogin } from "../../hooks/useLogin"; // Adjust path if needed

export default function LoginScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  } = useLogin();

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
    backgroundColor: "#FF9F43",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
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
    backgroundColor: "#1E1E1E",
    color: "#F5F5F5",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#000000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2DD4BF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1.5,
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
    backgroundColor: "#241A14",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6B6B",
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
    color: "#FF9F43",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
