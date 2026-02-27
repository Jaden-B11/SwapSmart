// @ts-nocheck
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/ui/Header.tsx";

export default function Options() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* SwapSmart Logo and Name */}
            <Header/>

            {/* Options for Login or Signup */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.buttonOptions} onPress={() => router.replace("/auth/login")}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonOptions} onPress={() => router.replace("/auth/sign-up")}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        marginTop: 100
    },
    optionsContainer: {
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        marginTop: 32
    },
    buttonOptions: {
        alignItems: "center",
        borderRadius: 8,
        paddingVertical: 12,
        backgroundColor: "#007AFF",
        width: "80%"
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});