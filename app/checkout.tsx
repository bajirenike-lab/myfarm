import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { paymentGateway } from '@/services/payment';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  Lock,
  ArrowRight,
  Sprout,
  Calendar,
  Layers,
} from 'lucide-react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cropName?: string;
    plotSize?: string;
    totalCost?: string;
    yieldMin?: string;
    yieldMax?: string;
    days?: string;
  }>();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const cropName = params.cropName || 'Roma Tomato (F1 Hybrid)';
  const plotSize = params.plotSize || '50';
  const totalCost = Number(params.totalCost || 65000);
  const yieldMin = params.yieldMin || '160';
  const yieldMax = params.yieldMax || '220';
  const days = params.days || '75';

  const handlePay = async () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Terms Required',
        'Please review and agree to the Agricultural Production Terms before proceeding.'
      );
      return;
    }

    setLoading(true);
    const orderId = `ord-${Date.now()}`;
    const orderCode = `CYC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await paymentGateway.processPayment({
      userId: 'usr-demo-participant',
      orderId,
      orderCode,
      amount: totalCost,
      purpose: 'production_order',
      customerEmail: 'b.adeleke@gmail.com',
      customerName: 'Babatunde Adeleke',
    });

    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Farm Cycle Activated! 🌱',
        `Payment of ₦${totalCost.toLocaleString()} confirmed (Ref: ${res.reference}). Your plot is being assigned at Ido Agro Farm!`,
        [
          {
            text: 'View Farm Timeline',
            onPress: () => router.replace(`/cycle/${orderId}`),
          },
        ]
      );
    } else {
      Alert.alert('Payment Notice', res.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Summary</Text>
        <Text style={styles.subtitle}>
          Review your crop production package before funding cultivation.
        </Text>
      </View>

      {/* Package Specs Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Sprout size={22} color={Colors.primary} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.cropTitle}>{cropName}</Text>
            <Text style={styles.farmSub}>Ido Agro Precision Farm • Ido LGA</Text>
          </View>
        </View>

        <View style={styles.specGrid}>
          <View style={styles.specBox}>
            <Layers size={16} color={Colors.text.muted} />
            <Text style={styles.specLabel}>Plot Size</Text>
            <Text style={styles.specVal}>{plotSize} sqm</Text>
          </View>
          <View style={styles.specBox}>
            <Calendar size={16} color={Colors.text.muted} />
            <Text style={styles.specLabel}>Duration</Text>
            <Text style={styles.specVal}>{days} Days</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.specLabel}>Est. Yield</Text>
            <Text style={styles.specVal}>
              {yieldMin}–{yieldMax} kg
            </Text>
          </View>
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Financial Commitment</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Production Inputs & Labor</Text>
          <Text style={styles.rowVal}>
            ₦{Math.round(totalCost * 0.88).toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Platform Monitoring & Verification</Text>
          <Text style={styles.rowVal}>
            ₦{Math.round(totalCost * 0.12).toLocaleString()}
          </Text>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalVal}>₦{totalCost.toLocaleString()}</Text>
        </View>

        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>
            🔒 TEST SANDBOX ENVIRONMENT • ZERO LIVE CHARGE
          </Text>
        </View>
      </View>

      {/* Terms Agreement */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
      >
        {agreedToTerms ? (
          <CheckSquare size={22} color={Colors.primary} />
        ) : (
          <Square size={22} color={Colors.text.muted} />
        )}
        <Text style={styles.termsText}>
          I understand that agricultural production involves nature. Yields and
          harvest windows are estimates. I agree to the MyFarm Production Terms.
        </Text>
      </TouchableOpacity>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.payButton, !agreedToTerms && styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={loading || !agreedToTerms}
      >
        {loading ? (
          <ActivityIndicator color={Colors.text.inverse} />
        ) : (
          <>
            <Lock size={18} color={Colors.text.inverse} />
            <Text style={styles.payButtonText}>
              Fund Cycle • ₦{totalCost.toLocaleString()}
            </Text>
            <ArrowRight size={18} color={Colors.text.inverse} />
          </>
        )}
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
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
  },
  cropTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  farmSub: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  specGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  specBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: 2,
  },
  specLabel: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  cardSectionTitle: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  rowVal: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  totalLabel: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  totalVal: {
    ...Typography.heading2,
    color: Colors.primary,
  },
  modeBadge: {
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  termsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  payButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
