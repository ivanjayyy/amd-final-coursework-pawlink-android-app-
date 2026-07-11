// app/(auth)/forgotPassword.tsx
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
import { useForgotPassword } from "../../hooks/useForgotPassword";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email, setEmail, loading, error, handlePasswordReset } =
    useForgotPassword();

  return (
    <View style={styles.container}>
      <View style={styles.titleBadge}>
        <Text style={styles.titleText}>RECOVER CODES</Text>
      </View>

      <Text style={styles.subtitle}>
        ENTER YOUR COMMS ROUTING EMAIL TO RESET YOUR SECRET ACCESS CODES.
      </Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error.toUpperCase()}</Text>
        </View>
      ) : null}

      <Text style={styles.inputLabel}>COMMS ROUTING EMAIL</Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER REGISTERED EMAIL..."
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>TRANSMIT RESET LINK</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
        <Text style={styles.linkText}>RETURN TO LOGIN TERMINAL</Text>
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
  titleBadge: {
    backgroundColor: "#FF9F43",
    borderWidth: 1.5,
    borderColor: "#000000",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    transform: [{ rotate: "1deg" }],
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 20,
  },
  titleText: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF9F43",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  },
  buttonText: {
    color: "#000000",
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
});
