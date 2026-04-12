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
} from "react-native";
import { getProductByBarcode, type OFFProduct } from "../../src/services/openFoodFacts";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://10.0.2.2:8080";

type Review = {
  id: string;
  userId: string;
  barcode: string;
  rating: number;
  comment: string;
  timeCreated: string;
};

function Stars({
  value,
  onChange,
  size = 22,
  disabled = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={disabled || !onChange ? undefined : () => onChange(star)}
          disabled={disabled || !onChange}
          hitSlop={10}
        >
          <Text style={{ fontSize: size, color: "white" }}>
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

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(bc)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.log("Error fetching reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!isLoggedIn || myRating < 1) return;
    setSubmitError(null);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const response = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(bc)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify({
          rating: myRating,
          comment: myComment.trim()
        })
      });

      if (response.ok) {
        setMyRating(0);
        setMyComment("");
        fetchReviews(); // refresh reviews list
      } else {
        const error = await response.text();
        setSubmitError(error);
      }
    } catch (e) {
      setSubmitError("Network error submitting review.");
    }
  };

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
    fetchReviews();
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
            {/* Product header */}
            <View style={styles.card}>
              <Text style={styles.title}>{p?.product_name || "Unnamed product"}</Text>
              <Text style={styles.muted}>
                {p?.brands ? `Brand: ${p.brands}` : "Brand: (unknown)"}
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
              <Text style={styles.sectionTitle}>Nutrition (quick view)</Text>
              <Row
                label="Calories (100g)"
                value={`${fmtNumber((n as any)?.["energy-kcal_100g"], 0)} cals`}
              />
              <Row
                label="Calories (per serving)"
                value={`${fmtNumber((n as any)?.["energy-kcal_serving"], 0)} cals`}
              />
              <Row label="Sugars (100g)" value={`${fmtNumber(n?.sugars_100g)} g`} />
              <Row label="Carbs (100g)" value={`${fmtNumber(n?.carbohydrates_100g)} g`} />
              <Row label="Salt (100g)" value={`${fmtNumber(n?.salt_100g)} g`} />
            </View>

            {/* Reviews summary + composer */}
            <View style={styles.card}>
              <View style={styles.reviewHeaderRow}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.reviewScore}>
                    {reviews.length ? fmtNumber(avgRating, 1) : "—"}
                    <Text style={styles.muted}> / 5</Text>
                  </Text>
                  <Text style={styles.muted}>
                    {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>

              <Stars value={Math.round(avgRating)} disabled />
              <View style={styles.divider} />

              <Text style={styles.muted}>
                {isLoggedIn ? "Leave a rating and review:" : "Log in to leave a review."}
              </Text>

              <View style={{ opacity: isLoggedIn ? 1 : 0.5 }}>
                <Stars value={myRating} onChange={setMyRating} size={24} disabled={!isLoggedIn} />

                <TextInput
                  style={styles.input}
                  placeholder="Write your review (optional)"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={myComment}
                  onChangeText={setMyComment}
                  editable={isLoggedIn}
                  multiline
                />

                {submitError && (
                  <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{submitError}</Text>
                )}

                <Pressable
                  style={[
                    styles.btnSecondary,
                    !isLoggedIn || myRating < 1 ? styles.btnDisabled : null,
                  ]}
                  onPress={submitReview}
                  disabled={!isLoggedIn || myRating < 1}
                >
                  <Text style={styles.btnSecondaryText}>Submit Review</Text>
                </Pressable>
              </View>
            </View>

            {/* Reviews list */}
            {reviewsLoading ? (
              <ActivityIndicator />
            ) : reviews.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.muted}>No reviews yet. Be the first!</Text>
              </View>
            ) : (
              reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTopRow}>
                    <Text style={styles.reviewName}>{r.displayName}</Text>
                    <Text style={styles.muted}>
                      {r.timeCreated ? new Date(r.timeCreated).toLocaleDateString() : ""}
                    </Text>
                  </View>
                  <Stars value={r.rating} disabled />
                  <Text style={styles.body}>{r.comment}</Text>
                </View>
              ))
            )}

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
  image: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: "rgba(255,255,255,0.75)" },
  rowValue: { color: "white", fontWeight: "800" },
  centerRow: { flexDirection: "row", gap: 10, alignItems: "center", padding: 18 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },
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
  btnDisabled: { opacity: 0.6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    minHeight: 70,
    textAlignVertical: "top",
    marginTop: 8,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewScore: { color: "white", fontSize: 18, fontWeight: "800" },
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewName: { color: "white", fontWeight: "800" },
});