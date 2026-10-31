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
import { userMode, UserIntent } from '@/services/userMode';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Sprout,
  ShoppingBag,
  CheckCircle2,
  Tractor,
} from 'lucide-react-native';

export default function RegisterScreen() {
  const [intent, setIntent] = useState<UserIntent>('farm_owner');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Required Fields', 'Please complete your name, email, and password.');
      return;
    }

    setLoading(true);
    userMode.setIntent(intent);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          role: intent,
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Registration Notice', error.message);
    } else {
      if (intent === 'farm_owner') {
        Alert.alert(
          'Account Created! 🌱',
          'Welcome to MyFarm. Let us help you start your first farm in Ibadan.',
          [{ text: 'Start My Farm', onPress: () => router.replace('/start-farm') }]
        );
      } else {
        Alert.alert(
          'Welcome to the Fresh Store! 🛒',
          'Browse fresh produce harvested from local farms with doorstep delivery.',
          [{ text: 'Start Shopping', onPress: () => router.replace('/(tabs)/marketplace') }]
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Join MyFarm</Text>
        <Text style={styles.subtitle}>
          Connecting city farm owners with local farmers in Ibadan.
        </Text>
      </View>

      {/* Intent Choice Cards */}
      <View style={styles.intentSection}>
        <Text style={styles.sectionLabel}>What is your main goal on MyFarm?</Text>

        <TouchableOpacity
          style={[styles.intentCard, intent === 'farm_owner' && styles.intentCardActive]}
          onPress={() => setIntent('farm_owner')}
          activeOpacity={0.85}
        >
          <View style={styles.intentHeader}>
            <View style={styles.intentIconTitle}>
              <Text style={{ fontSize: 22 }}>🚜</Text>
              <Text style={[styles.intentTitle, intent === 'farm_owner' && styles.intentTitleActive]}>
                I Want to Own a Farm
              </Text>
            </View>
            {intent === 'farm_owner' && <CheckCircle2 size={18} color={Colors.primary} />}
          </View>
          <Text style={styles.intentDesc}>
            Hire a verified local farmer in Ibadan to manage your farm and plant for you. Keep your harvest or sell it for profit.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.intentCard, intent === 'food_buyer' && styles.intentCardActive]}
          onPress={() => setIntent('food_buyer')}
          activeOpacity={0.85}
        >
          <View style={styles.intentHeader}>
            <View style={styles.intentIconTitle}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
              <Text style={[styles.intentTitle, intent === 'food_buyer' && styles.intentTitleActive]}>
                I Want to Buy Fresh Food
              </Text>
            </View>
            {intent === 'food_buyer' && <CheckCircle2 size={18} color={Colors.primary} />}
          </View>
          <Text style={styles.intentDesc}>
            Buy fresh food straight from local farms with fast doorstep delivery to your home in Ibadan (Bodija, Ring Road, Oluyole, Ido).
          </Text>
        </TouchableOpacity>
      </View>

      {/* Registration Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Babatunde Adeleke"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. b.adeleke@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number (For WhatsApp / SMS alerts)</Text>
          <View style={styles.inputContainer}>
            <Phone size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 0803 123 4567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Create Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {intent === 'farm_owner' ? 'Start My Farm' : 'Start Shopping'}
              </Text>
              <ArrowRight size={18} color={Colors.text.inverse} />
            </>
          )}
        </TouchableOpacity>

        {/* Farmer Onboarding Callout */}
        <TouchableOpacity
          style={styles.farmerCallout}
          onPress={() => router.push('/farmer-onboarding')}
        >
          <Tractor size={18} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.farmerCalloutTitle}>Are you a local farmer in Oyo State?</Text>
            <Text style={styles.farmerCalloutSub}>Join as a partner farmer & get hired by farm owners →</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footerLink}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginText}>Sign In</Text>
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
  intentSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  intentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  intentCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#fbfdfb',
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intentIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  intentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  intentTitleActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  intentDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 17,
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
  registerButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
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
  loginText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
