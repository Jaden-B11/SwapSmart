import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");

    if (password.length === 0 || email.length === 0) {
      setErrorMsg("Please enter a valid email and password.");
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      setErrorMsg(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Logo */}
        <Image
          source={require("@/assets/images/SwapSmart-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>

          {/* Email */}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#8aa2b5"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          {/* Password */}
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8aa2b5"
            secureTextEntry={true}
            autoCapitalize="none"
            autoComplete="password"
          />

          {/* Error */}
          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

          {/* Login Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
            <Text style={styles.primaryText}>Login</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(tabs)/options")}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/sign-up")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f8fb",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0b1220",
    textAlign: "center",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe7f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9fcff",
  },
  primaryBtn: {
    backgroundColor: "#12AEBA",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: "#eaf4fb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: "#12AEBA",
    fontWeight: "600",
  },
  errorMsg: {
    color: "#c0392b",
    fontSize: 13,
    textAlign: "center",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signUpText: {
    color: "#555",
    fontSize: 14,
  },
  signUpLink: {
    color: "#12AEBA",
    fontWeight: "600",
  },
});