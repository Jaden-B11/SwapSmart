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
  View,
  Image,
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
    router.push((`/results/${encodeURIComponent(code)}`) as any);
    setBarcode("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/SwapSmart-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Hero Text */}
        <View style={styles.heroSection}>
          <Text style={styles.brand}>SwapSmart</Text>
          <Text style={styles.tagline}>
            A healthier alternative is a scan away.
          </Text>
        </View>

        {/* Scan Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a Swap</Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)/scan")}
          >
            <Text style={styles.primaryBtnText}>Scan Barcode</Text>
            <Text style={styles.primaryBtnSub}>Use your camera</Text>
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.label}>Or enter a barcode manually</Text>

          <View style={styles.row}>
            <TextInput
              value={barcode}
              onChangeText={setBarcode}
              placeholder="e.g., 012345678905"
              placeholderTextColor="#8aa2b5"
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onLookup}
            />
            <Pressable style={styles.secondaryBtn} onPress={onLookup}>
              <Text style={styles.secondaryBtnText}>Lookup</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
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

        {/* Recent Section */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Recent Scans (Coming Soon!)</Text>
          <Text style={styles.footerSub}>
            No scans yet. Try scanning your first item!
          </Text>
        </View>

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

  logoContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0b1220",
  },
  tagline: {
    fontSize: 14,
    color: "#5f6c7b",
    textAlign: "center",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0b1220",
  },

  primaryBtn: {
    backgroundColor: "#12AEBA",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  primaryBtnSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#e3edf5",
  },

  label: {
    fontSize: 13,
    color: "#5f6c7b",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fcff",
    borderWidth: 1,
    borderColor: "#dbe7f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: "#eaf4fb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  secondaryBtnText: {
    color: "#12AEBA",
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    gap: 14,
  },
  tile: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tileTitle: {
    fontWeight: "700",
    color: "#0b1220",
  },
  tileSub: {
    fontSize: 12,
    color: "#5f6c7b",
    marginTop: 4,
  },

  footerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  footerTitle: {
    fontWeight: "700",
    color: "#0b1220",
  },
  footerSub: {
    fontSize: 13,
    color: "#5f6c7b",
    marginTop: 4,
  },
});