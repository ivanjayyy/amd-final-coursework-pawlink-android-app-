// components/report/TextInputField.tsx
import React from "react";
import { StyleSheet, TextInput, TextStyle } from "react-native";

export default function TextInputField(props: any) {
  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        props.style,
        props.borderColor && { borderColor: props.borderColor },
        props.backgroundColor && { backgroundColor: props.backgroundColor },
      ]}
      placeholderTextColor={props.placeholderTextColor || "#777"}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000000",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
  } as TextStyle,
});
