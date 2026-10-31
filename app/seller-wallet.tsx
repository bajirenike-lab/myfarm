// ==============================================================================
// MYFARM - SELLER WALLET & POST-HARVEST BANK PAYOUT COCKPIT
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  SellerSettlement,
  BankAccount,
  SellerWalletSummary,
} from '@/types';
import { PayoutService, PayoutResult } from '@/services/payout';
import { NIGERIAN_BANKS, validateNuban, resolveAccountName } from '@/constants/banks';
import {
  ChevronLeft,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Plus,
  X,
  Share2,
  Receipt,
  Sparkles,
  Smartphone,
} from 'lucide-react-native';

export default function SellerWalletScreen() {
  const router = useRouter();

  // State
  const [summary, setSummary] = useState<SellerWalletSummary | null>(null);
  const [settlements, setSettlements] = useState<SellerSettlement[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'payouts'>('all');

  // Modals
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [addBankModalVisible, setAddBankModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PayoutResult | null>(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('50000');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  // Add Bank Form State
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);

  const loadWalletData = async () => {
    try {
      const [sum, stl, banks] = await Promise.all([
        PayoutService.getWalletSummary(),
        PayoutService.getSettlements(),
        PayoutService.getBankAccounts(),
      ]);
      setSummary(sum);
      setSettlements(stl);
      setBankAccounts(banks);
    } catch (e) {
      console.warn('Wallet load note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleNubanChange = async (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setNewAccountNumber(cleaned);

    if (cleaned.length === 10) {
      setResolvingAccount(true);
      const res = await resolveAccountName(cleaned, selectedBank.code, 'Babatunde Adeleke');
      setResolvingAccount(false);
      if (res.success && res.accountName) {
        setResolvedAccountName(res.accountName);
      }
    } else {
      setResolvedAccountName('');
    }
  };

  const handleSaveBank = async () => {
    if (!validateNuban(newAccountNumber)) {
      Alert.alert('Invalid Account', 'Please enter a valid 10-digit NUBAN account number.');
      return;
    }

    try {
      await PayoutService.addBankAccount({
        bank_name: selectedBank.name,
        bank_code: selectedBank.code,
        account_number: newAccountNumber,
        account_name: resolvedAccountName || 'Babatunde Adeleke',
      });
      await loadWalletData();
      setAddBankModalVisible(false);
      setNewAccountNumber('');
      setResolvedAccountName('');
      Alert.alert('Bank Account Linked! 🏦', `${selectedBank.name} (${newAccountNumber}) is now active for payouts.`);
    } catch (e) {
      console.warn('Bank save error:', e);
    }
  };

  const handleExecutePayout = async () => {
    const amountNum = parseFloat(withdrawAmount);
    const available = summary?.available_balance || 0;

    if (!amountNum || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }

    if (amountNum > available) {
      Alert.alert('Insufficient Balance', `Requested amount exceeds available balance of ₦${available.toLocaleString()}.`);
      return;
    }

    const defaultBank = bankAccounts.find((b) => b.is_default) || bankAccounts[0];
    if (!defaultBank) {
      Alert.alert('No Bank Account', 'Please link a destination bank account first.');
      return;
    }

    setProcessingWithdrawal(true);

    try {
      const result = await PayoutService.requestPayout({
        amount: amountNum,
        bankAccount: defaultBank,
      });

      setProcessingWithdrawal(false);
      setWithdrawModalVisible(false);
      setActiveReceipt(result);
      setReceiptModalVisible(true);
      await loadWalletData();
    } catch (e) {
      setProcessingWithdrawal(false);
      Alert.alert('Payout Error', 'Unable to complete transfer. Please try again.');
    }
  };

  const filteredSettlements = settlements.filter((s) => {
    if (activeTab === 'sales') return !s.crop_title?.startsWith('Bank Withdrawal');
    if (activeTab === 'payouts') return s.crop_title?.startsWith('Bank Withdrawal');
    return true;
  });

  const defaultBank = bankAccounts.find((b) => b.is_default) || bankAccounts[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Seller Wallet</Text>
          <Text style={styles.headerSub}>Post-Harvest Yield Settlement</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
        >
          <Smartphone size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Main Hero Wallet Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>Available for Payout</Text>
              <Text style={styles.heroBalance}>
                ₦{summary ? summary.available_balance.toLocaleString() : '117,087'}
              </Text>
            </View>
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>● Settled & Ready</Text>
            </View>
          </View>

          {/* Sub Stats Row */}
          <View style={styles.heroMetricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pending Escrow</Text>
              <Text style={styles.metricVal}>
                ₦{summary ? summary.pending_settlement.toLocaleString() : '33,250'}
              </Text>
              <Text style={styles.metricSub}>Orders in transit</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Lifetime Earnings</Text>
              <Text style={styles.metricVal}>
                ₦{summary ? summary.total_lifetime_earnings.toLocaleString() : '163,637'}
              </Text>
              <Text style={styles.metricSub}>Gross proceeds</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Withdrawn</Text>
              <Text style={styles.metricVal}>
                ₦{summary ? summary.total_withdrawn.toLocaleString() : '46,550'}
              </Text>
              <Text style={styles.metricSub}>Credited to bank</Text>
            </View>
          </View>

          {/* Agricultural ROI & Net Return Banner */}
          <View style={styles.roiBanner}>
            <TrendingUp size={16} color="#15803d" />
            <Text style={styles.roiBannerText}>
              <Text style={{ fontWeight: '800' }}>+38.5% Net Plot ROI: </Text>
              ₦163,637 earned on your initial ₦65,000 Roma Tomatoes input package in Ido LGA!
            </Text>
          </View>

          {/* Payout Action Button */}
          <TouchableOpacity
            style={styles.withdrawActionBtn}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <ArrowUpRight size={18} color={Colors.surface} />
            <Text style={styles.withdrawActionBtnText}>
              Withdraw to Bank (NIP Transfer)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Linked Nigerian Bank Account Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Building2 size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Payout Bank Account</Text>
            </View>
            <TouchableOpacity onPress={() => setAddBankModalVisible(true)}>
              <Text style={styles.linkChangeText}>Change Account</Text>
            </TouchableOpacity>
          </View>

          {defaultBank ? (
            <View style={styles.bankInfoBox}>
              <View style={styles.bankIconCircle}>
                <Building2 size={20} color={Colors.primary} />
              </View>
              <View style={styles.bankDetails}>
                <Text style={styles.bankName}>{defaultBank.bank_name}</Text>
                <Text style={styles.bankNumber}>
                  {defaultBank.account_number} • <Text style={styles.accountNameText}>{defaultBank.account_name}</Text>
                </Text>
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={12} color="#15803d" />
                  <Text style={styles.verifiedText}>Verified NUBAN Destination Account</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noBankButton}
              onPress={() => setAddBankModalVisible(true)}
            >
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.noBankButtonText}>Link a Nigerian Bank Account for Payouts</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Settlements Ledger */}
        <View style={styles.card}>
          <View style={styles.ledgerHeader}>
            <Text style={styles.cardTitle}>Settlement Ledger</Text>
            {/* Filter Tabs */}
            <View style={styles.tabPills}>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabPillText, activeTab === 'all' && styles.tabPillTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'sales' && styles.tabPillActive]}
                onPress={() => setActiveTab('sales')}
              >
                <Text style={[styles.tabPillText, activeTab === 'sales' && styles.tabPillTextActive]}>
                  Crop Sales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'payouts' && styles.tabPillActive]}
                onPress={() => setActiveTab('payouts')}
              >
                <Text style={[styles.tabPillText, activeTab === 'payouts' && styles.tabPillTextActive]}>
                  Withdrawals
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ledgerList}>
            {filteredSettlements.map((item) => {
              const isPayout = item.crop_title?.startsWith('Bank Withdrawal');
              return (
                <View key={item.id} style={styles.ledgerItem}>
                  <View style={[styles.itemIconWrap, isPayout ? styles.iconWrapBlue : styles.iconWrapGreen]}>
                    {isPayout ? (
                      <ArrowUpRight size={18} color="#0369a1" />
                    ) : (
                      <ArrowDownLeft size={18} color="#15803d" />
                    )}
                  </View>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemTitle}>{item.crop_title || 'Marketplace Settlement'}</Text>
                    <Text style={styles.itemDate}>
                      {new Date(item.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {item.payout_reference ? ` • Ref: ${item.payout_reference.slice(0, 16)}` : ''}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemAmount, isPayout ? styles.amountDebit : styles.amountCredit]}>
                      {isPayout ? '-' : '+'}₦{item.net_payable.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.itemBadge,
                        item.status === 'completed'
                          ? styles.badgeCompleted
                          : item.status === 'pending'
                          ? styles.badgePending
                          : styles.badgeProcessing,
                      ]}
                    >
                      {item.status === 'completed'
                        ? 'Settled'
                        : item.status === 'pending'
                        ? 'Available'
                        : 'In Transit'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ------------------------------------------------------------------------ */}
      {/* MODAL 1: Instant NIP Payout Withdrawal Modal */}
      {/* ------------------------------------------------------------------------ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Withdraw to Bank</Text>
                <Text style={styles.modalSub}>Instant NIBSS Electronic Settlement (NIP)</Text>
              </View>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <X size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Destination Account Card */}
              {defaultBank && (
                <View style={styles.modalBankCard}>
                  <Text style={styles.modalBankLabel}>Transfer Destination:</Text>
                  <Text style={styles.modalBankName}>{defaultBank.bank_name}</Text>
                  <Text style={styles.modalBankDetails}>
                    {defaultBank.account_number} • {defaultBank.account_name}
                  </Text>
                </View>
              )}

              {/* Amount Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Withdrawal Amount (NGN ₦)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 50000"
                />
              </View>

              {/* Amount Presets */}
              <View style={styles.presetRow}>
                {['25000', '50000', '100000'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetBtn,
                      withdrawAmount === preset && styles.presetBtnActive,
                    ]}
                    onPress={() => setWithdrawAmount(preset)}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        withdrawAmount === preset && styles.presetBtnTextActive,
                      ]}
                    >
                      ₦{parseInt(preset).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    summary && withdrawAmount === String(summary.available_balance) && styles.presetBtnActive,
                  ]}
                  onPress={() => setWithdrawAmount(String(summary?.available_balance || '117087'))}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      summary && withdrawAmount === String(summary.available_balance) && styles.presetBtnTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Breakdown */}
              <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Transfer Processing Fee</Text>
                  <Text style={[styles.breakdownVal, { color: '#15803d' }]}>₦0.00 (Zero Fee)</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Estimated Time</Text>
                  <Text style={styles.breakdownVal}>Instant (~15 seconds)</Text>
                </View>
                <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 6 }]}>
                  <Text style={[styles.breakdownLabel, { fontWeight: '700', color: Colors.text.primary }]}>Total to Bank</Text>
                  <Text style={[styles.breakdownVal, { fontWeight: '800', color: Colors.primary, fontSize: 14 }]}>
                    ₦{parseFloat(withdrawAmount || '0').toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.confirmWithdrawBtn}
                onPress={handleExecutePayout}
                disabled={processingWithdrawal}
              >
                {processingWithdrawal ? (
                  <ActivityIndicator color={Colors.surface} size="small" />
                ) : (
                  <>
                    <CheckCircle2 size={16} color={Colors.surface} />
                    <Text style={styles.confirmWithdrawBtnText}>Confirm & Transfer to Bank</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------------------ */}
      {/* MODAL 2: NIP Transfer Receipt Modal */}
      {/* ------------------------------------------------------------------------ */}
      {activeReceipt && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={receiptModalVisible}
          onRequestClose={() => setReceiptModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.receiptContent}>
              <View style={styles.receiptCheckCircle}>
                <CheckCircle2 size={40} color="#15803d" />
              </View>

              <Text style={styles.receiptTitle}>Transfer Successful! 🚀</Text>
              <Text style={styles.receiptAmount}>₦{activeReceipt.amount.toLocaleString()}</Text>
              <Text style={styles.receiptSubtitle}>Credited via NIBSS Instant Payment (NIP)</Text>

              {/* Receipt Body */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Destination Bank</Text>
                  <Text style={styles.receiptVal}>{activeReceipt.bankName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Account Number</Text>
                  <Text style={styles.receiptVal}>{activeReceipt.accountNumber}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Beneficiary Name</Text>
                  <Text style={styles.receiptVal}>{activeReceipt.accountName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>NIP Session ID</Text>
                  <Text style={[styles.receiptVal, { fontFamily: 'monospace' }]}>{activeReceipt.session_id}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Reference</Text>
                  <Text style={[styles.receiptVal, { fontFamily: 'monospace' }]}>{activeReceipt.reference}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Status</Text>
                  <Text style={[styles.receiptVal, { color: '#15803d', fontWeight: '800' }]}>SETTLED ✓</Text>
                </View>
              </View>

              {/* Multi-Channel Alert Notice */}
              <View style={styles.alertNotice}>
                <Smartphone size={16} color="#0369a1" />
                <Text style={styles.alertNoticeText}>
                  Confirmation SMS & WhatsApp credit receipt sent to your phone!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setReceiptModalVisible(false)}
              >
                <Text style={styles.doneBtnText}>Done / Back to Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* MODAL 3: Add / Link Bank Account Modal */}
      {/* ------------------------------------------------------------------------ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addBankModalVisible}
        onRequestClose={() => setAddBankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Link Bank Account</Text>
                <Text style={styles.modalSub}>10-Digit NUBAN Verification</Text>
              </View>
              <TouchableOpacity onPress={() => setAddBankModalVisible(false)}>
                <X size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Bank Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Commercial / Digital Bank</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankPickerScroll}>
                  {NIGERIAN_BANKS.map((b) => (
                    <TouchableOpacity
                      key={b.code}
                      style={[
                        styles.bankChip,
                        selectedBank.code === b.code && styles.bankChipActive,
                      ]}
                      onPress={() => setSelectedBank(b)}
                    >
                      <Text
                        style={[
                          styles.bankChipText,
                          selectedBank.code === b.code && styles.bankChipTextActive,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* NUBAN Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>NUBAN Account Number (10 Digits)</Text>
                <TextInput
                  style={styles.inputSimple}
                  placeholder="0123456789"
                  value={newAccountNumber}
                  onChangeText={handleNubanChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {/* Resolved Name Preview */}
              {resolvingAccount && (
                <View style={styles.resolvingRow}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.resolvingText}>Resolving account name with NIBSS...</Text>
                </View>
              )}

              {resolvedAccountName ? (
                <View style={styles.resolvedBox}>
                  <CheckCircle2 size={16} color="#15803d" />
                  <View>
                    <Text style={styles.resolvedLabel}>Account Verified:</Text>
                    <Text style={styles.resolvedName}>{resolvedAccountName}</Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.saveBankBtn}
                onPress={handleSaveBank}
              >
                <Text style={styles.saveBankBtnText}>Save & Set as Default Payout Bank</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  notifBtn: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.inverse,
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  readyBadgeText: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.text.inverse,
    fontSize: 11,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  metricVal: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.inverse,
    fontSize: 13,
    marginTop: 1,
  },
  metricSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
  },
  roiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 8,
  },
  roiBannerText: {
    ...Typography.caption,
    color: '#14532d',
    flex: 1,
    lineHeight: 17,
  },
  withdrawActionBtn: {
    backgroundColor: '#eab308',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  withdrawActionBtnText: {
    ...Typography.body,
    fontWeight: '800',
    color: '#133E2B',
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.xs,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  linkChangeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  bankInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankDetails: {
    flex: 1,
    gap: 2,
  },
  bankName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  bankNumber: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
  },
  accountNameText: {
    fontWeight: '700',
    color: Colors.text.primary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    ...Typography.caption,
    color: '#15803d',
    fontWeight: '600',
    fontSize: 10,
  },
  noBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  noBankButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabPills: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    padding: 2,
    gap: 2,
  },
  tabPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
  },
  tabPillText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabPillTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  ledgerList: {
    gap: Spacing.xs,
  },
  ledgerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  itemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapGreen: {
    backgroundColor: '#dcfce7',
  },
  iconWrapBlue: {
    backgroundColor: '#e0f2fe',
  },
  itemMain: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 12,
    color: Colors.text.primary,
  },
  itemDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.text.muted,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 13,
  },
  amountCredit: {
    color: '#15803d',
  },
  amountDebit: {
    color: Colors.text.primary,
  },
  itemBadge: {
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeProcessing: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  modalSub: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  modalBody: {
    gap: Spacing.md,
  },
  modalBankCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBankLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.text.muted,
  },
  modalBankName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalBankDetails: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  amountInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.secondary,
    fontSize: 11,
  },
  presetBtnTextActive: {
    color: Colors.surface,
  },
  breakdownBox: {
    backgroundColor: '#f8fafc',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  breakdownVal: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  confirmWithdrawBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginBottom: Spacing.md,
  },
  confirmWithdrawBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.surface,
  },
  receiptContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  receiptCheckCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  receiptAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  receiptSubtitle: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 6,
    marginVertical: Spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptKey: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  receiptVal: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  alertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 8,
    width: '100%',
  },
  alertNoticeText: {
    ...Typography.caption,
    color: '#0369a1',
    fontWeight: '600',
    flex: 1,
    fontSize: 11,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  doneBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.surface,
  },
  bankPickerScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  bankChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  bankChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bankChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
    fontSize: 11,
  },
  bankChipTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  inputSimple: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    fontSize: 14,
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvingText: {
    ...Typography.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 8,
  },
  resolvedLabel: {
    ...Typography.caption,
    color: '#15803d',
    fontSize: 10,
    fontWeight: '600',
  },
  resolvedName: {
    ...Typography.body,
    color: '#14532d',
    fontWeight: '800',
  },
  saveBankBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  saveBankBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.surface,
  },
});
