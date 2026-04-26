// app/results/[barcode].tsx

import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

// ---------- Backend ----------
async function getAlternatives(barcode: string): Promise<AltProduct[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `${API_BASE_URL}/api/alts/${encodeURIComponent(barcode)}`,
    { headers }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Backend error ${res.status}: ${txt}`);
  }

  return res.json();
}

// ---------- OpenFoodFacts ----------
async function getScannedInfo(barcode: string) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
        barcode
      )}.json?fields=product_name,nutriments`
    );

    if (!res.ok) return { name: null, sugars100g: null };

    const json = await res.json();
    return {
      name: json?.product?.product_name ?? null,
      sugars100g: json?.product?.nutriments?.sugars_100g ?? null,
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
  if (base == null || alt == null || base <= 0) return null;
  const pct = ((base - alt) / base) * 100;
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return Math.round(pct);
}

export default function ResultsScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();

  const bc = useMemo(() => {
    const raw = String(barcode ?? "").trim();
    return raw.length === 12 ? "0" + raw : raw;
  }, [barcode]);

  const [loading, setLoading] = useState(true);
  const [alts, setAlts] = useState<AltProduct[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [scannedName, setScannedName] = useState<string | null>(null);
  const [scannedSugar, setScannedSugar] = useState<number | null>(null);
  const [savedBarcode, setSavedBarcode] = useState<string | null>(null);
  
  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr(null);

      const info = await getScannedInfo(bc);

      let results: AltProduct[] = [];
      let attempts = 0;
      const maxAttempts = 6;

      while (attempts < maxAttempts && results.length === 0) {
        results = await getAlternatives(bc);
        if (results.length === 0) {
          await new Promise((r) => setTimeout(r, 700));
        }
        attempts++;
      }

      setAlts(results);
      setScannedName(info.name);
      setScannedSugar(info.sugars100g);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load alternatives");
      setAlts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSwap = async (barcode: string) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    alert("Please log in to save swaps!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/swaps/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        originalBarcode: bc,
        alternativeBarcode: barcode
      })
    });

    if (response.ok) {
      setSavedBarcode(barcode); // 👈 THIS replaces alert
    } else {
      const error = await response.text();
      alert(`Could not save: ${error}`);
    }
  } catch (e) {
    alert("Network error saving swap.");
  }
};

  useEffect(() => {
    if (!bc) return;
    fetchAll();
  }, [bc]);

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Button */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)/scan")}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Healthier Alternatives</Text>

        {scannedName && (
  <>
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Scanned Item</Text>
      <Text style={styles.heroTitle}>{scannedName}</Text>
      {scannedSugar != null && (
        <Text style={styles.heroSub}>
          {fmtNumber(scannedSugar)}g sugar per 100g
        </Text>
      )}
    </View>

    {/* Top Gradient Accent */}
    <LinearGradient
      colors={["#12AEBA", "#01A0D9", "#EEECE1"]}
      locations={[0.2, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBar}
    />
  </>
)}
        

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}></Text>
            <Text style={styles.loadingMessage}>
              Please wait a few seconds…
            </Text>
            <ActivityIndicator size="large" color="#12AEBA" />
          </View>
        ) : err ? (
          <Text style={styles.error}>{err}</Text>
        ) : alts.length === 0 ? (
          <Text style={styles.empty}>
            No alternatives found. Try scanning again.
          </Text>
        ) : (
          alts.slice(0, 3).map((p) => {
            const pct = percentLess(scannedSugar, p.sugars100g);

            return (
              <Pressable
                key={p.barcode}
                style={styles.card}
                onPress={() =>
                  router.push(
                    (`/product/${encodeURIComponent(p.barcode)}` as any)
                  )
                }
              >
                <Text style={styles.cardTitle}>
                  {p.productName ?? "Unnamed product"}
                </Text>

                <Text style={styles.cardSub}>
                  {p.sugars100g != null
                  ? `${fmtNumber(p.sugars100g)}g sugar per 100g`
                  : "Sugar data unavailable"}
                </Text>

                {p.sugars100g === 0 && (
                <View style={[styles.sugarBadge, styles.noSugarBadge]}>
                  <Text style={styles.sugarBadgeText}>No Sugar!</Text>
                </View>
                )}

                {p.sugars100g != null && p.sugars100g > 0 && p.sugars100g < 5 && (
                <View style={[styles.sugarBadge, styles.lowSugarBadge]}>
                  <Text style={styles.sugarBadgeText}>Low Sugar</Text>
                </View>
                )}

                {pct != null && (
                  <Text style={styles.pct}>
                    {pct}% less sugar than scanned item
                  </Text>
                )}

                <Pressable
                  style={styles.saveBtn}
                  onPress={() => saveSwap(p.barcode)}
                >
                <Text style={styles.saveText}>Save Swap</Text>
                </Pressable>

                {savedBarcode === p.barcode && (
                  <Text style={{ marginTop: 6, color: "#1f8a3b", fontWeight: "600" }}>
                    Successfully saved this swap ✓
                  </Text>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f8fb",
  },

  backButton: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 10,
    backgroundColor: "#ffffff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  backArrow: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0b1220",
  },

  container: {
    padding: 20,
    gap: 20,
    paddingTop: 90,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0b1220",
    textAlign: "center",
  },

  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  heroLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#12AEBA",
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5c89ad",
    marginTop: 4,
  },

  heroSub: {
    fontSize: 14,
    color: "#5f6c7b",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0b1220",
  },

  cardSub: {
    fontSize: 13,
    color: "#5f6c7b",
  },

  pct: {
    marginTop: 4,
    fontWeight: "600",
    color: "#12AEBA",
  },

  saveBtn: {
    marginTop: 10,
    backgroundColor: "#12AEBA",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  empty: {
    color: "#5f6c7b",
  },

  error: {
    color: "#c0392b",
  },

  sugarBadge: {
  alignSelf: "flex-start",
  marginTop: 6,
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 999,
},

sugarBadgeText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#ffffff",
},

noSugarBadge: {
  backgroundColor: "#1f8a3b", // green
},

lowSugarBadge: {
  backgroundColor: "#a1e308", // yellow
},
loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 1,
},

loadingTitle: {
  fontSize: 26,
  fontWeight: "800",
  color: "#0b1220",
},

loadingMessage: {
  fontSize: 14,
  color: "#5f6c7b",
  marginBottom: 20,
},
gradientBar: {
  height: 6,
  borderRadius: 999,
  marginTop: 8,
  marginHorizontal: 4,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
},
});