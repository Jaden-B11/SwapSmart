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
  View
} from "react-native";

type ProfileInfo = {
  id?: number | string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  const [items, setItems] = useState<ProfileInfo[]>([]);
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
      const normalized: ProfileInfo = {
        id: json?.id ?? null,
        userName: json?.username ?? null,
        firstName: json?.firstName ?? null,
        lastName: json?.lastName ?? null,
      };

      setProfile(normalized);
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
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              // AuthGate in _layout.tsx will automatically redirect to tabs
            } catch (error: any) {
              Alert.alert("Error", error.message || "Sign out failed.");
            }
          }
        }
      ]
    );
  };

  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "No name set";
  const username = profile?.userName || "No username set";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.brand}>Profile</Text>
        </View>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.helper}>Loading profile...</Text>
          </View>
        ) : err ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{err}</Text>
            <Pressable style={styles.primaryBtn} onPress={loadProfile}>
              <Text style={styles.primaryBtnText}>Retry</Text>
              <Text style={styles.primaryBtnSub}>Try loading again</Text>
            </Pressable>
          </View>
        ) : !profile ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No profile found</Text>
            <Text style={styles.helper}>Could not find your profile details yet.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Name</Text>
            <Text style={styles.label}>{fullName}</Text>

            <Text style={styles.cardTitle}>Username</Text>
            <Text style={styles.label}>{username}</Text>

            <Text style={styles.cardTitle}>Email</Text>
            <Text style={styles.label}>{user?.email}</Text>
          </View>
        )}

        {/* Sign Out */}
        <Pressable onPress={handleSignOut}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Out</Text>
          </View>
        </Pressable>

        {/* Delete Account, Not functional */}
        {/* <Pressable onPress={() => Alert.alert("Are you sure?")}>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, {color:'red'}]}>Delete Account</Text>
          </View>
        </Pressable> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 18, gap: 14, paddingBottom: 24 },

  header: { gap: 6, marginTop: 6 },
  brand: { fontSize: 34, fontWeight: "800", color: "white" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 20 },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  cardTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  label: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  helper: { fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 18 },

  primaryBtn: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#0b1220" },
  primaryBtnSub: { marginTop: 2, fontSize: 12, color: "rgba(11,18,32,0.65)" },

  secondaryBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: { color: "white", fontWeight: "700" },

  row: { flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-between" },
  errorText: { color: "#ffb4b4", fontSize: 13, lineHeight: 18 },
});