import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Users, Calculator, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f766e', '#06b6d4']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Calculator size={48} color="#ffffff" />
            </View>
            <Text style={styles.title}>QuickSplit</Text>
            <Text style={styles.subtitle}>
              Split bills and expenses with friends instantly
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Users size={24} color="#ffffff" />
              <Text style={styles.featureText}>Add friends</Text>
            </View>
            <View style={styles.feature}>
              <Calculator size={24} color="#ffffff" />
              <Text style={styles.featureText}>Track expenses</Text>
            </View>
            <View style={styles.feature}>
              <ArrowRight size={24} color="#ffffff" />
              <Text style={styles.featureText}>See who owes what</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/add-people')}
            activeOpacity={0.9}
          >
            <Text style={styles.startButtonText}>Start a New Split</Text>
            <ArrowRight size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginRight: 8,
  },
});