// app/product/[barcode].tsx

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getProductByBarcode, type OFFProduct } from "../../src/services/openFoodFacts";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

type Review = {
  id: string;
  userId: string;
  barcode: string;
  rating: number;
  comment: string;
  timeCreated: string;
};

function Stars({ value, onChange, size = 22, disabled = false }: any) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={disabled || !onChange ? undefined : () => onChange(star)}
          disabled={disabled || !onChange}
        >
          <Text style={{ fontSize: size, color: "#f4b400" }}>
            {star <= value ? "★" : "☆"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const bc = useMemo(() => String(barcode ?? "").trim(), [barcode]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OFFProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isLoggedIn = !!session;
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const avgRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/reviews/${encodeURIComponent(bc)}`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!isLoggedIn || myRating < 1) return;

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${encodeURIComponent(bc)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession?.access_token}`,
          },
          body: JSON.stringify({
            rating: myRating,
            comment: myComment.trim(),
          }),
        }
      );

      if (response.ok) {
        setMyRating(0);
        setMyComment("");
        fetchReviews();
      }
    } catch {}
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setErr(null);
      const result = await getProductByBarcode(bc);
      setData(result);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bc) return;
    fetchProduct();
    fetchReviews();
  }, [bc]);

  const found = data?.status === 1;
  const p = data?.product;
  const n = p?.nutriments;

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      {/* ✅ KEYBOARD FIX HERE */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator size="large" color="#12AEBA" />
          ) : !found ? (
            <Text style={styles.error}>Product not found.</Text>
          ) : (
            <>
              {/* Product Card */}
              <View style={styles.productCard}>
                <Text style={styles.productTitle}>
                  {p?.product_name || "Unnamed product"}
                </Text>
                <Text style={styles.productBrand}>
                  {p?.brands || "Unknown brand"}
                </Text>

                {!!p?.image_url && (
                  <Image
                    source={{ uri: p.image_url }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Nutrition */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                <Row
                  label="Calories (100g)"
                  value={`${fmtNumber(
                    (n as any)?.["energy-kcal_100g"],
                    0
                  )} cals`}
                />
                <Row
                  label="Sugars (100g)"
                  value={`${fmtNumber(n?.sugars_100g)} g`}
                />
                <Row
                  label="Carbs (100g)"
                  value={`${fmtNumber(n?.carbohydrates_100g)} g`}
                />
                <Row
                  label="Salt (100g)"
                  value={`${fmtNumber(n?.salt_100g)} g`}
                />
              </View>

              {/* Reviews */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Reviews</Text>

                <View style={styles.reviewSummary}>
                  <Text style={styles.reviewScore}>
                    {reviews.length ? fmtNumber(avgRating, 1) : "—"} / 5
                  </Text>
                  <Text style={styles.muted}>
                    {reviews.length} review
                    {reviews.length === 1 ? "" : "s"}
                  </Text>
                </View>

                <Stars value={Math.round(avgRating)} disabled />
                <View style={styles.divider} />

                {isLoggedIn && (
                  <>
                    <Stars
                      value={myRating}
                      onChange={setMyRating}
                      size={24}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Write your review..."
                      value={myComment}
                      onChangeText={setMyComment}
                      multiline
                    />
                    <Pressable
                      style={styles.primaryBtn}
                      onPress={submitReview}
                    >
                      <Text style={styles.primaryBtnText}>
                        Submit Review
                      </Text>
                    </Pressable>
                  </>
                )}

                {reviewsLoading ? (
                  <ActivityIndicator />
                ) : (
                  reviews.map((r) => (
                    <View key={r.id} style={styles.reviewCard}>
                      <Stars value={r.rating} disabled />
                      <Text style={styles.body}>{r.comment}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Row({ label, value }: any) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f8fb" },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "#12AEBA",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  backArrow: { fontSize: 20, fontWeight: "600", color: "#0b1220" },
  headerTitle: { color: "#ffffff", fontSize: 22, fontWeight: "800" },
  container: { padding: 20, gap: 20 },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  productTitle: { fontSize: 18, fontWeight: "700", color: "#0b1220" },
  productBrand: { fontSize: 14, color: "#5f6c7b", marginTop: 4 },
  image: { width: "100%", height: 200, marginTop: 12 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0b1220" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "#5f6c7b" },
  rowValue: { color: "#0b1220", fontWeight: "700" },
  reviewSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewScore: { fontSize: 18, fontWeight: "800", color: "#0b1220" },
  reviewCard: {
    backgroundColor: "#f4f8fb",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#12AEBA",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "700" },
  input: {
    backgroundColor: "#f4f8fb",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  muted: { color: "#5f6c7b" },
  body: { color: "#0b1220" },
  divider: { height: 1, backgroundColor: "#e2e8f0" },
  error: { color: "#c0392b" },
});