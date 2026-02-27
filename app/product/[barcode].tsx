import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Pressable, ScrollView } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getProductByBarcode, type OFFProduct } from "../../src/services/openFoodFacts";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const bc = useMemo(() => String(barcode ?? "").trim(), [barcode]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OFFProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setErr(null);
      const result = await getProductByBarcode(bc);
      setData(result);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load product");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bc) {
      setLoading(false);
      setErr("Missing barcode");
      return;
    }
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bc]);

  const found = data?.status === 1;
  const p = data?.product;
  const n = p?.nutriments;

  return (
    <View style={styles.safe}>
      <Stack.Screen
        options={{
          title: "Product Detail",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
            <Text style={styles.body}>Loading product…</Text>
          </View>
        ) : err ? (
          <View style={styles.card}>
            <Text style={styles.body}>Error: {err}</Text>
            <Pressable style={styles.btnSecondary} onPress={fetchProduct}>
              <Text style={styles.btnSecondaryText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
          </View>
        ) : !found ? (
          <View style={styles.card}>
            <Text style={styles.body}>Product not found.</Text>
            <Text style={styles.muted}>Try scanning again or use manual entry.</Text>
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.title}>{p?.product_name || "Unnamed product"}</Text>
              <Text style={styles.muted}>
                {p?.brands ? `Brand: ${p.brands}` : "Brand: (unknown)"}
              </Text>

              {!!p?.image_url && (
                <Image source={{ uri: p.image_url }} style={styles.image} resizeMode="contain" />
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Nutrition (quick view)</Text>

              <Row label="Calories (100g)" value={`${fmtNumber((n as any)?.["energy-kcal_100g"], 0)} cals`} />
              <Row label="Calories (per serving)" value={`${fmtNumber((n as any)?.["energy-kcal_serving"], 0)} cals`} />
              <Row label="Sugars (100g)" value={`${fmtNumber(n?.sugars_100g)} g`} />
              <Row label="Carbs (100g)" value={`${fmtNumber(n?.carbohydrates_100g)} g`} />
              <Row label="Salt (100g)" value={`${fmtNumber(n?.salt_100g)} g`} />

              <Text style={styles.smallNote}>
                (MVP) Later: show “why this is a good swap” + alternatives here.
              </Text>
            </View>

            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back to Results</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function fmtNumber(v: any, decimals = 2) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function fmt(v: any, unit: string) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v} ${unit}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 18, gap: 12 },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  title: { color: "white", fontSize: 18, fontWeight: "800" },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "800" },
  body: { color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  muted: { color: "rgba(255,255,255,0.6)", lineHeight: 18 },

  image: { width: "100%", height: 180, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)" },

  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "rgba(255,255,255,0.75)" },
  rowValue: { color: "white", fontWeight: "800" },

  smallNote: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 18, marginTop: 6 },

  centerRow: { flexDirection: "row", gap: 10, alignItems: "center", padding: 18 },

  btn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
    marginHorizontal: 18,
  },
  btnText: { color: "#0b1220", fontWeight: "800" },

  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 6,
  },
  btnSecondaryText: { color: "white", fontWeight: "800" },
});