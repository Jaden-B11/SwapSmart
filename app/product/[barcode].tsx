import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  getProductByBarcode,
  type OFFProduct,
} from "../../src/services/openFoodFacts";

export default function ProductDetail() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const bc = useMemo(() => String(barcode ?? "").trim(), [barcode]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OFFProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rating, setRating] = useState(0);  // change to grab rating from backend

  
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

  return (
    <ScrollView>
      {/* Product Info */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Product detail for: {barcode}</Text>
        <Text>Product name: {product?.product_name}</Text>
        <Image
          style={{width:150, height:150}}
          source={{uri: product?.image_url}}
          />
          {product?.nutriments && Object.entries(product.nutriments)
          .filter(([key]) => ['sugars_100g', 'salt_100g', 'energy-kcal_100g', 'carbohydrates_100g'].includes(key))
          .map(([key, value]) => (
            <Text key={key}>{key}: {Number(value).toFixed(0)}</Text>
          ))}
      </View>

      {/* Rating */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ flexDirection: "row", gap: 4, marginTop: 16 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <Text style={{ fontSize: 24 }}>
              {star <= rating ? "★" : "☆"}
            </Text>
          </Pressable>
        ))}
        </View>
        <Text>{rating > 0 ? `Rating: ${rating}/5` : "Rate this product"}</Text>
      </View>

      {/* Reviews */}
      <Text style={{fontSize: 30}}>Reviews</Text>
      <ScrollView style={{ flexDirection: "column", gap: 4, marginTop: 4 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((reviewNum) => (
          <View key={reviewNum} style={{marginTop: 16 , backgroundColor: 'gray'}}>
            <Text style={{fontSize: 20}}> Review {reviewNum}: </Text>
            <Text>{reviewNum % 2 ? "Great Stuff" : "Trash"}</Text>
          </View>
        ))}
      </ScrollView>
      
    </ScrollView>
  );
}
