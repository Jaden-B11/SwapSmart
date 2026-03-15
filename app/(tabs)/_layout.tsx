import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useAuth();
  const router = useRouter();

  // Redirect to login when user tries to access protected tab
  const handleProtectedTab = () => {
    if (!session) {
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* Public tabs — always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
        }}
      />
      <Tabs.Screen
        name="options"
        options={{
          title: 'Options',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />

      {/* Protected tabs — redirect to login if not authenticated */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.fill" color={color} />,
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={() => {
                if (handleProtectedTab()) props.onPress?.(null as any);
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={() => {
                if (handleProtectedTab()) props.onPress?.(null as any);
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={() => {
                if (handleProtectedTab()) props.onPress?.(null as any);
              }}
            />
          ),
        }}
      />

    </Tabs>
  );
}