import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";


export default function SignUp() {
    const router = useRouter();
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

  

    const handleSignUp = () => {
        setErrorMsg("");

    // if user doesn't fill out all fields 
        if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || 
        username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
            setErrorMsg("Please enter all fields");
        } else if (password !== confirmPassword) {
            setErrorMsg("Passwords don't match");
        } else {
            console.log("Working on sign up process in backend!");
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Title */}
                <Text style={styles.title}>Sign Up</Text>

                {/* Inputs */}
                <View style={styles.formContainer}>

                    {/* First Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>First Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your first name"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                onChangeText={setFirstName}
                            />
                        </View>
                    </View>

                    {/* Last Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Last Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your last name"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                autoComplete="email"
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a username"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                autoComplete="username"
                                onChangeText={setUsername}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                placeholderTextColor="gray"
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoComplete="password-new"
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor="gray"
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoComplete="password-new"
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                    {/* Allergens Input */}
                    {/* TODO: Have an unique checkbox value for each allergen */}
                    <Text style={styles.label}> Allergens: </Text>
                    <View style={styles.allergenContainer}>

                        <View style={styles.allergenItems}>
                        <Checkbox style={styles.checkbox} value={glutenChecked} onValueChange={setGlutenChecked}/>
                        <Text>Gluten</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={milkChecked} onValueChange={setMilkChecked}/>
                            <Text>Milk</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={eggsChecked} onValueChange={setEggsChecked}/>
                            <Text>Eggs</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={fishChecked} onValueChange={setFishChecked}/>
                            <Text>Fish</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={nutsChecked} onValueChange={setNutsChecked}/>
                            <Text>Nuts</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={peanutsChecked} onValueChange={setPeanutsChecked}/>
                            <Text>Peanuts</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={soybeansChecked} onValueChange={setSoybeansChecked}/>
                            <Text>Soybeans</Text>
                        </View>

                        <View style={styles.allergenItems}>
                            <Checkbox style={styles.checkbox} value={sesameChecked} onValueChange={setSesameChecked}/>
                            <Text>Sesame Seeds</Text>
                        </View>

                    </View>

                </View>

                    {/* Buttons */}

                    <View style={styles.buttonGroup}>

                    {/* Sign Up */}
                    <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                        <Text style={styles.signUpText}>Sign up</Text>
                    </TouchableOpacity>

                    {/* Cancel Sign Up process -> reroute to options page */}
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.push("/(tabs)/options")}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    </View>

                    {/* Error Message */}
                    <Text style={styles.errorMsg}>{errorMsg}</Text>

                </View>

                {/* Login Rerouting */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity>
                        <Text style={styles.loginLink} onPress={() => router.push("/auth/login")}>Click here</Text>
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
    signUpButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 8
    },
    signUpText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    buttonGroup: {
        flexDirection: "row",
        width: "100%",
        maxWidth: 360,
        gap: 12,
        marginTop: 10
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 8
    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    errorMsg: {
        color: "red",
        fontSize: 13,
        textAlign: "center"
    },
    loginContainer: {
        flexDirection: "row",
        marginTop: 24,
        alignItems: "center"
    },
    loginText: {
        color: "#555",
        fontSize: 14
    },
    loginLink: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600"
    },
    checkbox: {
        // color: "blue"
        margin: 5
    },
    allergenContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    allergenItems: {
        flexDirection: "row",
        alignItems: "center",
        width: "50%",
        marginBottom: 8
    }
});