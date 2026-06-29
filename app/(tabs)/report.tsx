import React from "react";
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
import { usePetReport } from "../../hooks/usePetReport";
import { MapFrame } from "../../components/MapFrame";

const SPECIES_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

export default function ReportScreen() {
  const {
    status,
    setStatus,
    petName,
    setPetName,
    species,
    setSpecies,
    breed,
    setBreed,
    description,
    setDescription,
    imageUri,
    setImageUri,
    submitting,
    mapRegion,
    setMapRegion,
    markerCoordinate,
    setMarkerCoordinate,
    searchLocationQuery,
    setSearchLocationQuery,
    resolvedAddress,
    loadingMap,
    phoneNumbers,
    setPhoneNumbers,
    emails,
    setEmails,
    reward,
    setReward,
    handleGeocodeSearch,
    reverseGeocodeCoords,
    pickImage,
    takePhoto,
    handleSubmit,
  } = usePetReport();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>REPORT STATUS</Text>
      <View style={styles.statusToggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "lost" && styles.activeLostButton,
          ]}
          onPress={() => setStatus("lost")}
        >
          <Text style={styles.toggleButtonText}>LOST</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            status === "found" && styles.activeFoundButton,
          ]}
          onPress={() => setStatus("found")}
        >
          <Text style={styles.toggleButtonText}>FOUND</Text>
        </TouchableOpacity>
      </View>

      {status === "lost" && (
        <View style={styles.comicPanel}>
          <Text style={[styles.label, { color: "#FF4A4A" }]}>
            REWARD OFFERED (OPTIONAL)
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: "#FFD700", backgroundColor: "#FFFDE6" },
            ]}
            placeholder="e.g. Rs. 5,000 or Cash Reward"
            placeholderTextColor="#777"
            value={reward}
            onChangeText={setReward}
          />
        </View>
      )}

      <Text style={styles.label}>SPECIES IDENTIFICATION *</Text>
      <View style={styles.checkboxContainer}>
        {SPECIES_OPTIONS.map((opt) => {
          const isSelected = species.toLowerCase() === opt.toLowerCase();
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.checkboxRow,
                isSelected && styles.checkboxRowActive,
              ]}
              onPress={() => setSpecies(opt)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  isSelected && styles.checkboxBoxActive,
                ]}
              >
                {isSelected && <Text style={styles.checkboxTickMark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.checkboxLabelText,
                  isSelected && styles.checkboxLabelTextActive,
                ]}
              >
                {opt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>
        PET NAME {status === "found" && "(OPTIONAL)"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={status === "found" ? "e.g. Unknown" : "e.g. Max"}
        placeholderTextColor="#777"
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>BREED (OPTIONAL)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Persian, German Shepherd"
        placeholderTextColor="#777"
        value={breed}
        onChangeText={setBreed}
      />

      <Text style={styles.label}>LAST SEEN INCIDENT VECTOR MAP *</Text>
      <View style={styles.mapSearchWrapper}>
        <TextInput
          style={[styles.input, styles.mapSearchInput]}
          placeholder="SEARCH LOCATION..."
          placeholderTextColor="#888"
          value={searchLocationQuery}
          onChangeText={setSearchLocationQuery}
          onSubmitEditing={handleGeocodeSearch}
        />
        <TouchableOpacity
          style={styles.mapSearchBtn}
          onPress={handleGeocodeSearch}
        >
          <Text style={styles.mapSearchBtnText}>SCAN</Text>
        </TouchableOpacity>
      </View>

      <MapFrame
        loadingMap={loadingMap}
        mapRegion={mapRegion}
        markerCoordinate={markerCoordinate}
        onRegionChange={(reg) => setMapRegion(reg)}
        onMapPress={(coords) => {
          setMarkerCoordinate(coords);
          reverseGeocodeCoords(coords.latitude, coords.longitude);
        }}
      />

      <View style={styles.resolvedAddressBanner}>
        <Text style={styles.resolvedAddressTitle}>
          TARGET INTEL SITE ADDRESS:
        </Text>
        <Text style={styles.resolvedAddressValue}>
          {resolvedAddress.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.label}>DISTINCTIVE DESCRIPTION *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe unique features or marks..."
        placeholderTextColor="#777"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* --- PHONE NUMBERS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>PHONE NUMBERS *</Text>
        <TouchableOpacity
          style={styles.comicTextBtn}
          onPress={() => setPhoneNumbers([...phoneNumbers, ""])}
        >
          <Text style={styles.addButtonText}>+ ADD PHONE</Text>
        </TouchableOpacity>
      </View>

      {phoneNumbers.map((phone, index) => (
        <View key={`phone-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. 0771234567"
            placeholderTextColor="#777"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              const updated = [...phoneNumbers];
              updated[index] = text;
              setPhoneNumbers(updated);
            }}
          />
          {phoneNumbers.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const updated = [...phoneNumbers];
                updated.splice(index, 1);
                setPhoneNumbers(updated);
              }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* --- EMAILS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>CONTACT EMAILS (OPTIONAL)</Text>
        <TouchableOpacity
          style={styles.comicTextBtn}
          onPress={() => setEmails([...emails, ""])}
        >
          <Text style={styles.addButtonText}>+ ADD EMAIL</Text>
        </TouchableOpacity>
      </View>

      {emails.map((emailItem, index) => (
        <View key={`email-${index}`} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. contact@domain.com"
            placeholderTextColor="#777"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailItem}
            onChangeText={(text) => {
              const updated = [...emails];
              updated[index] = text;
              setEmails(updated);
            }}
          />
          {emails.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const updated = [...emails];
                updated.splice(index, 1);
                setEmails(updated);
              }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={styles.label}>PET PHOTO</Text>
      <View style={styles.photoActionRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>GALLERY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Text style={styles.mediaButtonText}>CAMERA</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageBadge}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageText}>✕ REMOVE PHOTO</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT REPORT</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { padding: 20, paddingBottom: 60 },
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  },
  statusToggleRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  toggleButton: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  },
  activeLostButton: { backgroundColor: "#FF4A4A" },
  activeFoundButton: { backgroundColor: "#2E7D32" },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  checkboxContainer: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    padding: 12,
    gap: 10,
    marginBottom: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    padding: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
  },
  checkboxRowActive: { backgroundColor: "#FFFDE6", borderColor: "#FFD700" },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#121212",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxActive: { borderColor: "#000", backgroundColor: "#8A2BE2" },
  checkboxTickMark: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  checkboxLabelText: {
    color: "#BBBBBB",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  checkboxLabelTextActive: { color: "#000000" },
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
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  },
  mapSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  mapSearchInput: { flex: 1, marginBottom: 0 },
  mapSearchBtn: {
    backgroundColor: "#FFD700",
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
  mapSearchBtnText: { color: "#000", fontWeight: "900", fontSize: 13 },
  resolvedAddressBanner: {
    backgroundColor: "#F0F0F0",
    borderWidth: 2,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  resolvedAddressTitle: {
    color: "#8A2BE2",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  resolvedAddressValue: { color: "#000000", fontSize: 13, fontWeight: "700" },
  textArea: { height: 90, textAlignVertical: "top" },
  comicPanel: { marginBottom: 4 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  comicTextBtn: {
    backgroundColor: "#8A2BE2",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  addButtonText: { color: "#FFF", fontWeight: "900", fontSize: 11 },
  dynamicRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: "#FF4A4A",
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
  removeButtonText: { color: "#000", fontWeight: "900" },
  photoActionRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  mediaButton: {
    flex: 1,
    backgroundColor: "#333",
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  },
  mediaButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 10,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  imagePreview: { width: "100%", height: 180, backgroundColor: "#1E1E1E" },
  removeImageBadge: {
    width: "100%",
    backgroundColor: "#FF4A4A",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  removeImageText: { color: "#000", fontSize: 13, fontWeight: "900" },
  submitButton: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
  },
  disabledButton: { backgroundColor: "#555" },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 2,
  },
});
