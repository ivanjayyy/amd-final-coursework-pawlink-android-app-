// app/(auth)/register.tsx
import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRegister } from "../../hooks/useRegister"; // Adjust path to hook if needed

export default function RegisterScreen() {
  const router = useRouter();

  const {
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
  } = useRegister();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.titleBadge}>
        <Text style={styles.titleText}>NEW AGENT</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error.toUpperCase()}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={pickImage}
        disabled={loading}
      >
        <View style={styles.avatarFrame}>
          <Image
            source={{
              uri:
                imageUri ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>PICK</Text>
          </View>
        </View>
        <Text style={styles.avatarText}>CHOOSE AVATAR ARTWORK</Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>IDENTITY CALLSIGN</Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER HERO ALIAS..."
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.inputLabel}>COMMS ROUTING EMAIL</Text>
      <TextInput
        style={styles.input}
        placeholder="ENTER VALID FREQUENCY..."
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.inputLabel}>SECRET ACCESS CODE</Text>
      <TextInput
        style={styles.input}
        placeholder="CHOOSE PASSWORD..."
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>CONFIRM ACCESS CODE</Text>
      <TextInput
        style={styles.input}
        placeholder="RE-ENTER PASSWORD..."
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>INITIALIZE SIGN UP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
        <Text style={styles.linkText}>ALREADY REGISTERED? SIGN IN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
  titleBadge: {
    backgroundColor: "#FFD700",
    borderWidth: 4,
    borderColor: "#000000",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 4,
    transform: [{ rotate: "-1deg" }],
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 24,
  },
  titleText: {
    color: "#000000",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarFrame: {
    borderWidth: 4,
    borderColor: "#000000",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: "#EAEAEA",
  },
  editBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#8A2BE2",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 2,
  },
  editBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  avatarText: {
    color: "#8A2BE2",
    fontSize: 11,
    marginTop: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  inputLabel: {
    color: "#FFF",
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
    backgroundColor: "#FFD700",
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
    color: "#000000",
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
    fontSize: 12,
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
