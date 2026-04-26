import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SavedSwap = {
  id?: number | string;
  savedAt?: string;
  sugarDifference?: number | null;
  originalProduct?: {
    barcode?: string;
    productName?: string | null;
    sugars100g?: number | null;
  };
  alternativeProduct?: {
    barcode?: string;
    productName?: string | null;
    sugars100g?: number | null;
  };
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

export default function Saved() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SavedSwap[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const loadSaved = async () => {
    try {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("User is not authenticated");

      const res = await fetch(`${API_BASE_URL}/api/swaps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load swaps (${res.status})`);
      }

      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load saved swaps");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Saved Swaps</Text>
        <Text style={styles.subtitle}>
          Your healthier product alternatives
        </Text>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#12AEBA" />
            <Text style={styles.helper}>Loading saved swaps...</Text>
          </View>
        ) : err ? (
          <View style={styles.card}>
            <Text style={styles.error}>{err}</Text>
            <Pressable style={styles.primaryBtn} onPress={loadSaved}>
              <Text style={styles.primaryText}>Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No saved swaps yet</Text>
            <Text style={styles.helper}>
              Save swaps from your results page and they will appear here.
            </Text>
          </View>
        ) : (
          items.map((s, i) => (
            <View key={String(s.id ?? i)} style={styles.card}>
              <Text style={styles.sectionLabel}>Original</Text>
              <Text style={styles.cardTitle}>
                {s.originalProduct?.productName ?? "Unknown product"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Alternative</Text>
              <Text style={styles.cardTitle}>
                {s.alternativeProduct?.productName ?? "Unknown alternative"}
              </Text>

              {s.sugarDifference != null && (
                <Text style={styles.meta}>
                  Sugar saved: {s.sugarDifference.toFixed(1)}g
                </Text>
              )}
            </View>
          ))
        )}
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
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0b1220",
  },
  subtitle: {
    fontSize: 14,
    color: "#5f6c7b",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0b1220",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#12AEBA",
  },
  helper: {
    fontSize: 13,
    color: "#7b8794",
  },
  meta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#12AEBA",
  },
  error: {
    color: "#c0392b",
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: "#12AEBA",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e3edf5",
    marginVertical: 6,
  },
});