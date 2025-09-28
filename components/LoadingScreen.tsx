import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Globe } from 'lucide-react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Globe size={48} color="#007AFF" />
        <Text style={styles.title}>Koralai Browser</Text>
        <Text style={styles.subtitle}>Loading your preferences...</Text>
        <ActivityIndicator 
          size="small" 
          color="#007AFF" 
          style={styles.spinner} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});