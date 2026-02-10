// app/(tabs)/scan.tsx

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, type Href } from "expo-router";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // auto-request once when entering screen
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const code = (data || "").trim();
    if (!code) {
      setScanned(false);
      return;
    }

    router.push((`/results/${encodeURIComponent(code)}`) as any);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission is required to scan.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
          // common retail codes
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Scan a barcode</Text>
        <Text style={styles.subtitle}>
          Hold steady — we’ll auto-detect the code.
        </Text>

        <View style={styles.frame} />

        {scanned && (
          <Pressable style={styles.btn} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Tap to Scan Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  overlay: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  title: { color: "white", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 18 },
  frame: {
    alignSelf: "center",
    width: "92%",
    height: 220,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    marginBottom: 18,
  },
  btn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#0b1220", fontWeight: "800" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    backgroundColor: "#0b1220",
    gap: 12,
  },
  text: { color: "rgba(255,255,255,0.85)", textAlign: "center" },
});
