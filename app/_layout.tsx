import { Slot, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { AuthContext, AuthProvider } from "../context/AuthContext";

LogBox.ignoreLogs(["@firebase/firestore: Firestore", "BloomFilter error"]);

function RootLayoutNav() {
  const { user, role, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  // Use a ref to ensure the routing navigation engine is fully ready to take commands
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // 1. Strict Guard: Don't process anything while auth state layers are compiling
    if (loading || !isMounted.current) return;

    // 2. Identify precisely where the client is pointing right now
    const inAuthGroup = segments[0] === "(auth)";

    if (!user) {
      // 3. Force non-authenticated sessions back into the security login portal safely
      if (!inAuthGroup) {
        // Wrap in setTimeout to ensure Expo Router has finished layout mounting tasks
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 1);
      }
    } else {
      // 4. Authenticated sessions zone checks
      if (role === "ADMIN") {
        // router.replace("/(admin)");
      } else if (inAuthGroup) {
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1);
      }
    }
  }, [user, role, loading, segments]);

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
      <RootLayoutNav />
    </AuthProvider>
  );
}
