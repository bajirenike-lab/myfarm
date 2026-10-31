import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  Sprout,
  MapPin,
  CheckCircle2,
  Calendar,
  Package,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
} from 'lucide-react-native';

const CROPS = [
  {
    id: 'roma-tomatoes',
    name: 'Roma Tomatoes',
    emoji: '🍅',
    duration: '75 Days',
    yieldKg: '180 - 220 kg',
    cost: 65000,
    marketValue: 163600,
    desc: 'High demand in Bodija & Ojoo markets. Firm, long shelf-life variety.',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'habanero-pepper',
    name: 'Habanero Pepper (Rodo)',
    emoji: '🌶️',
    duration: '90 Days',
    yieldKg: '120 - 150 kg',
    cost: 70000,
    marketValue: 185000,
    desc: 'Always in daily demand across Ibadan homes and restaurants. Resilient crop.',
    image:
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sweet-corn',
    name: 'Sweet Corn',
    emoji: '🌽',
    duration: '65 Days',
    yieldKg: '350 - 400 Cobs',
    cost: 50000,
    marketValue: 120000,
    desc: 'Fastest turnaround crop. Sweet yellow variety, rapid harvest.',
    image:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  },
];

const FARMS = [
  {
    id: 'ido-belt',
    name: 'Ido Agro Farm Belt',
    location: 'Ido LGA, Ibadan',
    soil: 'Rich Loamy Soil • Year-round River Irrigation',
    farmerName: 'Adebayo Ogunlesi',
    farmerRole: 'Lead Field Agronomist',
    farmerExp: '8 Years Experience in Ido',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'akinyele-belt',
    name: 'Akinyele Farm Station',
    location: 'Akinyele LGA, Ibadan',
    soil: 'Proven Vegetable Soil • Borehole Water Supply',
    farmerName: 'Folake Alabi',
    farmerRole: 'Horticulture Specialist',
    farmerExp: '6 Years Experience',
    image:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80',
  },
];

export default function StartFarmScreen() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
  const [selectedFarm, setSelectedFarm] = useState(FARMS[0]);
  const [plots, setPlots] = useState(1);
  const [harvestChoice, setHarvestChoice] = useState<'deliver' | 'sell'>('sell');

  const totalCost = selectedCrop.cost * plots;
  const totalValue = selectedCrop.marketValue * plots;
  const estimatedProfit = totalValue - totalCost;

  const handleStartFarm = () => {
    // Navigate directly to checkout confirmation
    router.push({
      pathname: '/checkout',
      params: {
        cropId: selectedCrop.id,
        cropName: selectedCrop.name,
        farmId: selectedFarm.id,
        farmName: selectedFarm.name,
        farmerName: selectedFarm.farmerName,
        plots,
        totalCost,
        harvestChoice,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Own a Farm in Ibadan</Text>
          <Text style={styles.headerSubtitle}>Hire a verified farmer to plant & manage it for you</Text>
        </View>
      </View>

      {/* Value Proposition Banner */}
      <View style={styles.valueCard}>
        <View style={styles.valueRow}>
          <Text style={styles.valueEmoji}>🚜</Text>
          <View style={styles.valueTextWrap}>
            <Text style={styles.valueTitle}>You Own The Farm. We Do The Work.</Text>
            <Text style={styles.valueBody}>
              No farming experience needed. A verified local farmer in Ibadan does the physical planting and weeding. You track every step from your phone.
            </Text>
          </View>
        </View>
      </View>

      {/* Step 1: Select Your Crop */}
      <View style={styles.section}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepNum}>STEP 1</Text>
          <Text style={styles.stepTitle}>What do you want to plant?</Text>
        </View>

        <View style={styles.cropList}>
          {CROPS.map((crop) => {
            const isSelected = selectedCrop.id === crop.id;
            return (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropCard, isSelected && styles.cropCardSelected]}
                onPress={() => setSelectedCrop(crop)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: crop.image }} style={styles.cropImg} />
                <View style={styles.cropDetails}>
                  <View style={styles.cropTitleRow}>
                    <Text style={styles.cropName}>
                      {crop.emoji} {crop.name}
                    </Text>
                    {isSelected && <CheckCircle2 size={20} color={Colors.primary} />}
                  </View>
                  <Text style={styles.cropDesc}>{crop.desc}</Text>
                  <View style={styles.cropStatsRow}>
                    <View style={styles.cropStatPill}>
                      <Calendar size={12} color={Colors.primary} />
                      <Text style={styles.cropStatText}>{crop.duration}</Text>
                    </View>
                    <View style={styles.cropStatPill}>
                      <Package size={12} color={Colors.primary} />
                      <Text style={styles.cropStatText}>{crop.yieldKg}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Step 2: Select Land & Local Farmer */}
      <View style={styles.section}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepNum}>STEP 2</Text>
          <Text style={styles.stepTitle}>Choose your farmland & farmer</Text>
        </View>

        <View style={styles.farmList}>
          {FARMS.map((farm) => {
            const isSelected = selectedFarm.id === farm.id;
            return (
              <TouchableOpacity
                key={farm.id}
                style={[styles.farmCard, isSelected && styles.farmCardSelected]}
                onPress={() => setSelectedFarm(farm)}
                activeOpacity={0.8}
              >
                <View style={styles.farmHeader}>
                  <View style={styles.farmLocWrap}>
                    <MapPin size={16} color={Colors.primary} />
                    <Text style={styles.farmName}>{farm.name}</Text>
                  </View>
                  {isSelected && <CheckCircle2 size={20} color={Colors.primary} />}
                </View>
                <Text style={styles.farmSoil}>{farm.soil}</Text>

                {/* Farmer Assignment Pill */}
                <View style={styles.farmerPill}>
                  <UserCheck size={16} color={Colors.primary} />
                  <View>
                    <Text style={styles.farmerName}>
                      Assigned Farmer: <Text style={{ fontWeight: '800' }}>{farm.farmerName}</Text>
                    </Text>
                    <Text style={styles.farmerExp}>{farm.farmerRole} • {farm.farmerExp}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Step 3: Simple & Transparent Math */}
      <View style={styles.section}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepNum}>STEP 3</Text>
          <Text style={styles.stepTitle}>See your simple farm math</Text>
        </View>

        <View style={styles.summaryCard}>
          {/* Plot Count Selector */}
          <View style={styles.plotsRow}>
            <View>
              <Text style={styles.plotsLabel}>Number of Farm Plots</Text>
              <Text style={styles.plotsSub}>1 Plot = ~1/4 Acre cultivation unit</Text>
            </View>
            <View style={styles.plotsControls}>
              <TouchableOpacity
                style={styles.plotBtn}
                onPress={() => setPlots(Math.max(1, plots - 1))}
              >
                <Text style={styles.plotBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.plotNum}>{plots}</Text>
              <TouchableOpacity
                style={styles.plotBtn}
                onPress={() => setPlots(plots + 1)}
              >
                <Text style={styles.plotBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transparent Cost Breakdown */}
          <View style={styles.costBox}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Total Cost to Plant & Manage</Text>
              <Text style={styles.costVal}>₦{totalCost.toLocaleString()}</Text>
            </View>
            <Text style={styles.costIncludes}>
              ✓ High-yield seeds ✓ Organic fertilizer ✓ Hired farmer daily labor & care ✓ River irrigation ✓ Farm insurance
            </Text>
          </View>

          {/* Expected Harvest Outcome */}
          <View style={styles.outcomeGrid}>
            <View style={styles.outcomeCol}>
              <Text style={styles.outcomeLabel}>Harvest Yield</Text>
              <Text style={styles.outcomeVal}>{plots * 200} kg</Text>
              <Text style={styles.outcomeSub}>Fresh {selectedCrop.name}</Text>
            </View>
            <View style={styles.outcomeDivider} />
            <View style={styles.outcomeCol}>
              <Text style={styles.outcomeLabel}>Market Value</Text>
              <Text style={styles.outcomeValGreen}>₦{totalValue.toLocaleString()}</Text>
              <Text style={styles.outcomeSub}>+38.5% Net Profit</Text>
            </View>
          </View>

          {/* Harvest Choice */}
          <View style={styles.choiceSection}>
            <Text style={styles.choiceTitle}>What should happen when your crop is harvested?</Text>
            
            <TouchableOpacity
              style={[styles.choiceCard, harvestChoice === 'deliver' && styles.choiceCardActive]}
              onPress={() => setHarvestChoice('deliver')}
            >
              <Truck size={20} color={harvestChoice === 'deliver' ? Colors.primary : Colors.text.muted} />
              <View style={styles.choiceTextWrap}>
                <Text style={styles.choiceName}>Deliver to my home in Ibadan</Text>
                <Text style={styles.choiceDesc}>We will harvest, pack, and bring fresh produce directly to your doorstep.</Text>
              </View>
              {harvestChoice === 'deliver' && <CheckCircle2 size={18} color={Colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceCard, harvestChoice === 'sell' && styles.choiceCardActive]}
              onPress={() => setHarvestChoice('sell')}
            >
              <TrendingUp size={20} color={harvestChoice === 'sell' ? Colors.primary : Colors.text.muted} />
              <View style={styles.choiceTextWrap}>
                <Text style={styles.choiceName}>Sell for profit on the marketplace</Text>
                <Text style={styles.choiceDesc}>We sell to city food buyers and transfer ₦{totalValue.toLocaleString()} to your bank account.</Text>
              </View>
              {harvestChoice === 'sell' && <CheckCircle2 size={18} color={Colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Plot Setup</Text>
          <Text style={styles.bottomTotalVal}>₦{totalCost.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleStartFarm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Hire Farmer & Start</Text>
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
  valueCard: {
    backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  valueRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  valueEmoji: {
    fontSize: 28,
  },
  valueTextWrap: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  valueBody: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  section: {
    gap: Spacing.sm,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: Colors.primary,
    color: Colors.text.inverse,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  cropList: {
    gap: Spacing.sm,
  },
  cropCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  cropCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#fbfdfb',
  },
  cropImg: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  cropDetails: {
    flex: 1,
    gap: 4,
  },
  cropTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  cropDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 15,
  },
  cropStatsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  cropStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  cropStatText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  farmList: {
    gap: Spacing.sm,
  },
  farmCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  farmCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#fbfdfb',
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmLocWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  farmSoil: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 22,
  },
  farmerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  farmerName: {
    fontSize: 12,
    color: Colors.text.primary,
  },
  farmerExp: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  plotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plotsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  plotsSub: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  plotsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  plotBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  plotNum: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  costBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  costVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  costIncludes: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  outcomeGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  outcomeCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  outcomeDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  outcomeLabel: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  outcomeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  outcomeValGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803d',
  },
  outcomeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  choiceSection: {
    gap: Spacing.xs,
  },
  choiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  choiceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  choiceTextWrap: {
    flex: 1,
  },
  choiceName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  choiceDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 15,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  bottomTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
});
