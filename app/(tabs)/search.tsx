import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

type SearchItem = {
  code: string;
  product_name?: string;
  brands?: string;
};

async function searchOpenFoodFacts(query: string): Promise<SearchItem[]> {
  const term = query.trim();
  if (!term) return [];

  const url =
    "https://world.openfoodfacts.org/cgi/search.pl" +
    `?search_terms=${encodeURIComponent(term)}` +
    "&search_simple=1&action=process&json=1&page_size=25";

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const json = await res.json();

  return (json.products ?? [])
    .filter((p: any) => p.code && (p.product_name || p.product_name_en))
    .map((p: any) => ({
      code: String(p.code),
      product_name: p.product_name || p.product_name_en,
      brands: p.brands,
    }));
}

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<SearchItem[]>([]);

  const onSearch = async () => {
    const term = query.trim();
    if (!term) return;

    try {
      setLoading(true);
      setErr(null);
      const items = await searchOpenFoodFacts(term);
      setResults(items);
    } catch (e: any) {
      setErr(e?.message ?? "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Search</Text>
          <Text style={styles.tagline}>
            Look up a product, then tap it to open results.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Find a product</Text>

          <Text style={styles.label}>Search by name</Text>
          <View style={styles.row}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="e.g., yogurt, granola bar"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />
            <Pressable style={styles.secondaryBtn} onPress={onSearch}>
              <Text style={styles.secondaryBtnText}>
                {loading ? "..." : "Search"}
              </Text>
            </Pressable>
          </View>

          {err ? <Text style={styles.helper}>Error: {err}</Text> : null}

          {!err ? (
            <Text style={styles.helper}>
              Tip: tap any result to open the Results page (same as scan).
            </Text>
          ) : null}
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, gap: 10 }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>No results yet</Text>
                <Text style={styles.footerSub}>
                  Search for a product name above to see matches.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.tileFull}
              onPress={() =>
                router.push((`/search-results/${encodeURIComponent(item.code)}`) as any)
              }
            >
              <Text style={styles.tileTitle}>
                {item.product_name || "Unnamed product"}
              </Text>
              <Text style={styles.tileSub}>
                {item.brands ? `Brand: ${item.brands}` : "Brand: (unknown)"}
              </Text>
              <Text style={styles.tileMeta}>Barcode: {item.code}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { flex: 1, padding: 18 },

  header: { gap: 6, marginTop: 6 },
  brand: { fontSize: 34, fontWeight: "800", color: "white" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 20 },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginTop: 14,
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "700" },

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

  tileFull: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  tileTitle: { color: "white", fontWeight: "800" },
  tileSub: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  tileMeta: { color: "rgba(255,255,255,0.55)", fontSize: 12 },

  footerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 12,
  },
  footerTitle: { color: "white", fontWeight: "800" },
  footerSub: { color: "rgba(255,255,255,0.75)", lineHeight: 20 },
});