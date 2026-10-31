import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';

const CROPS = [
  {
    id: 'tomato',
    name: 'Roma Tomato (F1 Hybrid)',
    basePerSqm: 1160,
    yieldPerSqmMin: 3.2,
    yieldPerSqmMax: 4.4,
    marketRetailPricePerKg: 1200,
    days: 75,
  },
  {
    id: 'pepper',
    name: 'Habanero Pepper (Atarodo)',
    basePerSqm: 1040,
    yieldPerSqmMin: 2.4,
    yieldPerSqmMax: 3.4,
    marketRetailPricePerKg: 1900,
    days: 90,
  },
  {
    id: 'corn',
    name: 'Sweet Corn (Maize)',
    basePerSqm: 500,
    yieldPerSqmMin: 2.2,
    yieldPerSqmMax: 3.0,
    marketRetailPricePerKg: 950,
    days: 70,
  },
];

const PLOT_SIZES = [
  { size: 50, label: '50 sqm (Starter Plot)', multiplier: 1.0 },
  { size: 100, label: '100 sqm (Family Unit)', multiplier: 1.85 }, // Volume discount
  { size: 250, label: '250 sqm (Commercial Plot)', multiplier: 4.2 },
];

export default function CalculatorScreen() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
  const [selectedPlot, setSelectedPlot] = useState(PLOT_SIZES[0]);

  // Calculations
  const rawCost = Math.round(selectedCrop.basePerSqm * selectedPlot.size * (selectedPlot.multiplier / (selectedPlot.size / 50)));
  const platformFee = Math.round(rawCost * 0.12);
  const totalCost = rawCost + platformFee;

  const yieldMin = Math.round(selectedCrop.yieldPerSqmMin * selectedPlot.size);
  const yieldMax = Math.round(selectedCrop.yieldPerSqmMax * selectedPlot.size);
  const avgYield = (yieldMin + yieldMax) / 2;
  const costPerKg = Math.round(totalCost / avgYield);
  const savingsPerKg = Math.max(0, selectedCrop.marketRetailPricePerKg - costPerKg);

  const budgetItems = [
    { name: 'Land Preparation, Ridging & Bed Formation', pct: 0.16 },
    { name: 'Certified Hybrid Seeds & Nursery Care', pct: 0.22 },
    { name: 'Enriched Compost & Organic Bio-Stimulants', pct: 0.18 },
    { name: 'Solar Drip Irrigation Access (Daily Water)', pct: 0.14 },
    { name: 'Botanical Pest & Disease Bio-Protection', pct: 0.12 },
    { name: 'Skilled Farming Labor, Staking & Weeding', pct: 0.18 },
  ];

  const handleProceed = () => {
    router.push({
      pathname: '/checkout',
      params: {
        cropName: selectedCrop.name,
        plotSize: selectedPlot.size,
        totalCost: totalCost,
        yieldMin: yieldMin,
        yieldMax: yieldMax,
        days: selectedCrop.days,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Production Cost Estimator</Text>
        <Text style={styles.subtitle}>
          Configure your crop and plot size to calculate an itemized, transparent
          production budget.
        </Text>
      </View>

      {/* 1. Crop Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>1. Select Crop</Text>
        <View style={styles.cropButtons}>
          {CROPS.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.cropBtn,
                selectedCrop.id === crop.id && styles.cropBtnActive,
              ]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text
                style={[
                  styles.cropBtnText,
                  selectedCrop.id === crop.id && styles.cropBtnTextActive,
                ]}
              >
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Plot Size Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>2. Select Plot Size</Text>
        <View style={styles.plotButtons}>
          {PLOT_SIZES.map((plot) => (
            <TouchableOpacity
              key={plot.size}
              style={[
                styles.plotBtn,
                selectedPlot.size === plot.size && styles.plotBtnActive,
              ]}
              onPress={() => setSelectedPlot(plot)}
            >
              <Text
                style={[
                  styles.plotBtnText,
                  selectedPlot.size === plot.size && styles.plotBtnTextActive,
                ]}
              >
                {plot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. Output Summary Cards */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Calculated Projections</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Production Cost</Text>
            <Text style={styles.metricValue}>₦{totalCost.toLocaleString()}</Text>
            <Text style={styles.metricSub}>All inputs + operations</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Estimated Produce Yield</Text>
            <Text style={styles.metricValue}>
              {yieldMin} – {yieldMax} kg
            </Text>
            <Text style={styles.metricSub}>Based on {selectedCrop.days} days</Text>
          </View>
        </View>

        {/* Cost Per Kg Comparison */}
        <View style={styles.comparisonBanner}>
          <View style={styles.compLeft}>
            <TrendingDown size={20} color={Colors.primary} />
            <View>
              <Text style={styles.compTitle}>
                Effective Cost: ₦{costPerKg.toLocaleString()} / kg
              </Text>
              <Text style={styles.compSub}>
                Vs. Ibadan Retail Average: ₦
                {selectedCrop.marketRetailPricePerKg.toLocaleString()} / kg
              </Text>
            </View>
          </View>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsText}>
              Save ~₦{savingsPerKg}/kg
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Itemized Budget Schedule */}
      <View style={styles.budgetCard}>
        <Text style={styles.budgetTitle}>Itemized Budget Breakdown</Text>
        {budgetItems.map((item, idx) => {
          const itemCost = Math.round(rawCost * item.pct);
          return (
            <View key={idx} style={styles.budgetRow}>
              <View style={styles.budgetRowLeft}>
                <CheckCircle2 size={14} color={Colors.primary} />
                <Text style={styles.budgetName}>{item.name}</Text>
              </View>
              <Text style={styles.budgetAmount}>₦{itemCost.toLocaleString()}</Text>
            </View>
          );
        })}
        <View style={[styles.budgetRow, styles.budgetFeeRow]}>
          <View style={styles.budgetRowLeft}>
            <CheckCircle2 size={14} color={Colors.accent} />
            <Text style={styles.budgetName}>
              Platform Quality Verification & Monitoring (12%)
            </Text>
          </View>
          <Text style={styles.budgetAmount}>₦{platformFee.toLocaleString()}</Text>
        </View>
      </View>

      {/* 5. Agricultural Notice */}
      <View style={styles.disclaimerCard}>
        <AlertTriangle size={18} color={Colors.accent} />
        <Text style={styles.disclaimerText}>
          Agricultural production depends on weather and biology. All yields and
          durations are scientific projections, not guaranteed returns.
        </Text>
      </View>

      {/* 6. Proceed Button */}
      <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
        <Text style={styles.proceedBtnText}>Review & Confirm Participation</Text>
        <ArrowRight size={18} color={Colors.text.inverse} />
      </TouchableOpacity>
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    gap: 4,
  },
  title: {
    ...Typography.heading1,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.xs + 2,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  cropButtons: {
    gap: Spacing.xs + 2,
  },
  cropBtn: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cropBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  cropBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
  },
  cropBtnTextActive: {
    color: Colors.primary,
  },
  plotButtons: {
    gap: Spacing.xs + 2,
  },
  plotBtn: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  plotBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  plotBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
  },
  plotBtnTextActive: {
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  summaryTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 2,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  comparisonBanner: {
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  compLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compTitle: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  compSub: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  savingsPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  savingsText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  budgetCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  budgetTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  budgetFeeRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  budgetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  budgetName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  budgetAmount: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  disclaimerCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
  },
  proceedBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  proceedBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
