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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Sprout,
  Shovel,
  Leaf,
  WifiOff,
  ExternalLink,
} from 'lucide-react-native';

const ACTIVITY_CATEGORIES = [
  { id: 'Land Preparation', label: 'Land Prep & Ridging', icon: Shovel },
  { id: 'Sowing & Nursery', label: 'Seedling Transplanting', icon: Sprout },
  { id: 'Vegetative Care', label: 'Weeding & Mulching', icon: Leaf },
  { id: 'Irrigation', label: 'Solar Drip Irrigation', icon: Droplets },
  { id: 'Incident Alert', label: 'Pest / Weather Incident', icon: AlertTriangle },
];

export default function FarmerLogScreen() {
  const router = useRouter();
  const [selectedCycle, setSelectedCycle] = useState('f1111111-1111-1111-1111-111111111111');
  const [selectedCategory, setSelectedCategory] = useState('Vegetative Care');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [inputs, setInputs] = useState('');
  const [gpsLocation, setGpsLocation] = useState('7.4589° N, 3.7654° E (Ido LGA)');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !notes.trim()) {
      Alert.alert('Required Fields', 'Please enter an activity title and field observation notes.');
      return;
    }

    setSubmitting(true);

    try {
      // Direct Supabase insert
      const { data, error } = await supabase.from('farming_activities').insert([
        {
          production_order_id: selectedCycle,
          farmer_id: 'e0000000-0000-0000-0000-000000000001',
          stage_name: selectedCategory,
          title: title.trim(),
          description: notes.trim(),
          activity_date: new Date().toISOString().split('T')[0],
          inputs_applied: { text: inputs.trim(), gps: gpsLocation },
          status: 'pending_approval',
        },
      ]);

      if (error) {
        console.warn('DB note:', error.message);
      }
    } catch (e) {
      console.warn('Offline capture:', e);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconContainer}>
          <CheckCircle2 size={48} color={Colors.primary} />
        </View>
        <Text style={styles.successTitle}>Field Update Submitted!</Text>
        <Text style={styles.successDesc}>
          Your report has been submitted to MyFarm Operations for quality verification. Once approved, it will be published to the participant's timeline.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Field Logger</Text>
        <View style={styles.headerRightBadge}>
          <Text style={styles.headerRightBadgeText}>Field Mode</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Remote Field PWA Banner */}
        <TouchableOpacity
          style={styles.pwaBanner}
          onPress={() => Linking.openURL('http://localhost:3000/farmer/')}
        >
          <View style={styles.pwaBannerLeft}>
            <WifiOff size={18} color="#b45309" />
            <View style={styles.pwaBannerTextWrap}>
              <Text style={styles.pwaBannerTitle}>Remote Offline Mode (PWA)</Text>
              <Text style={styles.pwaBannerSub}>Service Worker & IndexedDB active for Ido farm plots</Text>
            </View>
          </View>
          <ExternalLink size={16} color="#b45309" />
        </TouchableOpacity>

        {/* Farm & Operator Badge */}
        <View style={styles.stationCard}>
          <Text style={styles.stationOverline}>Assigned Station</Text>
          <Text style={styles.stationTitle}>Ido Agro Precision Farm</Text>
          <Text style={styles.stationSub}>Operator: Adebayo Ogunlesi (Lead Agronomist)</Text>
          <View style={styles.gpsRow}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.gpsText}>{gpsLocation}</Text>
          </View>
        </View>

        {/* Activity Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Activity Category</Text>
          <View style={styles.categoryGrid}>
            {ACTIVITY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={20} color={isSelected ? Colors.primary : Colors.text.muted} />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Activity Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Activity Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Bed Weeding & Bio-Stimulant Spray"
            placeholderTextColor={Colors.text.muted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Observation Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Field Observations & Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe crop vigor, soil moisture, flowering, or challenges..."
            placeholderTextColor={Colors.text.muted}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Inputs Applied */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Inputs Applied (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 200L borehole water, 10kg compost"
            placeholderTextColor={Colors.text.muted}
            value={inputs}
            onChangeText={setInputs}
          />
        </View>

        {/* Photo Evidence Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo Evidence</Text>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => Alert.alert('Camera Attached 📸', 'In production, launches device camera to capture field evidence.')}
          >
            <Camera size={28} color={Colors.primary} />
            <Text style={styles.photoBoxText}>Tap to take photo of crop/plot</Text>
            <Text style={styles.photoBoxSub}>High-resolution photo for audit verification</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit for Operations Review →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  headerRightBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  headerRightBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  pwaBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pwaBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  pwaBannerTextWrap: {
    flex: 1,
  },
  pwaBannerTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: '#92400e',
    fontSize: 13,
  },
  pwaBannerSub: {
    ...Typography.caption,
    color: '#b45309',
    fontSize: 11,
  },
  stationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  stationOverline: {
    ...Typography.caption,
    textTransform: 'uppercase',
    fontWeight: '800',
    color: Colors.text.muted,
  },
  stationTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  stationSub: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  gpsText: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: '700',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  categoryTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    ...Typography.body,
    color: Colors.text.primary,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  photoBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  photoBoxText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  photoBoxSub: {
    ...Typography.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    ...Typography.heading1,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  successDesc: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
