// app/(tabs)/report.tsx
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

const SPECIES_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

export default function ReportScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Form Parameters
  const [status, setStatus] = useState<"lost" | "found">("lost");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog"); // Default preset checkbox
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Map & Geospatial Tracking Systems
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState(
    "Locating agent positioning data...",
  );
  const [loadingMap, setLoadingMap] = useState(true);

  // Dynamic Content Collections
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [reward, setReward] = useState("");

  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

  // Bootstrap live location parameters immediately upon profile initialization
  useEffect(() => {
    initializeCurrentLocation();
  }, []);

  const initializeCurrentLocation = async () => {
    try {
      const { status: permissionStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== "granted") {
        Alert.alert(
          "ACCESS CONTEXT DENIED",
          "Global positioning tracking is blocked.",
        );
        setResolvedAddress("Location manually designated by agent");
        setLoadingMap(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const dynamicRegion: Region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };

      setMapRegion(dynamicRegion);
      const initialCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setMarkerCoordinate(initialCoords);
      reverseGeocodeCoords(initialCoords.latitude, initialCoords.longitude);
    } catch (err) {
      console.error("Geospatial startup crash:", err);
    } finally {
      setLoadingMap(false);
    }
  };

  // Turn coordinate offsets into flat address metadata strings
  const reverseGeocodeCoords = async (latitude: number, longitude: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResponse && addressResponse.length > 0) {
        const place = addressResponse[0];
        const formatted = `${place.name ? place.name + ", " : ""}${place.district ? place.district + ", " : ""}${place.city || place.subregion || "Unknown Vector"}`;
        setResolvedAddress(formatted);
      }
    } catch (err) {
      setResolvedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  // Convert custom textual location strings directly into map coordinate sets
  const handleGeocodeSearch = async () => {
    if (!searchLocationQuery.trim()) return;
    try {
      setLoadingMap(true);
      const forwardResults = await Location.geocodeAsync(
        searchLocationQuery.trim(),
      );
      if (forwardResults && forwardResults.length > 0) {
        const targetPoint = forwardResults[0];
        const newRegion: Region = {
          latitude: targetPoint.latitude,
          longitude: targetPoint.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        };
        setMapRegion(newRegion);
        setMarkerCoordinate({
          latitude: targetPoint.latitude,
          longitude: targetPoint.longitude,
        });
        setResolvedAddress(searchLocationQuery.trim());
      } else {
        Alert.alert(
          "COORDINATE MISSING",
          "No geographic sector matches this frequency search.",
        );
      }
    } catch (err) {
      Alert.alert(
        "SEARCH FAILED",
        "Unable to establish target coordinates via global naming telemetry.",
      );
    } finally {
      setLoadingMap(false);
    }
  };

  const uploadImageToImgBB = async (uri: string): Promise<string | null> => {
    try {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append("image", { uri, name: filename, type } as any);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const json = await response.json();
      return json.success ? json.data.url : null;
    } catch (err) {
      return null;
    }
  };

  const handleAddPhone = () => setPhoneNumbers([...phoneNumbers, ""]);
  const handleRemovePhone = (index: number) => {
    const updated = [...phoneNumbers];
    updated.splice(index, 1);
    setPhoneNumbers(updated);
  };
  const handlePhoneChange = (text: string, index: number) => {
    const updated = [...phoneNumbers];
    updated[index] = text;
    setPhoneNumbers(updated);
  };

  const handleAddEmail = () => setEmails([...emails, ""]);
  const handleRemoveEmail = (index: number) => {
    const updated = [...emails];
    updated.splice(index, 1);
    setEmails(updated);
  };
  const handleEmailChange = (text: string, index: number) => {
    const updated = [...emails];
    updated[index] = text;
    setEmails(updated);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status: camStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const cleanPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");
    const cleanEmails = emails.map((e) => e.trim()).filter((e) => e !== "");

    if (!resolvedAddress || !description) {
      Alert.alert(
        "Missing Info",
        "Please ensure description and location address tracking are loaded.",
      );
      return;
    }

    if (cleanPhones.length === 0) {
      Alert.alert(
        "Contact Required",
        "Please provide at least one valid phone number.",
      );
      return;
    }

    setSubmitting(true);

    try {
      let cloudImageUrl = null;
      if (imageUri) {
        cloudImageUrl = await uploadImageToImgBB(imageUri);
      }

      const reportsRef = collection(db, "pet_reports");

      await addDoc(reportsRef, {
        userId: user?.uid,
        userEmail: user?.email,
        status,
        petName: status === "found" && !petName ? "Unknown" : petName,
        species: species.toLowerCase(),
        breed: breed.trim() || "Unknown",
        lastSeenLocation: resolvedAddress,
        coordinates: markerCoordinate
          ? { lat: markerCoordinate.latitude, lng: markerCoordinate.longitude }
          : null,
        description: description.trim(),
        imageUrl: cloudImageUrl,
        phoneNumbers: cleanPhones,
        contactEmails: cleanEmails,
        reward: status === "lost" ? reward.trim() : "",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Pet report posted successfully!", [
        {
          text: "OK",
          onPress: () => {
            setPetName("");
            setBreed("");
            setDescription("");
            setImageUri(null);
            setPhoneNumbers([""]);
            setEmails([""]);
            setReward("");
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error.message || "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* --- SPECIES COMIC CHECKBOX MATRIX PANEL --- */}
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

      {/* --- INTEL MAP SCANNING LAYER --- */}
      <Text style={styles.label}>LAST SEEN INCIDENT VECTOR MAP *</Text>
      <View style={styles.mapSearchWrapper}>
        <TextInput
          style={[styles.input, styles.mapSearchInput]}
          placeholder="SEARCH SECTOR VECTOR LOCATION..."
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

      <View style={styles.mapContainerFrame}>
        {loadingMap || !mapRegion ? (
          <View style={styles.mapLoaderPlaceholder}>
            <ActivityIndicator size="small" color="#FFD700" />
            <Text style={styles.mapLoaderText}>
              CALIBRATING COORD ARRAYS...
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.actualMapStyle}
            region={mapRegion}
            onRegionChangeComplete={(reg) => setMapRegion(reg)}
            onPress={(e) => {
              const coordinate = e.nativeEvent.coordinate;
              setMarkerCoordinate(coordinate);
              reverseGeocodeCoords(coordinate.latitude, coordinate.longitude);
            }}
          >
            {markerCoordinate && (
              <Marker
                coordinate={markerCoordinate}
                title="Incident Vector Point"
                pinColor="#8A2BE2"
              />
            )}
          </MapView>
        )}
      </View>

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
        <TouchableOpacity style={styles.comicTextBtn} onPress={handleAddPhone}>
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
            onChangeText={(text) => handlePhoneChange(text, index)}
          />
          {phoneNumbers.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePhone(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* --- EMAILS DYNAMIC FIELD --- */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.label}>CONTACT EMAILS (OPTIONAL)</Text>
        <TouchableOpacity style={styles.comicTextBtn} onPress={handleAddEmail}>
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
            onChangeText={(text) => handleEmailChange(text, index)}
          />
          {emails.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveEmail(index)}
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
  container: { flex: 1, backgroundColor: "#121212" } as ViewStyle,
  contentContainer: { padding: 20, paddingBottom: 60 } as ViewStyle,
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  } as TextStyle,
  statusToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  } as ViewStyle,
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
  } as ViewStyle,
  activeLostButton: { backgroundColor: "#FF4A4A" } as ViewStyle,
  activeFoundButton: { backgroundColor: "#2E7D32" } as ViewStyle,
  toggleButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  } as TextStyle,
  checkboxContainer: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    padding: 12,
    gap: 10,
    marginBottom: 4,
  } as ViewStyle,
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    padding: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
  } as ViewStyle,
  checkboxRowActive: {
    backgroundColor: "#FFFDE6",
    borderColor: "#FFD700",
  } as ViewStyle,
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#121212",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  checkboxBoxActive: {
    borderColor: "#000",
    backgroundColor: "#8A2BE2",
  } as ViewStyle,
  checkboxTickMark: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  } as TextStyle,
  checkboxLabelText: {
    color: "#BBBBBB",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  } as TextStyle,
  checkboxLabelTextActive: {
    color: "#000000",
  } as TextStyle,
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
  } as TextStyle,
  mapSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  } as ViewStyle,
  mapSearchInput: {
    flex: 1,
    marginBottom: 0,
  } as TextStyle,
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
  } as ViewStyle,
  mapSearchBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 13,
  } as TextStyle,
  mapContainerFrame: {
    height: 200,
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 12,
  } as ViewStyle,
  actualMapStyle: {
    ...StyleSheet.absoluteFillObject,
  } as ViewStyle,
  mapLoaderPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  } as ViewStyle,
  mapLoaderText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
  } as TextStyle,
  resolvedAddressBanner: {
    backgroundColor: "#F0F0F0",
    borderWidth: 2,
    borderColor: "#000",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  } as ViewStyle,
  resolvedAddressTitle: {
    color: "#8A2BE2",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  } as TextStyle,
  resolvedAddressValue: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  } as TextStyle,
  textArea: { height: 90, textAlignVertical: "top" } as TextStyle,
  comicPanel: { marginBottom: 4 } as ViewStyle,
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  } as ViewStyle,
  comicTextBtn: {
    backgroundColor: "#8A2BE2",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  } as ViewStyle,
  addButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 11,
  } as TextStyle,
  dynamicRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
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
  } as ViewStyle,
  removeButtonText: { color: "#000", fontWeight: "900" } as TextStyle,
  photoActionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  } as ViewStyle,
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
  } as ViewStyle,
  mediaButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  } as TextStyle,
  previewContainer: {
    alignItems: "center",
    marginTop: 10,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 4,
    backgroundColor: "#000",
    overflow: "hidden",
  } as ViewStyle,
  imagePreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#1E1E1E",
  } as ImageStyle,
  removeImageBadge: {
    width: "100%",
    backgroundColor: "#FF4A4A",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  } as ViewStyle,
  removeImageText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  } as TextStyle,
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
  } as ViewStyle,
  disabledButton: { backgroundColor: "#555" } as ViewStyle,
  submitButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 2,
  } as TextStyle,
});
