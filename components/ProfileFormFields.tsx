import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ProfileFormFieldsProps {
  username: string;
  setUsername: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  editable: boolean; // <-- Added to the type definition
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  username,
  setUsername,
  email,
  setEmail,
  editable, // <-- Destructured here
}) => {
  return (
    <View>
      <Text style={styles.sectionLabel}>IDENTITY CALLSIGN</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]} // <-- Added dynamic styling
        value={username}
        onChangeText={setUsername}
        placeholder="ENTER HERO ALIAS..."
        placeholderTextColor="#888"
        editable={editable} // <-- Passed down to the core input
      />

      <Text style={styles.sectionLabel}>COMMS ROUTING EMAIL</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]} // <-- Added dynamic styling
        value={email}
        onChangeText={setEmail}
        placeholder="ENTER NEW FREQUENCY..."
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={editable} // <-- Passed down to the core input
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000000",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  // Added helper styling to indicate the field is locked/disabled
  disabledInput: {
    backgroundColor: "#1A1A1A",
    color: "#666666",
    borderColor: "#333333",
  },
});
