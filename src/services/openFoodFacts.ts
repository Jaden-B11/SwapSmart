// src/services/openFoodFacts.ts

export type OFFProduct = {
  code?: string;
  product?: {
    product_name?: string;
    brands?: string;
    quantity?: string;
    image_url?: string;

    nutriments?: {
      sugars_100g?: number;
      sugars_serving?: number;
      "energy-kcal_100g"?: number;
      "energy-kcal_serving"?: number;
      salt_100g?: number;
      carbohydrates_100g?: number;
    };
  };
  status?: number; // 1 = found, 0 = not found
  status_verbose?: string;
};

export async function getProductByBarcode(barcode: string): Promise<OFFProduct> {
  const cleaned = barcode.trim();
  if (!cleaned) throw new Error("Missing barcode");

  // OFF v2 endpoint
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    cleaned
  )}.json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenFoodFacts request failed (${res.status})`);
  }

  const data = (await res.json()) as OFFProduct;
  return data;
}
