import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";
import { useProfileBookmarks } from "../../hooks/useProfileBookmarks";
import { ProfileBookmarkGridCard } from "../../components/ProfileBookmarkGridCard";
import { ProfileFormFields } from "../../components/ProfileFormFields";

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { bookmarkedReports, loadingBookmarks, handleToggleBookmark } =
    useProfileBookmarks(user?.uid);
  const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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
            // Explicitly define the parameter type here 👇
            onPress: (password: string | undefined) => resolve(password || ""),
          },
        ],
        "secure-text",
      );
    });
  };

  const handleUpdateDetails = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert("VALIDATION ERROR", "Form fields cannot be left blank.");
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
          "A security verification link has been sent to your new email address.",
        );
      }

      await updateDoc(doc(db, "users", user!.uid), {
        username: username.trim(),
        email: email.trim().toLowerCase(),
      });
      Alert.alert("SUCCESS", "Hero file metadata synchronized flawlessly!");
    } catch (err: any) {
      Alert.alert(
        "UPDATE FAILED",
        err.message || "Failed to alter data layers.",
      );
    } finally {
      setUpdating(false);
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

      <ProfileFormFields
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
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

      <View style={styles.tabSectionHeader}>
        <View style={styles.activeTabIndicator}>
          <Text style={styles.tabHeaderText}>
            ⭐ CLOUD TRANSMISSION SAVES ({bookmarkedReports.length})
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
            <ProfileBookmarkGridCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/report-details/${item.id}`)}
              onBookmarkToggle={() => handleToggleBookmark(item.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.thickDivider} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert("PURGE", "Wipe total architecture?", [
            { text: "CANCEL" },
            {
              text: "WIPE",
              onPress: async () => {
                await deleteDoc(doc(db, "users", user!.uid));
                await deleteUser(auth.currentUser!);
              },
            },
          ])
        }
      >
        <Text style={styles.deleteButtonText}>WIPE CLIENT ACCOUNT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { padding: 16, paddingBottom: 40 },
  headerBar: {
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 24,
    transform: [{ rotate: "0.5deg" }],
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 2,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: { alignItems: "center", marginBottom: 24 },
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
  },
  largeAvatar: { width: 130, height: 130, backgroundColor: "#EAEAEA" },
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
  },
  editBadgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
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
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1.5,
  },
  tabSectionHeader: {
    marginTop: 36,
    borderBottomWidth: 3,
    borderColor: "#000000",
    flexDirection: "row",
    marginBottom: 16,
  },
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
  },
  tabHeaderText: {
    color: "#FFD700",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyGridPlaceholder: {
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    padding: 24,
    alignItems: "center",
  },
  emptyGridText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  thickDivider: { height: 4, backgroundColor: "#000000", marginVertical: 32 },
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
  },
  deleteButtonText: {
    color: "#000000",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
});
