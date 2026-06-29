import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { PetReport } from "../services/flyerService";

interface EditReportModalProps {
  visible: boolean;
  report: PetReport | null;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<PetReport>) => Promise<void>;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  visible,
  report,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");

  useEffect(() => {
    if (report) {
      setName(report.petName);
      setBreed(report.breed);
      setDescription(report.description);
      setReward(report.reward || "");
    }
  }, [report]);

  const handleCommit = () => {
    if (!report) return;
    onSave(report.id, {
      petName: name.trim(),
      breed: breed.trim(),
      description: description.trim(),
      reward: reward.trim(),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>EDIT INTEL RECORDS</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>PET IDENTIFICATION NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>SPECIFIC BREED GENETICS</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
            />

            {report?.status === "lost" && (
              <>
                <Text style={styles.inputLabel}>REWARD CONFIGURATION</Text>
                <TextInput
                  style={styles.input}
                  value={reward}
                  onChangeText={setReward}
                />
              </>
            )}

            <Text style={styles.inputLabel}>
              DISTINCTIVE VECTORS / DESCRIPTION
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
                <Text style={styles.modalCancelBtnText}>ABORT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCommit}
              >
                <Text style={styles.modalSaveBtnText}>COMMIT CHANGES</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: 4,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 6, height: 6 },
  },
  modalTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000",
    padding: 12,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  textArea: { height: 70, textAlignVertical: "top" },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    justifyContent: "space-between",
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#FF4A4A",
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: "#8A2BE2",
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  modalSaveBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
});
