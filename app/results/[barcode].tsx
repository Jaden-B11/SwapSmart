// app/results/[barcode].tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  getProductByBarcode,
  type OFFProduct,
} from "../../src/services/openFoodFacts";

export default function ResultsScreen() {
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

  const product = data?.product;
  const found = data?.status === 1;

  function fmtNumber(v: any, decimals = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return n.toFixed(decimals);
  }

  return (
    <View style={styles.safe}>
      <Stack.Screen
        options={{
          title: "Results",
          headerBackTitle: "Back",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/(tabs)/scan")}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>Back</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Results</Text>
        <Text style={styles.sub}>Barcode: {bc || "—"}</Text>
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

            <View style={styles.actionsRow}>
              <Pressable style={styles.btnSecondary} onPress={fetchProduct}>
                <Text style={styles.btnSecondaryText}>Retry</Text>
              </Pressable>

              <Pressable
                style={styles.btn}
                onPress={() => router.replace("/(tabs)/scan")}
              >
                <Text style={styles.btnText}>Scan</Text>
              </Pressable>
            </View>
          </>
        ) : !found ? (
          <>
            <Text style={styles.body}>
              Product not found in Open Food Facts.
            </Text>
            <Text style={styles.muted}>
              Next step: add fallback search/manual entry.
            </Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.btnSecondary} onPress={fetchProduct}>
                <Text style={styles.btnSecondaryText}>Try Again</Text>
              </Pressable>

              <Pressable
                style={styles.btn}
                onPress={() => router.replace("/(tabs)/scan")}
              >
                <Text style={styles.btnText}>Scan Another</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.productName}>
              {product?.product_name || "Unnamed product"}
            </Text>

            <Text style={styles.muted}>
              {product?.brands
                ? `Brand: ${product.brands}`
                : "Brand: (unknown)"}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.body}>
              Sugars (per 100g):{" "}
              <Text style={styles.bold}>
                {product?.nutriments?.sugars_100g != null
                  ? `${fmtNumber(product.nutriments.sugars_100g)} g`
                  : "—"}
              </Text>
            </Text>

            <Text style={styles.muted}>
              MVP: this is where we’ll show 2–3 “swap” alternatives.
            </Text>

            <Pressable
              style={[styles.btnSecondary, styles.btnFull]}
              onPress={() =>
                router.push((`/product/${encodeURIComponent(bc)}` as any))
              }
            >
              <Text style={styles.btnSecondaryText}>View Product Detail</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnFull]}
              onPress={() => router.replace("/(tabs)/scan")}
            >
              <Text style={styles.btnText}>Scan Another</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 18,
    gap: 12,
  },
  header: {
    gap: 4,
    marginTop: 6,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
  },
  sub: {
    color: "rgba(255,255,255,0.7)",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  productName: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  body: {
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
  muted: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
  },
  bold: {
    fontWeight: "800",
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  centerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  btn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#0b1220",
    fontWeight: "800",
  },

  btnSecondary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnSecondaryText: {
    color: "white",
    fontWeight: "800",
  },

  btnFull: {
    width: "100%",
    flex: 0,
  },
});
