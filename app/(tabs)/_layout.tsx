// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#121212", borderTopColor: "#333" },
        tabBarActiveTintColor: "#8A2BE2", // Purple accent
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
        }}
      />
      {/* Add the new report tab configuration here */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report Pet",
        }}
      />
    </Tabs>
  );
}
