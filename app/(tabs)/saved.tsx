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

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

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
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load swaps: ${res.status} ${text}`);
      }

      const json = await res.json();
      const normalized: SavedSwap[] = Array.isArray(json)
        ? json.map((s: any) => ({
            id: s.id,
            savedAt: s.savedAt ?? s.createdAt,
            sugarDifference: s.sugarDifference ?? null,
            originalProduct: s.originalProduct ?? { barcode: s.originalBarcode },
            alternativeProduct: s.alternativeProduct ?? { barcode: s.alternativeBarcode },
          }))
        : [];

      setItems(normalized);
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
        <View style={styles.header}>
          <Text style={styles.brand}>Saved Swaps</Text>
          <Text style={styles.tagline}>Your saved product alternatives</Text>
        </View>

        <Pressable style={styles.secondaryBtn} onPress={loadSaved}>
          <Text style={styles.secondaryBtnText}>Refresh</Text>
        </Pressable>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.helper}>Loading your saved swaps...</Text>
          </View>
        ) : err ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{err}</Text>
            <Pressable style={styles.primaryBtn} onPress={loadSaved}>
              <Text style={styles.primaryBtnText}>Retry</Text>
              <Text style={styles.primaryBtnSub}>Try loading again</Text>
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
              <Pressable
                disabled={s.alternativeProduct?.barcode == null}
                style={{ flex: 3 }}                     
                onPress={() =>
                  {if (!s.originalProduct?.barcode) return;
                  router.push(
                    (`/product/${encodeURIComponent(s.originalProduct?.barcode)}` as any)
                  )
                }}
              >
                <Text style={styles.label}>Original</Text>
                <Text style={styles.cardTitle}>
                  {s.originalProduct?.productName ?? "Unknown product"}
                </Text>                
                <Text style={styles.helper}>
                  Sugar:{" "}
                  {s.originalProduct?.sugars100g != null
                    ? `${s.originalProduct.sugars100g.toFixed(1)}g / 100g`
                    : "N/A"}
                </Text>
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                disabled={s.alternativeProduct?.barcode == null}
                style={{ flex: 3 }}                     
                onPress={() =>
                  {if (!s.originalProduct?.barcode) return;
                  router.push(
                    (`/product/${encodeURIComponent(s.alternativeProduct?.barcode ?? "N/A")}` as any)
                  )
                }}
              >
                <Text style={styles.label}>Alternative</Text>
                <Text style={styles.cardTitle}>
                  {s.alternativeProduct?.productName ?? "Unknown alternative"}
                </Text>                
                <Text style={styles.helper}>
                  Sugar:{" "}
                  {s.alternativeProduct?.sugars100g != null
                    ? `${s.alternativeProduct.sugars100g.toFixed(1)}g / 100g`
                    : "N/A"}
                </Text>
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  Saved: {s.savedAt ? new Date(s.savedAt).toLocaleDateString() : "N/A"}
                </Text>
                <Text style={styles.meta}>
                  Sugar Difference:{" "}
                  {s.sugarDifference != null
                    ? `${s.sugarDifference.toFixed(1)}g`
                    : "N/A"}
                </Text>
              </View>
            </View>
          ))
        )}
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

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)", marginVertical: 6 },

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

  metaRow: { marginTop: 6, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  meta: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  errorText: { color: "#ffb4b4", fontSize: 13, lineHeight: 18 },
});