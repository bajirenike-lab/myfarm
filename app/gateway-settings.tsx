// ==============================================================================
// MYFARM - PRODUCTION GATEWAY & API CONFIGURATION (TERMII & PAYSTACK)
// ==============================================================================

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
import { NotificationService } from '@/services/notification';
import { PaystackPaymentProvider } from '@/services/payment';
import {
  ChevronLeft,
  Smartphone,
  CreditCard,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Copy,
  Key,
} from 'lucide-react-native';

export default function GatewaySettingsScreen() {
  const router = useRouter();

  // Termii SMS State
  const [termiiApiKey, setTermiiApiKey] = useState(
    process.env.EXPO_PUBLIC_TERMII_API_KEY || ''
  );
  const [termiiSenderId, setTermiiSenderId] = useState(
    process.env.EXPO_PUBLIC_TERMII_SENDER_ID || 'MyFarm'
  );
  const [termiiChannel, setTermiiChannel] = useState<'generic' | 'dnd'>('generic');
  const [testPhoneNumber, setTestPhoneNumber] = useState('0802 345 6789');
  const [testSmsMessage, setTestSmsMessage] = useState(
    '[MyFarm] Live Termii verification alert! Your agricultural notification pipeline for Ibadan farm plots is connected.'
  );
  const [sendingSms, setSendingSms] = useState(false);
  const [smsResult, setSmsResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
  } | null>(null);

  // Paystack State
  const [paymentMode, setPaymentMode] = useState<'mock' | 'paystack'>(
    (process.env.EXPO_PUBLIC_PAYMENT_MODE as any) || 'mock'
  );
  const [paystackKey, setPaystackKey] = useState(
    process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
  );
  const [paystackValidation, setPaystackValidation] = useState<{
    valid: boolean;
    mode: 'test' | 'live' | 'invalid';
    message: string;
  }>(PaystackPaymentProvider.validateKey(process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || ''));

  const handlePaystackKeyChange = (text: string) => {
    setPaystackKey(text);
    setPaystackValidation(PaystackPaymentProvider.validateKey(text));
  };

  const handleSendTestSms = async () => {
    if (!testPhoneNumber.trim()) {
      Alert.alert('Phone Required', 'Please enter a Nigerian mobile number to receive the test SMS.');
      return;
    }

    if (!termiiApiKey.trim()) {
      Alert.alert(
        'Termii API Key Required',
        'Please enter your Termii API key to dispatch a live carrier SMS, or leave blank to test in Sandbox Mock mode.'
      );
      // Run mock test
      setSendingSms(true);
      setTimeout(() => {
        setSendingSms(false);
        setSmsResult({
          success: true,
          message: 'Simulated SMS dispatched via Mock Gateway (Zero Carrier Charge). To send real SMS, enter your live Termii API key.',
          messageId: `MOCK-${Date.now()}`,
        });
      }, 800);
      return;
    }

    setSendingSms(true);
    setSmsResult(null);

    try {
      const res = await NotificationService.testLiveTermiiSms({
        targetPhone: testPhoneNumber,
        apiKey: termiiApiKey.trim(),
        senderId: termiiSenderId.trim() || 'MyFarm',
        channel: termiiChannel,
        message: testSmsMessage,
      });

      setSendingSms(false);

      if (res.success) {
        setSmsResult({
          success: true,
          message: 'SMS successfully sent to carrier network via Termii!',
          messageId: res.data?.message_id || res.data?.messageId,
        });
        Alert.alert('SMS Sent Successfully! 🚀', `Termii has dispatched the message to ${testPhoneNumber}. Check your phone!`);
      } else {
        setSmsResult({
          success: false,
          message: res.error || 'Termii error. Check your API key and account balance.',
        });
        Alert.alert('Termii Dispatch Failed', res.error || 'Please verify your Termii balance and sender ID.');
      }
    } catch (e: any) {
      setSendingSms(false);
      setSmsResult({
        success: false,
        message: e.message || 'Network error connecting to Termii.',
      });
    }
  };

  const handleCopyEnvBlock = () => {
    Alert.alert(
      'Environment Variables',
      `EXPO_PUBLIC_TERMII_API_KEY="${termiiApiKey}"\nEXPO_PUBLIC_TERMII_SENDER_ID="${termiiSenderId}"\nEXPO_PUBLIC_PAYMENT_MODE="${paymentMode}"\nEXPO_PUBLIC_PAYSTACK_PUBLIC_KEY="${paystackKey}"`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>API Gateway Setup</Text>
          <Text style={styles.headerSub}>Live Termii SMS & Paystack Setup</Text>
        </View>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveIndicatorText}>
            {paymentMode === 'paystack' && termiiApiKey ? '● Live Mode' : '○ Sandbox'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Section 1: Termii SMS Gateway */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Smartphone size={20} color="#0369a1" />
              <div>
                <Text style={styles.cardTitle}>Termii Nigerian Carrier SMS</Text>
                <Text style={styles.cardSub}>Direct SMS routes to MTN, Airtel, Glo & 9mobile</Text>
              </div>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://dashboard.termii.com')}
              style={styles.externalLinkBtn}
            >
              <Text style={styles.externalLinkText}>Termii Portal</Text>
              <ExternalLink size={12} color="#0369a1" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Termii API Key</Text>
            <View style={styles.inputWrap}>
              <Key size={16} color={Colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="Enter Termii API key (e.g. TLxxxxxxxxxxxx)"
                value={termiiApiKey}
                onChangeText={setTermiiApiKey}
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Sender ID</Text>
              <TextInput
                style={styles.inputSimple}
                placeholder="MyFarm (or Termii)"
                value={termiiSenderId}
                onChangeText={setTermiiSenderId}
              />
              <Text style={styles.helperText}>Use "Termii" if custom ID is not yet registered</Text>
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Routing Channel</Text>
              <View style={styles.channelPicker}>
                <TouchableOpacity
                  style={[styles.channelOption, termiiChannel === 'generic' && styles.channelOptionActive]}
                  onPress={() => setTermiiChannel('generic')}
                >
                  <Text style={[styles.channelOptionText, termiiChannel === 'generic' && styles.channelOptionTextActive]}>
                    Generic
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.channelOption, termiiChannel === 'dnd' && styles.channelOptionActive]}
                  onPress={() => setTermiiChannel('dnd')}
                >
                  <Text style={[styles.channelOptionText, termiiChannel === 'dnd' && styles.channelOptionTextActive]}>
                    DND Bypass
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>DND bypass delivers even to DND-active SIMs</Text>
            </View>
          </View>

          {/* Live SMS Tester */}
          <View style={styles.testerBox}>
            <Text style={styles.testerTitle}>📲 Live SMS Dispatch Tester</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Recipient Mobile Number</Text>
              <TextInput
                style={styles.inputSimple}
                placeholder="e.g. 08023456789 or +2348023456789"
                value={testPhoneNumber}
                onChangeText={setTestPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SMS Body</Text>
              <TextInput
                style={[styles.inputSimple, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={testSmsMessage}
                onChangeText={setTestSmsMessage}
              />
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendTestSms}
              disabled={sendingSms}
            >
              {sendingSms ? (
                <ActivityIndicator color={Colors.surface} size="small" />
              ) : (
                <>
                  <Send size={16} color={Colors.surface} />
                  <Text style={styles.sendButtonText}>Send Live Test SMS to My Phone</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test Result Box */}
            {smsResult && (
              <View
                style={[
                  styles.resultBox,
                  smsResult.success ? styles.resultBoxSuccess : styles.resultBoxError,
                ]}
              >
                <View style={styles.resultHeader}>
                  {smsResult.success ? (
                    <CheckCircle2 size={16} color="#15803d" />
                  ) : (
                    <AlertCircle size={16} color="#b91c1c" />
                  )}
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: smsResult.success ? '#15803d' : '#b91c1c' },
                    ]}
                  >
                    {smsResult.success ? 'Termii Dispatch Successful' : 'Dispatch Failed'}
                  </Text>
                </View>
                <Text style={styles.resultDesc}>{smsResult.message}</Text>
                {smsResult.messageId && (
                  <Text style={styles.resultMeta}>Message ID: {smsResult.messageId}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Section 2: Paystack Gateway Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <CreditCard size={20} color={Colors.primary} />
              <div>
                <Text style={styles.cardTitle}>Paystack Payment Gateway</Text>
                <Text style={styles.cardSub}>Process plot funding and marketplace checkout in NGN</Text>
              </div>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://dashboard.paystack.com/#/settings/developer')}
              style={styles.externalLinkBtn}
            >
              <Text style={styles.externalLinkText}>Paystack Keys</Text>
              <ExternalLink size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeRow}>
            <Text style={styles.label}>Active Payment Provider:</Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, paymentMode === 'mock' && styles.modeBtnActive]}
                onPress={() => setPaymentMode('mock')}
              >
                <Text style={[styles.modeBtnText, paymentMode === 'mock' && styles.modeBtnTextActive]}>
                  Mock Sandbox
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, paymentMode === 'paystack' && styles.modeBtnActive]}
                onPress={() => setPaymentMode('paystack')}
              >
                <Text style={[styles.modeBtnText, paymentMode === 'paystack' && styles.modeBtnTextActive]}>
                  Paystack Live / Test
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Paystack Public Key Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Paystack Public Key (pk_test_... or pk_live_...)</Text>
            <View style={styles.inputWrap}>
              <Key size={16} color={Colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={paystackKey}
                onChangeText={handlePaystackKeyChange}
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="none"
              />
            </View>

            {/* Validation Indicator */}
            {paystackKey.length > 0 && (
              <View style={styles.validationRow}>
                {paystackValidation.valid ? (
                  <CheckCircle2 size={14} color="#15803d" />
                ) : (
                  <AlertCircle size={14} color="#b91c1c" />
                )}
                <Text
                  style={[
                    styles.validationText,
                    { color: paystackValidation.valid ? '#15803d' : '#b91c1c' },
                  ]}
                >
                  {paystackValidation.message}
                </Text>
              </View>
            )}
          </View>

          {/* Paystack Test Cards Reference */}
          <View style={styles.testCardBox}>
            <Text style={styles.testCardTitle}>💳 Paystack Test Card Reference</Text>
            <View style={styles.cardInfoGrid}>
              <View style={styles.cardInfoItem}>
                <Text style={styles.cardInfoLabel}>Card Number</Text>
                <Text style={styles.cardInfoVal}>4084 0840 8408 4084</Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Text style={styles.cardInfoLabel}>Expiry / CVV</Text>
                <Text style={styles.cardInfoVal}>12/28 • 408</Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Text style={styles.cardInfoLabel}>PIN / OTP</Text>
                <Text style={styles.cardInfoVal}>1111 • 123456</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Copy Environment Block */}
        <TouchableOpacity style={styles.exportCard} onPress={handleCopyEnvBlock}>
          <Copy size={18} color={Colors.primary} />
          <View style={styles.exportContent}>
            <Text style={styles.exportTitle}>Inspect Current .env Configuration</Text>
            <Text style={styles.exportDesc}>
              Tap to view environment variable definitions for deployment to Netlify or production servers.
            </Text>
          </View>
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
  liveIndicator: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveIndicatorText: {
    ...Typography.caption,
    fontWeight: '800',
    color: '#15803d',
    fontSize: 10,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
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
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  cardTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  cardSub: {
    ...Typography.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  externalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  externalLinkText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
    fontSize: 10,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    ...Typography.body,
    fontSize: 13,
    color: Colors.text.primary,
  },
  inputSimple: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    ...Typography.body,
    fontSize: 13,
    color: Colors.text.primary,
  },
  helperText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.text.muted,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  channelPicker: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  channelOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  channelOptionActive: {
    backgroundColor: Colors.primary,
  },
  channelOptionText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
    fontSize: 11,
  },
  channelOptionTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  testerBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  testerTitle: {
    ...Typography.caption,
    fontWeight: '800',
    color: '#15803d',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#15803d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginTop: Spacing.xs,
  },
  sendButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.surface,
  },
  resultBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    gap: 2,
    marginTop: 6,
  },
  resultBoxSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  resultBoxError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: {
    ...Typography.caption,
    fontWeight: '800',
    fontSize: 12,
  },
  resultDesc: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontSize: 11,
  },
  resultMeta: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },
  modeRow: {
    gap: 6,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  modeBtnTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  validationText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  testCardBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  testCardTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
    fontSize: 11,
  },
  cardInfoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardInfoItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardInfoLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cardInfoVal: {
    ...Typography.caption,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.text.primary,
    fontSize: 10,
  },
  exportCard: {
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primary,
  },
  exportDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
