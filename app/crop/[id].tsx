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
import { Crop, CropPackage } from '@/types';
import {
  Calendar,
  Droplets,
  Layers,
  ShieldCheck,
  Calculator,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';

export default function CropDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [packages, setPackages] = useState<CropPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<CropPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('crops')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCrop(data);
        } else {
          // Demo fallback
          setCrop({
            id: 'c1111111-1111-1111-1111-111111111111',
            name: 'Roma Tomato (F1 Hybrid)',
            botanical_name: 'Solanum lycopersicum',
            category: 'Vegetable',
            description:
              'High-yielding, firm-skinned determinate tomato variety with high disease resistance (Bacterial Wilt, TYLCV) and strong consumer demand across Ibadan markets.',
            growth_duration_days: 75,
            planting_season: 'All-year (Irrigated)',
            water_requirement: 'High (Regular drip moisture)',
            soil_requirement: 'Well-drained sandy loam rich in organic compost',
            pest_and_disease_notes:
              'Scouted regularly for Tuta absoluta and early blight. Managed with botanical neem extracts.',
            image_url:
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
            is_active: true,
          });
        }
        setLoading(false);
      });

    // Default package options
    const defaultPkgs: CropPackage[] = [
      {
        id: 'p1',
        crop_id: 'c1',
        name: 'Starter Tomato Plot (50 sqm)',
        plot_size_sqm: 50,
        target_yield_min_kg: 160,
        target_yield_max_kg: 220,
        base_production_cost: 58000,
        platform_fee: 7000,
        total_price: 65000,
        is_active: true,
      },
      {
        id: 'p2',
        crop_id: 'c1',
        name: 'Family Harvest Unit (100 sqm)',
        plot_size_sqm: 100,
        target_yield_min_kg: 350,
        target_yield_max_kg: 460,
        base_production_cost: 105000,
        platform_fee: 13000,
        total_price: 118000,
        is_active: true,
      },
    ];
    setPackages(defaultPkgs);
    setSelectedPkg(defaultPkgs[0]);
  }, [id]);

  if (loading || !crop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleCheckout = () => {
    if (!selectedPkg) return;
    router.push({
      pathname: '/checkout',
      params: {
        cropName: crop.name,
        plotSize: selectedPkg.plot_size_sqm,
        totalCost: selectedPkg.total_price,
        yieldMin: selectedPkg.target_yield_min_kg,
        yieldMax: selectedPkg.target_yield_max_kg,
        days: crop.growth_duration_days,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: crop.image_url }} style={styles.cropImage} resizeMode="cover" />

      <View style={styles.details}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{crop.category.toUpperCase()}</Text>
        </View>

        <Text style={styles.cropTitle}>{crop.name}</Text>
        {crop.botanical_name && (
          <Text style={styles.botanicalText}>({crop.botanical_name})</Text>
        )}

        <Text style={styles.cropDesc}>{crop.description}</Text>

        {/* Agronomic Profile */}
        <View style={styles.specCard}>
          <Text style={styles.specTitle}>Agronomic Specifications</Text>

          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Calendar size={18} color={Colors.primary} />
              <View>
                <Text style={styles.specLabel}>Growth Duration</Text>
                <Text style={styles.specVal}>{crop.growth_duration_days} Days</Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <Droplets size={18} color={Colors.primaryLight} />
              <View>
                <Text style={styles.specLabel}>Water Requirement</Text>
                <Text style={styles.specVal}>{crop.water_requirement}</Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <Layers size={18} color={Colors.primary} />
              <View>
                <Text style={styles.specLabel}>Soil Requirement</Text>
                <Text style={styles.specVal}>{crop.soil_requirement}</Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <ShieldCheck size={18} color={Colors.accent} />
              <View>
                <Text style={styles.specLabel}>Bio Protection Protocol</Text>
                <Text style={styles.specVal}>{crop.pest_and_disease_notes}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          <View style={styles.packagesHeader}>
            <Text style={styles.sectionHeading}>Production Packages</Text>
            <TouchableOpacity onPress={() => router.push('/calculator')}>
              <Text style={styles.customCalcLink}>Custom Plot Size →</Text>
            </TouchableOpacity>
          </View>

          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPkg?.id === pkg.id && styles.packageCardActive,
              ]}
              onPress={() => setSelectedPkg(pkg)}
            >
              <View style={styles.pkgTop}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                <Text style={styles.pkgPrice}>₦{pkg.total_price.toLocaleString()}</Text>
              </View>

              <View style={styles.pkgMetaRow}>
                <View style={styles.pkgYield}>
                  <TrendingUp size={14} color={Colors.primary} />
                  <Text style={styles.pkgYieldText}>
                    Target Yield: {pkg.target_yield_min_kg} – {pkg.target_yield_max_kg} kg
                  </Text>
                </View>
                <Text style={styles.pkgPerKg}>
                  ~₦{Math.round(pkg.total_price / ((pkg.target_yield_min_kg + pkg.target_yield_max_kg) / 2))}/kg
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Checkout Button */}
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>
            Select Package & Proceed • ₦{selectedPkg?.total_price.toLocaleString()}
          </Text>
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
  cropImage: {
    width: '100%',
    height: 220,
  },
  details: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  cropTitle: {
    ...Typography.heading1,
    color: Colors.text.primary,
  },
  botanicalText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.text.muted,
    marginTop: -8,
  },
  cropDesc: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  specCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  specTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  specGrid: {
    gap: Spacing.sm + 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  specLabel: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  specVal: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    marginTop: 1,
  },
  packagesSection: {
    gap: Spacing.sm,
  },
  packagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  customCalcLink: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  packageCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs + 2,
  },
  packageCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  pkgTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pkgName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  pkgPrice: {
    ...Typography.heading2,
    color: Colors.primary,
  },
  pkgMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pkgYield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pkgYieldText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  pkgPerKg: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  checkoutBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
