// app/results/[barcode].tsx

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

type AltProduct = {
  productId?: number | null;
  barcode: string;
  productName: string | null;
  category: string | null;
  sugars100g: number | null;
  country: string | null;
  lastChecked: string | null;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://192.168.12.119:8080";

// ---------- Backend ----------
async function getAlternatives(barcode: string): Promise<AltProduct[]> {
  const res = await fetch(`${API_BASE_URL}/api/alts/${encodeURIComponent(barcode)}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Backend error ${res.status}: ${txt}`);
  }
  return res.json();
}

// ---------- OpenFoodFacts (for scanned product name + sugar baseline) ----------
async function getScannedInfo(barcode: string): Promise<{
  name: string | null;
  sugars100g: number | null;
}> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
        barcode
      )}.json?fields=product_name,nutriments`
    );

    if (!res.ok) return { name: null, sugars100g: null };

    const json = await res.json();
    const name = json?.product?.product_name ?? null;
    const sugars = json?.product?.nutriments?.sugars_100g;

    return {
      name,
      sugars100g: Number.isFinite(Number(sugars)) ? Number(sugars) : null,
    };
  } catch {
    return { name: null, sugars100g: null };
  }
}

function fmtNumber(v: any, decimals = 2) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(decimals);
}

function percentLess(base: number | null, alt: number | null) {
  if (base == null || alt == null) return null;
  if (base <= 0) return null;
  const pct = ((base - alt) / base) * 100;
  // only show if it's actually less
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return Math.round(pct);
}

function sugarBadge(sugars100g: number | null | undefined) {
  if (sugars100g == null || !Number.isFinite(Number(sugars100g))) {
    return { label: "—", bg: "rgba(255,255,255,0.12)", text: "white" };
  }

  const s = Number(sugars100g);

  // tweak thresholds if you want
  if (s <= 1) return { label: "Zero Sugar!", bg: "#1f8a3b", text: "white" }; // green
  if (s <= 5) return { label: "Very Low", bg: "#78be36", text: "white" }; // yellow
  if (s <= 10) return { label: "Low", bg: "#afc200", text: "white" }; // orange
  return { label: "High", bg: "#b3661e", text: "white" }; // red
}

export default function ResultsScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const bc = useMemo(() => String(barcode ?? "").trim(), [barcode]);

  const [loading, setLoading] = useState(true);
  const [alts, setAlts] = useState<AltProduct[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [scannedName, setScannedName] = useState<string | null>(null);
  const [scannedSugar, setScannedSugar] = useState<number | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr(null);

      const [results, info] = await Promise.all([
        getAlternatives(bc),
        getScannedInfo(bc),
      ]);

      setAlts(results);
      setScannedName(info.name);
      setScannedSugar(info.sugars100g);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load alternatives from backend");
      setAlts([]);
      setScannedName(null);
      setScannedSugar(null);
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
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bc]);

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
            <Text style={styles.body}>Loading healthier alternatives😊…</Text>
          </View>
        ) : err ? (
          <>
            <Text style={styles.body}>Error: {err}</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.btnSecondary} onPress={fetchAll}>
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
        ) : (
          <>
            <Text style={styles.body}>
              Displaying the top alternatives for{" "}
              <Text style={styles.bold}>{scannedName ?? "this product"}</Text>
            </Text>

            {scannedSugar != null ? (
              <Text style={styles.muted}>
              Item has <Text style={styles.bold}>{fmtNumber(scannedSugar)} grams of sugar </Text>{" "}
                per 100 grams
              </Text>
            ) : (
              <Text style={styles.muted}>
                Baseline sugars: <Text style={styles.bold}>—</Text> (not available)
              </Text>
            )}

            <View style={styles.divider} />

            {alts.length === 0 ? (
              <Text style={styles.muted}>
                No alternatives found for this item yet. Try a different barcode.
              </Text>
            ) : (
              <ScrollView
                style={{ maxHeight: 320 }}
                contentContainerStyle={{ gap: 10 }}
              >
                {alts.slice(0, 3).map((p) => {
                  const badge = sugarBadge(p.sugars100g);
                  const pct = percentLess(scannedSugar, p.sugars100g);

                  return (
                    <Pressable
                      key={p.barcode}
                      style={styles.altCard}
                      onPress={() =>
                        router.push(
                          (`/product/${encodeURIComponent(p.barcode)}` as any)
                        )
                      }
                    >
                      <Text style={styles.altTitle}>
                        {p.productName ?? "Unnamed product"}
                      </Text>

                      <Text style={styles.altSub}>
                        Sugars (100g):{" "}
                        <Text style={styles.bold}>
                          {p.sugars100g != null ? `${fmtNumber(p.sugars100g)} g` : "—"}
                        </Text>
                      </Text>

                      <View style={[styles.sugarPill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.sugarPillText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>

                      {pct != null ? (
                        <Text style={styles.altSub}>
                          ~{pct}% less sugar per 100g vs scanned item
                        </Text>
                      ) : null}

                      {p.category ? (
                        <Text style={styles.altSub}>Category: {p.category}</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Pressable
              style={[styles.btnSecondary, styles.btnFull]}
              onPress={() =>
                router.push((`/product/${encodeURIComponent(bc)}` as any))
              }
            >
              <Text style={styles.btnSecondaryText}>View Scanned Product Detail</Text>
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

  body: { color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  muted: { color: "rgba(255,255,255,0.6)", lineHeight: 18 },
  bold: { fontWeight: "800", color: "white" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },

  centerRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 6 },

  btn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#0b1220", fontWeight: "800" },

  btnSecondary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnSecondaryText: { color: "white", fontWeight: "800" },

  btnFull: { width: "100%", flex: 0 },

  altCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  altTitle: { color: "white", fontWeight: "800", fontSize: 14 },
  altSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 16 },

  sugarPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 2,
  },
  sugarPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
});