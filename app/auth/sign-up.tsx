import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Checkbox } from "expo-checkbox";
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
  Image,
} from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [errorMsg, setErrorMsg] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [glutenChecked, setGlutenChecked] = useState(false);
  const [eggsChecked, setEggsChecked] = useState(false);
  const [nutsChecked, setNutsChecked] = useState(false);
  const [soybeansChecked, setSoybeansChecked] = useState(false);
  const [milkChecked, setMilkChecked] = useState(false);
  const [fishChecked, setFishChecked] = useState(false);
  const [peanutsChecked, setPeanutsChecked] = useState(false);
  const [sesameChecked, setSesameChecked] = useState(false);

  const handleSignUp = async () => {
    setErrorMsg("");

    if (
      firstName.length === 0 ||
      lastName.length === 0 ||
      email.length === 0 ||
      username.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      setErrorMsg("Please enter all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }

    try {
      await signUp(email, password);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Sign up succeeded but could not get session.");
        return;
      }

      const token = session.access_token;

      await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, username }),
      });

      const selectedAllergens = [
        glutenChecked && "en:gluten",
        milkChecked && "en:milk",
        eggsChecked && "en:eggs",
        fishChecked && "en:fish",
        nutsChecked && "en:nuts",
        peanutsChecked && "en:peanuts",
        soybeansChecked && "en:soybeans",
        sesameChecked && "en:sesame-seeds",
      ].filter(Boolean);

      if (selectedAllergens.length > 0) {
        await fetch(`${BACKEND_URL}/api/users/allergens`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedAllergens),
        });
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Sign up failed.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Image
          source={require("@/assets/images/SwapSmart-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

            <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#8aa0b3"
                onChangeText={setFirstName}
            />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#8aa0b3"
            onChangeText={setLastName}
            />

            <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8aa0b3"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            />

            <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8aa0b3"
            autoCapitalize="none"
            onChangeText={setUsername}
            />

            <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8aa0b3"
            secureTextEntry
            onChangeText={setPassword}
            />

            <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#8aa0b3"
            secureTextEntry
            onChangeText={setConfirmPassword}
            />
          <Text style={styles.sectionTitle}>Allergens</Text>

          <View style={styles.allergenContainer}>
            {[
              ["Gluten", glutenChecked, setGlutenChecked],
              ["Milk", milkChecked, setMilkChecked],
              ["Eggs", eggsChecked, setEggsChecked],
              ["Fish", fishChecked, setFishChecked],
              ["Nuts", nutsChecked, setNutsChecked],
              ["Peanuts", peanutsChecked, setPeanutsChecked],
              ["Soybeans", soybeansChecked, setSoybeansChecked],
              ["Sesame", sesameChecked, setSesameChecked],
            ].map(([label, value, setter]: any) => (
              <View key={label} style={styles.allergenItem}>
                <Checkbox value={value} onValueChange={setter} color="#12AEBA" />
                <Text style={styles.allergenText}>{label}</Text>
              </View>
            ))}
          </View>

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
            <Text style={styles.primaryText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
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
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#0b1220",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#4f5050",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9fcff",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
    color: "#0b1220",
  },
  allergenContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  allergenItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    gap: 6,
  },
  allergenText: {
    fontSize: 14,
    color: "#0b1220",
  },
  primaryBtn: {
    backgroundColor: "#12AEBA",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#12AEBA",
    fontWeight: "600",
  },
  error: {
    color: "#c0392b",
    fontSize: 13,
    textAlign: "center",
  },
  
});