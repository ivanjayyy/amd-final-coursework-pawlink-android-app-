// app/(tabs)/profile.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
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
import { auth, db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  userEmail: string;
}

const BOOKMARKS_KEY = "@pawlink_bookmarks";

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Bookmarks State Data
  const [bookmarkedReports, setBookmarkedReports] = useState<PetReport[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Sync with Firestore all pet_reports, then filter down to matched stored local IDs
  useEffect(() => {
    const reportsRef = collection(db, "pet_reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
          const bookmarkIds: string[] = stored ? JSON.parse(stored) : [];

          const matches: PetReport[] = [];
          snapshot.forEach((doc) => {
            if (bookmarkIds.includes(doc.id)) {
              matches.push({ id: doc.id, ...doc.data() } as PetReport);
            }
          });
          setBookmarkedReports(matches);
        } catch (err) {
          console.error("Error matching local records context:", err);
        } finally {
          setLoadingBookmarks(false);
        }
      },
      (error) => {
        console.error(error);
        setLoadingBookmarks(false);
      },
    );

    return unsubscribe;
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user!.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || "");
        setEmail(auth.currentUser?.email || data.email || "");
        setProfilePic(
          data.profilePicture ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        );
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setFetching(false);
    }
  };

  const changeProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "PERMISSION REQUIRED",
        "We need camera roll access to change your avatar panel.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAndSaveNewAvatar(result.assets[0].uri);
    }
  };

  const uploadAndSaveNewAvatar = async (localUri: string) => {
    setUpdating(true);
    try {
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append("image", { uri: localUri, name: filename, type } as any);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const json = await response.json();
      if (json.success) {
        const uploadedUrl = json.data.url;
        await updateDoc(doc(db, "users", user!.uid), {
          profilePicture: uploadedUrl,
        });
        setProfilePic(uploadedUrl);
        Alert.alert("SUCCESS", "Profile canvas artwork modified cleanly!");
      }
    } catch (err) {
      Alert.alert(
        "UPLOAD ERROR",
        "Could not save your frame to the cloud sector.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const promptReauthentication = (): Promise<string> => {
    return new Promise((resolve) => {
      Alert.prompt(
        "SECURITY CHECK",
        "Please re-enter your secret password to verify this profile modification:",
        [
          { text: "CANCEL", style: "cancel", onPress: () => resolve("") },
          {
            text: "CONFIRM",
            onPress: (password: string | undefined) => resolve(password || ""),
          },
        ],
        "secure-text",
      );
    });
  };

  const handleUpdateDetails = async () => {
    if (!username.trim()) {
      Alert.alert(
        "VALIDATION ERROR",
        "The Identity Code name can't be left blank.",
      );
      return;
    }
    if (!email.trim()) {
      Alert.alert(
        "VALIDATION ERROR",
        "The Comms link channel email can't be empty.",
      );
      return;
    }

    setUpdating(true);
    try {
      const currentUser = auth.currentUser;

      if (
        currentUser &&
        email.trim().toLowerCase() !== currentUser.email?.toLowerCase()
      ) {
        const password = await promptReauthentication();
        if (!password) {
          setUpdating(false);
          return;
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          password,
        );
        await reauthenticateWithCredential(currentUser, credential);

        await verifyBeforeUpdateEmail(currentUser, email.trim().toLowerCase());
        Alert.alert(
          "VERIFICATION SENT",
          "A security check link has been deployed to your new email address. Your record updates completely once confirmed.",
        );
      }

      await updateDoc(doc(db, "users", user!.uid), {
        username: username.trim(),
        email: email.trim().toLowerCase(),
      });

      Alert.alert("SUCCESS", "Hero file metadata synchronized flawlessly!");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        Alert.alert(
          "TRANSMISSION FAIL",
          "This email frequency is already claimed by another agent.",
        );
      } else if (err.code === "auth/wrong-password") {
        Alert.alert("ACCESS DENIED", "Incorrect passcode validation sequence.");
      } else {
        Alert.alert(
          "UPDATE FAILED",
          err.message || "Failed to alter data layers.",
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "ACCOUNT SELF-DESTRUCT",
      "Are you entirely certain you want to purge your data file from our system grid? This wipe is total and irreversible.",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "PERMANENT WIPEOUT",
          style: "destructive",
          onPress: executeAccountDeletion,
        },
      ],
    );
  };

  const executeAccountDeletion = async () => {
    setUpdating(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(currentUser);
      }
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "RE-AUTHENTICATION REQUIRED",
          "For severe safety tasks, please log out, cycle back into the system, and trigger this purge command instantly.",
        );
      } else {
        Alert.alert(
          "DELETION FAILURE",
          err.message || "An unexpected error blocked the wipe.",
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  const removeBookmarkDirectly = async (id: string) => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        const bookmarkIds: string[] = JSON.parse(stored);
        const filtered = bookmarkIds.filter((bookmarkId) => bookmarkId !== id);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
        // State instantly updates via the active onSnapshot real-time link listener above!
      }
    } catch (err) {
      console.error("Failed to delete bookmark selection:", err);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>AGENT PROFILE FILE</Text>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarFrame}
          onPress={changeProfilePicture}
          disabled={updating}
        >
          <Image source={{ uri: profilePic }} style={styles.largeAvatar} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>ALTER</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>IDENTITY CALLSIGN</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="ENTER HERO ALIAS..."
        placeholderTextColor="#888"
      />

      <Text style={styles.sectionLabel}>COMMS ROUTING EMAIL</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="ENTER NEW FREQUENCY..."
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdateDetails}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.saveButtonText}>SAVE CHANGELOG</Text>
        )}
      </TouchableOpacity>

      {/* --- TikTok Style Intercept Bookmark Panel Container --- */}
      <View style={styles.tabSectionHeader}>
        <View style={styles.activeTabIndicator}>
          <Text style={styles.tabHeaderText}>
            ⭐ TRANSMISSION SAVES ({bookmarkedReports.length})
          </Text>
        </View>
      </View>

      {loadingBookmarks ? (
        <ActivityIndicator
          size="small"
          color="#FFD700"
          style={{ marginVertical: 20 }}
        />
      ) : bookmarkedReports.length === 0 ? (
        <View style={styles.emptyGridPlaceholder}>
          <Text style={styles.emptyGridText}>
            NO INTEL CACHED IN THIS PROFILE LOG.
          </Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {bookmarkedReports.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <Image
                source={{
                  uri:
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500",
                }}
                style={styles.gridCardImage}
                resizeMode="cover"
              />
              <View style={styles.gridCardMeta}>
                <Text style={styles.gridCardTitle} numberOfLines={1}>
                  {item.petName.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.gridStatusLabel,
                    item.status === "lost"
                      ? styles.gridLostText
                      : styles.gridFoundText,
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.gridCardPurgeBtn}
                onPress={() => removeBookmarkDirectly(item.id)}
              >
                <Text style={styles.gridPurgeBtnText}>UNSAVE</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.thickDivider} />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
        disabled={updating}
      >
        <Text style={styles.deleteButtonText}>WIPE CLIENT ACCOUNT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  } as ViewStyle,
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  } as ViewStyle,
  headerBar: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 24,
    transform: [{ rotate: "0.5deg" }],
  } as ViewStyle,
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 2,
    textAlign: "center",
  } as TextStyle,
  centered: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  } as ViewStyle,
  avatarFrame: {
    borderWidth: 4,
    borderColor: "#000000",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    position: "relative",
  } as ViewStyle,
  largeAvatar: {
    width: 130,
    height: 130,
    backgroundColor: "#EAEAEA",
  } as ImageStyle,
  editBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#FFD700",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 2,
  } as ViewStyle,
  editBadgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  } as TextStyle,
  sectionLabel: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 12,
  } as TextStyle,
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
  } as TextStyle,
  saveButton: {
    backgroundColor: "#8A2BE2",
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
  } as ViewStyle,
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1.5,
  } as TextStyle,
  tabSectionHeader: {
    marginTop: 36,
    borderBottomWidth: 3,
    borderColor: "#000000",
    flexDirection: "row",
    marginBottom: 16,
  } as ViewStyle,
  activeTabIndicator: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000",
    borderBottomWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -3,
  } as ViewStyle,
  tabHeaderText: {
    color: "#FFD700",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  } as TextStyle,
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  } as ViewStyle,
  gridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  } as ViewStyle,
  gridCardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#EAEAEA",
    borderBottomWidth: 2,
    borderColor: "#000",
  } as ImageStyle,
  gridCardMeta: {
    padding: 8,
  } as ViewStyle,
  gridCardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
  } as TextStyle,
  gridStatusLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 2,
  } as TextStyle,
  gridLostText: { color: "#FF4A4A" } as TextStyle,
  gridFoundText: { color: "#2E7D32" } as TextStyle,
  gridCardPurgeBtn: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 6,
    alignItems: "center",
    borderTopWidth: 2,
    borderColor: "#000",
  } as ViewStyle,
  gridPurgeBtnText: {
    color: "#FF4A4A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  } as TextStyle,
  emptyGridPlaceholder: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    padding: 24,
    alignItems: "center",
  } as ViewStyle,
  emptyGridText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  } as TextStyle,
  thickDivider: {
    height: 4,
    backgroundColor: "#000000",
    marginVertical: 32,
  } as ViewStyle,
  deleteButton: {
    backgroundColor: "#FF4A4A",
    borderWidth: 3,
    borderColor: "#000000",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
  } as ViewStyle,
  deleteButtonText: {
    color: "#000000",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  } as TextStyle,
});
