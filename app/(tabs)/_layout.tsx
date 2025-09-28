import { Tabs } from 'expo-router';
import { Globe, Bookmark, Clock, Settings, Menu } from 'lucide-react-native';
import { Platform } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <>
      {/* Watermark Overlay */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Text style={styles.watermarkText}>Koralai Browser α</Text>
      </View>
      
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#E5E5EA',
            elevation: 0,
            shadowOpacity: 0,
            height: 44,
          },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
            color: '#000',
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 44 : 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#E5E5EA',
            elevation: 0,
            shadowOpacity: 0,
            height: 48,
            paddingHorizontal: 16,
            zIndex: 1000,
          },
          tabBarShowLabel: false,
          tabBarItemStyle: {
            flex: 1,
            maxWidth: 60,
          },
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Koralai Browser',
          tabBarIcon: ({ color, size }) => (
            <Globe size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved Pages',
          tabBarIcon: ({ color, size }) => (
            <Bookmark size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Recent Activity',
          tabBarIcon: ({ color, size }) => (
            <Clock size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Preferences',
          tabBarIcon: ({ color, size }) => (
            <Settings size={20} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 56,
    right: 16,
    zIndex: 9999,
    opacity: 0.3,
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});