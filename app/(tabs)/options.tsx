// app/(tabs)/options.tsx

import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
} from "react-native";

export default function Options() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Gradient Accent */}
      <LinearGradient
        colors={["#12AEBA", "#01A0D9", "#EEECE1"]}
        locations={[0.2, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBar}
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
            source={require("../../assets/images/SwapSmart-logo.png")}
            style={styles.logo}
            resizeMode="contain"
        />
        <Text style={styles.brand}>Login to access all the features! </Text>
      </View>

      {/* Buttons */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/auth/sign-up")}
        >
          <Text style={styles.secondaryButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.ghostButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7f9",
  },

  gradientBar: {
    height: 8,
    marginHorizontal: 6,
    borderRadius: 4,
    marginTop: 6,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginLeft: 20, 
    marginBottom: 15,
  },

  logo: {
    width: 200,
    height: 200,
  },

  brand: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1220",
    marginTop: 8,
  },

  optionsContainer: {
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 30,
  },

  primaryButton: {
    backgroundColor: "#01A0D9",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#12AEBA",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },

  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  ghostButton: {
    marginTop: 10,
  },

  ghostButtonText: {
    color: "#01A0D9",
    fontSize: 14,
    fontWeight: "600",
  },
});