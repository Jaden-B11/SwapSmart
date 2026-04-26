import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfileInfo = {
  id?: number | string;
  userName?: string;
  firstName?: string;
  lastName?: string;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("User is not authenticated");

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load profile info: ${res.status} ${text}`);
      }

      const json = await res.json();
      setProfile({
        id: json?.id ?? null,
        userName: json?.username ?? null,
        firstName: json?.firstName ?? null,
        lastName: json?.lastName ?? null,
      });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load profile info");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Sign out failed.");
          }
        },
      },
    ]);
  };

  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "No name set";
  const username = profile?.userName || "User";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Greeting Section */}
        <View style={styles.heroCard}>
          <Text style={styles.greeting}>Hello, {username} 👋</Text>
          <Text style={styles.subGreeting}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Info */}
        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#12AEBA" />
            <Text style={styles.helper}>Loading profile...</Text>
          </View>
        ) : err ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{err}</Text>
            <Pressable style={styles.primaryBtn} onPress={loadProfile}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View style={styles.card}>
            <Text style={styles.labelTitle}>Full Name</Text>
            <Text style={styles.value}>{fullName}</Text>

            <View style={styles.divider} />

            <Text style={styles.labelTitle}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        ) : null}

        {/* Sign Out Button */}
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f8fb",
  },
  container: {
    padding: 20,
    gap: 20,
  },

  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0b1220",
  },
  subGreeting: {
    fontSize: 14,
    color: "#5f6c7b",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  labelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#12AEBA",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0b1220",
  },

  helper: {
    fontSize: 13,
    color: "#7b8794",
  },

  primaryBtn: {
    backgroundColor: "#12AEBA",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  signOutBtn: {
    backgroundColor: "#ffecec",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    color: "#c0392b",
    fontWeight: "700",
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#e3edf5",
  },

  errorText: {
    color: "#c0392b",
    fontSize: 13,
  },
});