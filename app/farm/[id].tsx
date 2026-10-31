import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Farm } from '@/types';
import {
  ShieldCheck,
  MapPin,
  Droplets,
  Layers,
  Sprout,
  ArrowRight,
  Sun,
  UserCheck,
} from 'lucide-react-native';

export default function FarmDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('farms')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFarm(data);
        } else {
          // Fallback realistic demo farm
          setFarm({
            id: 'a1111111-1111-1111-1111-111111111111',
            name: 'Ido Agro Precision Farm',
            slug: 'ido-agro-precision-farm',
            description:
              'A high-tech horticulture and vegetable production hub situated in Ido Local Government Area, Ibadan. Equipped with industrial solar-powered drip irrigation, high-grade nursery tunnels, and continuous soil testing.',
            state: 'Oyo',
            lga: 'Ido',
            address_description: 'Off Eleyele-Eruwa Road, Ido LGA, Ibadan',
            latitude: 7.4589,
            longitude: 3.7654,
            total_area_sqm: 25000,
            available_area_sqm: 18500,
            soil_type: 'Sandy Loam (pH 6.5)',
            water_source: 'Industrial Solar Borehole & Drip Irrigation',
            is_verified: true,
            cover_image_url:
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
            gallery_urls: [
              'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
            ],
          });
        }
        setLoading(false);
      });
  }, [id]);

  if (loading || !farm) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: farm.cover_image_url }} style={styles.coverImage} resizeMode="cover" />

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.farmTitle}>{farm.name}</Text>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.verifiedText}>Verified Partner</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.text.muted} />
          <Text style={styles.locationText}>{farm.address_description}</Text>
        </View>

        <Text style={styles.description}>{farm.description}</Text>

        {/* Infrastructure Specs */}
        <View style={styles.specsCard}>
          <Text style={styles.specsTitle}>Farm Infrastructure & Soil</Text>
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Layers size={16} color={Colors.primary} />
              <View>
                <Text style={styles.specLabel}>Soil Type</Text>
                <Text style={styles.specVal}>{farm.soil_type}</Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <Droplets size={16} color={Colors.primaryLight} />
              <View>
                <Text style={styles.specLabel}>Water System</Text>
                <Text style={styles.specVal}>{farm.water_source}</Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <Sun size={16} color={Colors.accentGold} />
              <View>
                <Text style={styles.specLabel}>Available Land</Text>
                <Text style={styles.specVal}>
                  {(farm.available_area_sqm / 1000).toFixed(1)}k sqm ({Math.round(farm.available_area_sqm / 50)} plots)
                </Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <UserCheck size={16} color={Colors.primary} />
              <View>
                <Text style={styles.specLabel}>Resident Operator</Text>
                <Text style={styles.specVal}>Samuel Olaniyan (Agronomist)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Available Crops */}
        <View style={styles.supportedSection}>
          <Text style={styles.sectionTitle}>Crops Supported at this Farm</Text>
          <View style={styles.cropChips}>
            {['Roma Tomato', 'Habanero Pepper', 'Sweet Corn', 'Cassava'].map((cropName, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.cropChip}
                onPress={() => router.push('/(tabs)/discover')}
              >
                <Sprout size={14} color={Colors.primary} />
                <Text style={styles.cropChipText}>{cropName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/calculator')}
        >
          <Text style={styles.actionBtnText}>Configure Plot at this Farm</Text>
          <ArrowRight size={18} color={Colors.text.inverse} />
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
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  details: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmTitle: {
    ...Typography.heading1,
    color: Colors.text.primary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  specsCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  specsTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  specGrid: {
    gap: Spacing.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  specLabel: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  specVal: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  supportedSection: {
    gap: Spacing.xs + 2,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  cropChipText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  actionBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
