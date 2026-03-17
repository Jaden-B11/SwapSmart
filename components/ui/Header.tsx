import { Image, StyleSheet, View } from "react-native";

export default function Header() {


    return (
        <View style={styles.logoContainer}>
            <Image
            source={require("../../assets/images/SwapSmart-logo.png")}
            style={styles.logo}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 12,
        marginLeft: 8,
        marginTop: 50
    },
    logo: {
        width: 255,
        height: 270,
    }
});