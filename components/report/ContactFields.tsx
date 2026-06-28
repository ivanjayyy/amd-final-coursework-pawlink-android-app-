// components/report/ContactFields.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  phoneNumbers: string[];
  setPhoneNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  emails: string[];
  setEmails: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ContactFields({
  phoneNumbers,
  setPhoneNumbers,
  emails,
  setEmails,
}: Props) {
  const dynamicUpdate = (
    list: string[],
    setList: any,
    val: string,
    idx: number,
  ) => {
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
  };

  const removeRow = (list: string[], setList: any, idx: number) => {
    const updated = [...list];
    updated.splice(idx, 1);
    setList(updated);
  };

  return (
    <View>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>PHONE NUMBERS *</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setPhoneNumbers([...phoneNumbers, ""])}
        >
          <Text style={styles.btnText}>+ ADD</Text>
        </TouchableOpacity>
      </View>
      {phoneNumbers.map((phone, i) => (
        <View key={`p-${i}`} style={styles.fieldRow}>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(t) =>
              dynamicUpdate(phoneNumbers, setPhoneNumbers, t, i)
            }
          />
          {phoneNumbers.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeRow(phoneNumbers, setPhoneNumbers, i)}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: "#FFD700", fontSize: 14, fontWeight: "900" },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 4,
  } as ViewStyle,
  btn: {
    backgroundColor: "#8A2BE2",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: "center",
  } as ViewStyle,
  btnText: { color: "#FFF", fontWeight: "900", fontSize: 11 },
  fieldRow: { flexDirection: "row", gap: 10, marginBottom: 12 } as ViewStyle,
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 14,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
  } as TextStyle,
  removeBtn: {
    backgroundColor: "#FF4A4A",
    padding: 14,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
  } as ViewStyle,
  removeText: { fontWeight: "900" } as TextStyle,
});
