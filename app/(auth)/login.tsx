import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { userMode } from '@/services/userMode';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Tractor,
} from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      const role = data.user?.user_metadata?.role;
      if (role === 'food_buyer') {
        userMode.setIntent('food_buyer');
        router.replace('/(tabs)/marketplace');
      } else if (role === 'farmer') {
        router.replace('/farmer-log');
      } else {
        userMode.setIntent('farm_owner');
        router.replace('/(tabs)');
      }
    }
  };

  const handleExploreFarmOwner = () => {
    userMode.setIntent('farm_owner');
    router.replace('/(tabs)');
  };

  const handleExploreFoodBuyer = () => {
    userMode.setIntent('food_buyer');
    router.replace('/(tabs)/marketplace');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to check your farm or shop fresh food in Ibadan.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. tope@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <ArrowRight size={18} color={Colors.text.inverse} />
            </>
          )}
        </TouchableOpacity>

        {/* Quick Demo Exploration Options */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or test freely right now</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.demoButtonsRow}>
          <TouchableOpacity
            style={styles.demoCard}
            onPress={handleExploreFarmOwner}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🚜</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoTitle}>Explore as Farm Owner</Text>
              <Text style={styles.demoSub}>Hire a farmer, track crops & profit</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoCard}
            onPress={handleExploreFoodBuyer}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🛒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoTitle}>Explore as Food Buyer</Text>
              <Text style={styles.demoSub}>Shop fresh produce with delivery</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Farmer Application Callout */}
        <TouchableOpacity
          style={styles.farmerCallout}
          onPress={() => router.push('/farmer-onboarding')}
        >
          <Tractor size={18} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.farmerCalloutTitle}>Are you a local farmer in Oyo State?</Text>
            <Text style={styles.farmerCalloutSub}>Register your land & get hired by city farm owners →</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footerLink}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signupText}>Create One</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  form: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  demoButtonsRow: {
    gap: Spacing.sm,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  demoSub: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  farmerCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.xs,
  },
  farmerCalloutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  farmerCalloutSub: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
