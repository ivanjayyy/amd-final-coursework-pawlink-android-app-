import { useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Region } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { validateIsRealAnimal } from "../services/aiService";
import { uploadImageToImgBB } from "../services/imgbbService";

export function usePetReport() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [status, setStatus] = useState<"lost" | "found">("lost");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [reward, setReward] = useState("");

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
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const initialCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setMapRegion({
        ...initialCoords,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
      setMarkerCoordinate(initialCoords);
      reverseGeocodeCoords(initialCoords.latitude, initialCoords.longitude);
    } catch (err) {
      console.error("Geospatial fault:", err);
    } finally {
      setLoadingMap(false);
    }
  };

  const reverseGeocodeCoords = async (latitude: number, longitude: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResponse && addressResponse.length > 0) {
        const place = addressResponse[0];
        setResolvedAddress(
          `${place.name ? place.name + ", " : ""}${place.district ? place.district + ", " : ""}${place.city || place.subregion || "Unknown Vector"}`,
        );
      }
    } catch (err) {
      setResolvedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const handleGeocodeSearch = async () => {
    if (!searchLocationQuery.trim()) return;
    try {
      setLoadingMap(true);
      const forwardResults = await Location.geocodeAsync(
        searchLocationQuery.trim(),
      );
      if (forwardResults && forwardResults.length > 0) {
        const targetPoint = forwardResults[0];
        setMapRegion({
          latitude: targetPoint.latitude,
          longitude: targetPoint.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        });
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
        "Unable to establish target coordinates via telemetry.",
      );
    } finally {
      setLoadingMap(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
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
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    const cleanPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p !== "");
    const cleanEmails = emails.map((e) => e.trim()).filter((e) => e !== "");

    if (!resolvedAddress || !description) {
      Alert.alert(
        "Missing Info",
        "Please ensure description and address tracking are loaded.",
      );
      return;
    }
    if (cleanPhones.length === 0) {
      Alert.alert(
        "Contact Required",
        "Please provide at least one phone number.",
      );
      return;
    }

    setSubmitting(true);

    try {
      if (imageUri) {
        const scan = await validateIsRealAnimal(imageUri);
        if (!scan.isValid) {
          Alert.alert(
            "BIO-SCAN REJECTION",
            `Security system flag: ${scan.reasoning.toUpperCase()}`,
          );
          setSubmitting(false);
          return;
        }
      }

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

  return {
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
  };
}
