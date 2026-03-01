import { Image } from "expo-image";
import React from "react";

import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.brand}>Profile</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            {/* Profile picture */}
            <Image
              style={{width:50, height:50}}
              source='https://pbs.twimg.com/media/HBheoigWYAAskmG.png'
            />
            <View>
              <Text style={styles.label}>User Name</Text>
              <Text style={styles.cardTitle}>FirstName LastName </Text>
            </View>
            <Pressable onPress={() => Alert.alert("Editing")}>
              <Text style={styles.cardTitle}>Edit </Text> 
            </Pressable>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Info</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign Out </Text>
        </View>
        <Pressable onPress={() => Alert.alert("Are you sure?")}>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, {color:'red'}]}>Delete Account </Text>
          </View>
        </Pressable>

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
  row: { flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-between" },
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
