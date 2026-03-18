// src/services/backendApi.ts

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://192.168.12.119:8080"; // change if needed

async function request<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ===== Types based on your backend Product entity JSON =====
export type BackendProduct = {
  productId?: number | null;
  barcode: string;
  productName: string | null;
  category: string | null;
  sugars100g: number | null;
  country: string | null;
  lastChecked: string | null;
};

// Alternatives: GET /api/alts/{barcode}
export function getAlternatives(barcode: string) {
  const bc = barcode.trim();
  return request<BackendProduct[]>(`/api/alts/${encodeURIComponent(bc)}`);
}

// Product detail: depends on your backend endpoint.
// If your backend has it, set it here:
// Example: GET /api/products/{barcode}
export type BackendProductDetail = {
  barcode: string;
  productName?: string | null;
  brands?: string | null;
  imageUrl?: string | null;
  nutriments?: {
    sugars100g?: number | null;
    energyKcal100g?: number | null;
    carbohydrates100g?: number | null;
    salt100g?: number | null;
  };
};

export function getProductDetail(barcode: string) {
  const bc = barcode.trim();
  return request<any>(`/api/products/${encodeURIComponent(bc)}`); // adjust endpoint if different
}