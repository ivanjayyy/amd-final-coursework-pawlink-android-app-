// context/AuthContext.tsx
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { auth, db } from "../config/firebase"; // Make sure db is imported

interface AuthContextType {
  user: User | null;
  role: string | null; // <-- Added role state to context layout
  username: string | null; // <-- Optional: Added username for profile UI convenience
  loading: boolean;
}

// Initialize the context with our updated type layout
export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  username: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser);

        try {
          // Fetch the user's profile metadata from your Firestore 'users' collection
          const userDocRef = doc(db, "users", authenticatedUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || "USER");
            setUsername(userData.username || null);
          } else {
            // Fallback if auth exists but firestore record hasn't written yet
            setRole("USER");
          }
        } catch (error) {
          console.error("Error fetching user profile intelligence:", error);
          setRole("USER"); // Safe fallback
        }
      } else {
        // Clear all session states if logged out
        setUser(null);
        setRole(null);
        setUsername(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, username, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
