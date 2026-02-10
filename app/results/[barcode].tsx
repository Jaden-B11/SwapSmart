// app/results/[barcode].tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { getProductByBarcode, type OFFProduct } from "../../src/services/openFoodFacts";

export default function ResultsScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OFFProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const result = await getProductByBarcode(String(barcode ?? ""));
        if (!mounted) return;
        setData(result);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [barcode]);

  const product = data?.product;
  const found = data?.status === 1;

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Results</Text>
        <Text style={styles.sub}>Barcode: {String(barcode)}</Text>
      </View>

      <View style={styles.card}>
        {loading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
            <Text style={styles.body}>Looking up product…</Text>
          </View>
        ) : err ? (
          <>
            <Text style={styles.body}>Error: {err}</Text>
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
          </>
        ) : !found ? (
          <>
            <Text style={styles.body}>Product not found in Open Food Facts.</Text>
            <Text style={styles.muted}>
              Next step: add fallback search/manual entry.
            </Text>
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Scan Another</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.productName}>
              {product?.product_name || "Unnamed product"}
            </Text>
            <Text style={styles.muted}>
              {product?.brands ? `Brand: ${product.brands}` : "Brand: (unknown)"}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.body}>
              Sugars (per 100g):{" "}
              <Text style={styles.bold}>
                {product?.nutriments?.sugars_100g ?? "—"} g
              </Text>
            </Text>

            <Text style={styles.muted}>
              MVP: this is where we’ll show 2–3 “swap” alternatives.
            </Text>

            <Pressable
              style={styles.btnSecondary}
              onPress={() =>
                router.push((`/product/${encodeURIComponent(String(barcode ?? ""))}`) as any)
              }
            >
              <Text style={styles.btnSecondaryText}>View Product Detail</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220", padding: 18, gap: 12 },
  header: { gap: 4, marginTop: 6 },
  title: { color: "white", fontSize: 26, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.7)" },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  productName: { color: "white", fontSize: 18, fontWeight: "800" },
  body: { color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  muted: { color: "rgba(255,255,255,0.6)", lineHeight: 18 },
  bold: { fontWeight: "800", color: "white" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },

  centerRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  btn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#0b1220", fontWeight: "800" },

  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnSecondaryText: { color: "white", fontWeight: "800" },
});
