// app/(tabs)/profile.tsx
import * as ImagePicker from "expo-image-picker";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  // REPLACE WITH YOUR IMGBB API KEY
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
        setEmail(data.email || "");
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
        "Permission Required",
        "We need access to change your avatar image.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
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
        Alert.alert("Success", "Profile image modified successfully!");
      }
    } catch (err) {
      Alert.alert(
        "Upload Error",
        "Could not save your image to the host server.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateDetails = async () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username field cannot be left blank.");
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        username: username.trim(),
      });
      Alert.alert("Success", "Profile metadata synchronized cleanly!");
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.message || "Failed to edit user values.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to completely remove your profile data? This process is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
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
        // 1. Clear out Firestore reference configuration data
        await deleteDoc(doc(db, "users", currentUser.uid));
        // 2. Kill the primary session within Auth DB maps
        await deleteUser(currentUser);
        // Note: AuthContext handles system state reset automatically via session observation hooks
      }
    } catch (err: any) {
      // Security Check: Firebase requires users to have authenticated recently to execute deletions
      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "Re-authentication Required",
          "For security reasons, please sign out, log back in, and immediately re-attempt account deletion.",
        );
      } else {
        Alert.alert("Deletion Error", err.message || "Something went wrong.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={changeProfilePicture} disabled={updating}>
          <Image source={{ uri: profilePic }} style={styles.largeAvatar} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.userEmailText}>{email}</Text>
      </View>

      <Text style={styles.sectionLabel}>Display Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdateDetails}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Details</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
        disabled={updating}
      >
        <Text style={styles.deleteButtonText}>Delete PawLink Account</Text>
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
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#8A2BE2",
    backgroundColor: "#1e1e1e",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#8A2BE2",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  editBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  userEmailText: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 12,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 15,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 32,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ff4a4a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ff4a4a",
    fontWeight: "bold",
    fontSize: 15,
  },
});
