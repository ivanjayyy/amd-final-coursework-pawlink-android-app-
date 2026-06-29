// app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { AuthContext, AuthProvider } from "../context/AuthContext";

// Ignore the specific Firebase BloomFilter warning spam
LogBox.ignoreLogs(["@firebase/firestore: Firestore", "BloomFilter error"]);

function RootLayoutNav() {
  const { user, role, loading } = useContext(AuthContext); // <-- Pulled role from context
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentSegments = segments;
    const inAuthGroup = currentSegments[0] === "(auth)";

    if (!user) {
      // If the agent is not signed in and not in the auth zone, send them to login
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // Agent is logged in successfully. Now check security clearance role:
      if (role === "ADMIN") {
        // If you ever build an admin panel, route them here instead:
        // router.replace("/(admin)");
      } else if (inAuthGroup) {
        // Standard user clearance: Route away from login/register grids into the main hub
        router.replace("/(tabs)");
      }
    }
  }, [user, role, loading, segments]); // <-- Added role to dependency array

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
