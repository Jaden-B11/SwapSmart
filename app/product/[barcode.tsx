import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetail() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Product detail for: {barcode}</Text>
    </View>
  );
}
