import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  Tractor,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Sprout,
} from 'lucide-react-native';

const CROPS_LIST = [
  'Tomatoes',
  'Habanero Pepper (Rodo)',
  'Sweet Corn / Maize',
  'Cassava',
  'Yam / Tubers',
  'Green Leaf Vegetables',
];

const LGAS = ['Ido LGA', 'Akinyele LGA', 'Ibarapa East', 'Egbeda LGA', 'Oluyole LGA'];

export default function FarmerOnboardingScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [village, setVillage] = useState('');
  const [selectedLga, setSelectedLga] = useState(LGAS[0]);
  const [landSize, setLandSize] = useState('2 Acres');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Tomatoes', 'Habanero Pepper (Rodo)']);
  const [waterSource, setWaterSource] = useState('River / Stream Nearby');
  const [experienceYears, setExperienceYears] = useState('5+ Years');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !phoneNumber || !village) {
      Alert.alert('Required Fields', 'Please enter your Name, Phone Number, and Village/Community.');
      return;
    }

    setSubmitting(true);
    try {
      // Save to Supabase partner_farmers table
      await supabase.from('farmer_applications').insert([
        {
          full_name: fullName,
          phone_number: phoneNumber,
          village,
          lga: selectedLga,
          land_size: landSize,
          crops: selectedCrops,
          water_source: waterSource,
          experience: experienceYears,
          status: 'pending_verification',
        },
      ]);
    } catch (e) {
      // Fallback
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={{ fontSize: 50 }}>🚜</Text>
          <Text style={styles.successTitle}>Application Received!</Text>
          <Text style={styles.successBody}>
            E kaabo, <Text style={{ fontWeight: '800' }}>{fullName}</Text>. Your farmer partner application for your land in <Text style={{ fontWeight: '700' }}>{village}, {selectedLga}</Text> has been submitted.
          </Text>
          <View style={styles.successInfoBox}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.successInfoText}>
              Our Oyo State Agronomy Field Team will call you on <Text style={{ fontWeight: '700' }}>{phoneNumber}</Text> within 48 hours to schedule a physical soil test and GPS farm mapping.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.openPwaBtn}
            onPress={() => router.push('/farmer-log')}
          >
            <Text style={styles.openPwaBtnText}>Open Field App (PWA)</Text>
            <ArrowRight size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeLinkBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeLinkText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Become a Partner Farmer</Text>
          <Text style={styles.headerSubtitle}>Get hired by city farm owners in Oyo State</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌾 Why Farm With MyFarm?</Text>
        <Text style={styles.infoBody}>
          City dwellers who want to own a farm fund the land, certified seeds, organic fertilizer, and irrigation. You get steady income, fair labor pay, and harvest bonuses without taking debt.
        </Text>
      </View>

      {/* Farmer Form */}
      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farmer Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Adebayo Ogunlesi"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number (WhatsApp or Call)</Text>
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

        {/* Location & LGA */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Village / Community</Text>
          <View style={styles.inputContainer}>
            <MapPin size={18} color={Colors.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Alabata / Akufo / Omi Adio"
              value={village}
              onChangeText={setVillage}
              placeholderTextColor={Colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local Government Area (Oyo State)</Text>
          <View style={styles.pillRow}>
            {LGAS.map((lga) => (
              <TouchableOpacity
                key={lga}
                style={[styles.pill, selectedLga === lga && styles.pillActive]}
                onPress={() => setSelectedLga(lga)}
              >
                <Text style={[styles.pillText, selectedLga === lga && styles.pillTextActive]}>
                  {lga}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Land Size */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farmland Size Available</Text>
          <View style={styles.pillRow}>
            {['2 - 4 Plots', '1 - 2 Acres', '3 - 5 Acres', '5+ Acres'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.pill, landSize === size && styles.pillActive]}
                onPress={() => setLandSize(size)}
              >
                <Text style={[styles.pillText, landSize === size && styles.pillTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crops Experienced in */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Crops You Have Experience Growing</Text>
          <View style={styles.cropsWrap}>
            {CROPS_LIST.map((crop) => {
              const hasCrop = selectedCrops.includes(crop);
              return (
                <TouchableOpacity
                  key={crop}
                  style={[styles.cropPill, hasCrop && styles.cropPillActive]}
                  onPress={() => toggleCrop(crop)}
                >
                  {hasCrop && <CheckCircle2 size={14} color={Colors.primary} />}
                  <Text style={[styles.cropPillText, hasCrop && styles.cropPillTextActive]}>
                    {crop}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Water Source */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water / Irrigation Source</Text>
          <View style={styles.pillRow}>
            {['River / Stream Nearby', 'Borehole / Well', 'Rainfed Only'].map((src) => (
              <TouchableOpacity
                key={src}
                style={[styles.pill, waterSource === src && styles.pillActive]}
                onPress={() => setWaterSource(src)}
              >
                <Text style={[styles.pillText, waterSource === src && styles.pillTextActive]}>
                  {src}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit Farmer Registration</Text>
              <ArrowRight size={18} color={Colors.text.inverse} />
            </>
          )}
        </TouchableOpacity>
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
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  infoBody: {
    fontSize: 12,
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  cropsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropPillActive: {
    backgroundColor: Colors.primaryFaint,
    borderColor: Colors.primary,
  },
  cropPillText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  cropPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    textAlign: 'center',
    gap: Spacing.md,
    maxWidth: 420,
    width: '100%',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  successBody: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  successInfoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  },
  openPwaBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  openPwaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  homeLinkBtn: {
    paddingVertical: Spacing.xs,
  },
  homeLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.muted,
  },
});
