import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  ShoppingBag,
  Truck,
  Split,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';

export default function HarvestDecisionScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'delivery' | 'marketplace' | 'split'>('split');
  const [deliveryQty, setDeliveryQty] = useState(50);
  const totalActualYield = 215; // kg
  const marketplaceQty = totalActualYield - deliveryQty;

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const pricePerKg = 850;
  const platformCommissionRate = 0.1; // 10%

  const grossSales = marketplaceQty * pricePerKg;
  const commission = Math.round(grossSales * platformCommissionRate);
  const netSellerProceeds = grossSales - commission;

  const handleConfirm = () => {
    if ((selectedOption === 'delivery' || selectedOption === 'split') && !deliveryAddress) {
      Alert.alert('Delivery Address Required', 'Please enter your delivery destination in Ibadan.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Harvest Decision Recorded! 🎉',
        selectedOption === 'split'
          ? `50 kg allocated for Ibadan doorstep delivery. 165 kg listed on the marketplace (Est. Net Payout: ₦${netSellerProceeds.toLocaleString()}).`
          : selectedOption === 'marketplace'
          ? `Entire 215 kg listed on marketplace. Est. Net Proceeds: ₦${(totalActualYield * pricePerKg * 0.9).toLocaleString()}.`
          : `Entire 215 kg scheduled for delivery to ${deliveryAddress}.`,
        [
          { text: 'View Seller Wallet & Payouts', onPress: () => router.push('/seller-wallet') },
          { text: 'Return to Dashboard', onPress: () => router.replace('/(tabs)/cycles') },
        ]
      );
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Actual Harvest Results Card */}
      <View style={styles.resultsCard}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Harvest Verification Complete</Text>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.verifiedText}>Scale Verified</Text>
          </View>
        </View>

        <View style={styles.yieldStatsRow}>
          <View style={styles.yieldBox}>
            <Text style={styles.yieldBoxLabel}>Actual Harvested</Text>
            <Text style={styles.yieldBoxVal}>{totalActualYield} kg</Text>
            <Text style={styles.yieldBoxSub}>Original Est: 160–220 kg</Text>
          </View>
          <View style={styles.yieldBox}>
            <Text style={styles.yieldBoxLabel}>Quality Grade</Text>
            <Text style={styles.yieldBoxVal}>Grade A (190kg)</Text>
            <Text style={styles.yieldBoxSub}>Grade B: 25kg • Reject: 0kg</Text>
          </View>
        </View>
      </View>

      {/* 2. Choose Your Post-Harvest Path */}
      <Text style={styles.sectionHeading}>What would you like to do with your harvest?</Text>

      <View style={styles.optionsList}>
        {/* Option A: Split */}
        <TouchableOpacity
          style={[styles.optionCard, selectedOption === 'split' && styles.optionCardActive]}
          onPress={() => setSelectedOption('split')}
        >
          <View style={styles.optionTop}>
            <Split size={20} color={selectedOption === 'split' ? Colors.primary : Colors.text.secondary} />
            <Text style={styles.optionTitle}>Split Harvest (Eat Some, Sell Some)</Text>
          </View>
          <Text style={styles.optionDesc}>
            Take home fresh tomatoes for your household and list the surplus on the marketplace to recoup production costs.
          </Text>
        </TouchableOpacity>

        {/* Option B: Sell All */}
        <TouchableOpacity
          style={[styles.optionCard, selectedOption === 'marketplace' && styles.optionCardActive]}
          onPress={() => setSelectedOption('marketplace')}
        >
          <View style={styles.optionTop}>
            <ShoppingBag size={20} color={selectedOption === 'marketplace' ? Colors.primary : Colors.text.secondary} />
            <Text style={styles.optionTitle}>Sell Entire Harvest on Marketplace</Text>
          </View>
          <Text style={styles.optionDesc}>
            List all 215 kg for sale directly to urban buyers and restaurants at ₦850/kg.
          </Text>
        </TouchableOpacity>

        {/* Option C: Delivery All */}
        <TouchableOpacity
          style={[styles.optionCard, selectedOption === 'delivery' && styles.optionCardActive]}
          onPress={() => setSelectedOption('delivery')}
        >
          <View style={styles.optionTop}>
            <Truck size={20} color={selectedOption === 'delivery' ? Colors.primary : Colors.text.secondary} />
            <Text style={styles.optionTitle}>Deliver Everything to My Home</Text>
          </View>
          <Text style={styles.optionDesc}>
            Receive the entire 215 kg harvest at your doorstep in Ibadan.
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Dynamic Configuration Section based on Choice */}
      {selectedOption === 'split' && (
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Allocation Breakdown</Text>
          <View style={styles.allocationRow}>
            <View style={styles.allocBox}>
              <Text style={styles.allocLabel}>Doorstep Delivery</Text>
              <Text style={styles.allocVal}>{deliveryQty} kg</Text>
            </View>
            <View style={styles.allocBox}>
              <Text style={styles.allocLabel}>Marketplace Sale</Text>
              <Text style={styles.allocVal}>{marketplaceQty} kg</Text>
            </View>
          </View>

          <View style={styles.financialProjection}>
            <Text style={styles.finTitle}>Expected Marketplace Payout:</Text>
            <Text style={styles.finVal}>₦{netSellerProceeds.toLocaleString()}</Text>
            <Text style={styles.finSub}>
              ({marketplaceQty} kg @ ₦850/kg less 10% platform fee)
            </Text>
          </View>
        </View>
      )}

      {(selectedOption === 'delivery' || selectedOption === 'split') && (
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Delivery Details (Ibadan)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Destination address (e.g. Ring Road, Bodija, Jericho)"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholderTextColor={Colors.text.muted}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Recipient phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.text.muted}
          />
        </View>
      )}

      {/* 4. Confirm Button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.confirmBtnText}>
          {loading ? 'Recording Choice...' : 'Confirm Harvest Decision'}
        </Text>
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
  resultsCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  yieldStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  yieldBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 2,
  },
  yieldBoxLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  yieldBoxVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  yieldBoxSub: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  sectionHeading: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  optionsList: {
    gap: Spacing.sm,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  optionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  optionDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  configCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  configTitle: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  allocationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  allocBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: 2,
  },
  allocLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  allocVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  financialProjection: {
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  finTitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  finVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  finSub: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    ...Typography.body,
    color: Colors.text.primary,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  confirmBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
