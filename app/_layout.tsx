// app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext, AuthProvider } from "../context/AuthContext";

function RootLayoutNav() {
  const { user, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Cast segments as any so TypeScript doesn't check literal folder names yet
    const currentSegments = segments;
    const inAuthGroup = currentSegments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Cast the route path as any to bypass strict route checking
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Cast the route path as any to bypass strict route checking
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
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
