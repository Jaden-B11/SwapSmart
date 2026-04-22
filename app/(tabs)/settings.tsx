import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function Settings() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#12AEBA', '#01A0D9', '#EEECE1']}
                locations={[0.2163, 0.5625, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBar}
            />
            <View style={styles.content}>
                <Ionicons name="settings-outline" size={48} color="#b0bec5" />
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Coming soon...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    gradientBar: {
        height: 9,
        marginHorizontal: 3,
        borderRadius: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#37474f',
    },
    subtitle: {
        fontSize: 15,
        color: '#90a4ae',
    },
});