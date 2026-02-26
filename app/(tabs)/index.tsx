import React, { useMemo, useState } from "react";

import { useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type QuickTile = {
  title: string;
  subtitle: string;
  href: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");

  const tiles: QuickTile[] = useMemo(
    () => [
      { title: "Saved Swaps", subtitle: "Favorites & history", href: "/(tabs)/saved" },
      { title: "Settings", subtitle: "Preferences & account", href: "/(tabs)/settings" },
    ],
    []
  );

  const onLookup = () => {
    const code = barcode.trim();
    if (!code) return;
    // Later this can call your API, for now just route to results page
    router.push((`/results/${encodeURIComponent(code)}`) as any);
    setBarcode("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>SwapSmart</Text>
          <Text style={styles.tagline}>
            Scan a product and get 2–3 zero-sugar swaps in seconds.
          </Text>
          
          {/* Optional scan quota pill (mocked) */}
    
        </View>
        
        {/* Primary action card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a swap</Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)/scan")}
          >
            <Text style={styles.primaryBtnText}>Scan Barcode</Text>
            <Text style={styles.primaryBtnSub}>Use your camera</Text>
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.label}>Or enter a barcode</Text>
          <View style={styles.row}>
            <TextInput
              value={barcode}
              onChangeText={setBarcode}
              placeholder="e.g., 012345678905"
              placeholderTextColor="rgba(255,255,255,0.45)"
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onLookup}
            />
            <Pressable style={styles.secondaryBtn} onPress={onLookup}>
              <Text style={styles.secondaryBtnText}>Lookup</Text>
            </Pressable>
          </View>

          <Text style={styles.helper}>
            If a barcode isn’t found, we’ll add a search fallback.
          </Text>
        </View>

        {/* Quick tiles */}
        <View style={styles.grid}>
          {tiles.map((t) => (
            <Pressable
              key={t.title}
              style={styles.tile}
              onPress={() => router.push(t.href as any)}
            >
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={styles.tileSub}>{t.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* Empty state section */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Recent scans</Text>
          <Text style={styles.footerSub}>
            No scans yet. Try scanning your first item!
          </Text>
        </View>

        <View style={styles.footerCard}>
        <TouchableOpacity
        onPress={() => router.push("/auth/login")}>
         <Text>Login</Text> 
         </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 18, gap: 14 },

  header: { gap: 6, marginTop: 6 },
  brand: { fontSize: 34, fontWeight: "800", color: "white" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 20 },
  pillRow: { flexDirection: "row", marginTop: 8 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "700" },

  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#0b1220" },
  primaryBtnSub: { marginTop: 4, fontSize: 12, color: "rgba(11,18,32,0.65)" },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },

  label: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: { color: "white", fontWeight: "700" },
  helper: { fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 18 },

  grid: { flexDirection: "row", gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  tileTitle: { color: "white", fontWeight: "800" },
  tileSub: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  footerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  footerTitle: { color: "white", fontWeight: "800" },
  footerSub: { color: "rgba(255,255,255,0.75)", lineHeight: 20 },
});
