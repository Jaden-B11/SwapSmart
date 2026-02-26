import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";


export default function Login() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = () => {
        setErrorMsg("");

        if (password.length === 0 || username.length === 0) {
            setErrorMsg("Please enter a valid username and password.");
        } else {
            console.log("Working on login in backend!");
        }

    }



    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Title */}
                <Text style={styles.title}>Login</Text>

                {/* Username/Password Inputs */}
                <View style={styles.formContainer}>

                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter your username"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                autoComplete="username"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                placeholderTextColor="gray"
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoComplete="password"
                            />
                        </View>
                    </View>

                </View>

                {/* Buttons */}
                <View style={styles.buttonGroup}>

                    {/* Sign In */}
                    <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                        <Text style={styles.signInText}>Sign in</Text>
                    </TouchableOpacity>

                    {/* Cancel Login process -> reroute to Login or Signup page */}
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.push("/(tabs)/options")}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </View>

                {/* Error Message */}
                <Text style={styles.errorMsg}>{errorMsg}</Text>

                {/* Sign Up Rerouting */}
                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/auth/sign-up")}>
                        <Text style={styles.signUpLink}>Sign up</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 32,
        color: "#1a1a1a"
    },
    formContainer: {
        width: "100%",
        maxWidth: 360,
        gap: 16
    },
    inputContainer: {
        gap: 6
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333"
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff"
    },
    input: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: "#1a1a1a"
    },
    buttonGroup: {
        flexDirection: "row",
        width: "100%",
        maxWidth: 360,
        gap: 12,
        marginTop: 30
    },
    signInButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    signInText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    errorMsg: {
        color: "red",
        fontSize: 13,
        textAlign: "center",
        marginTop: 8
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    signUpContainer: {
        flexDirection: "row",
        marginTop: 24,
        alignItems: "center"
    },
    signUpText: {
        color: "#555",
        fontSize: 14
    },
    signUpLink: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600"
    }
});