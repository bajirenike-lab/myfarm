import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  ChevronLeft,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Package,
  ShoppingBag,
  ShieldCheck,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Send,
} from 'lucide-react-native';
import { NotificationService } from '@/services/notification';

interface TrackingStep {
  title: string;
  desc: string;
  time: string;
  status: 'completed' | 'active' | 'upcoming';
}

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    orderCode?: string;
    address?: string;
    zoneName?: string;
    totalAmount?: string;
  }>();

  const orderCode = params.orderCode || 'MYF-MKT-2026-0891';
  const destination = params.address || 'Plot 14, Oluyole Estate, Ring Road, Ibadan';
  const zoneName = params.zoneName || 'Ring Road / Oluyole Estate (Zone 3)';
  const totalAmount = params.totalAmount || '8,500';
  const recipientPhone = (params as any).recipientPhone || '0802 345 6789';
  const itemsSummary = (params as any).itemsSummary || '5kg Roma Tomatoes, 2kg Habanero Pepper';

  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [activeChannelTab, setActiveChannelTab] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [alertDispatched, setAlertDispatched] = useState(false);

  const steps: TrackingStep[] = [
    {
      title: 'Harvest Inspected & Crated',
      desc: 'Quality checked and weighed at Ido Agro Precision Farm hub.',
      time: 'Today, 08:30 AM',
      status: activeStepIndex >= 0 ? (activeStepIndex === 0 ? 'active' : 'completed') : 'upcoming',
    },
    {
      title: 'Assigned to Dispatch Rider',
      desc: 'Dispatched to Kehinde Alao (Motorcycle #OYO-291-LU).',
      time: 'Today, 09:15 AM',
      status: activeStepIndex >= 1 ? (activeStepIndex === 1 ? 'active' : 'completed') : 'upcoming',
    },
    {
      title: 'Out for Doorstep Delivery',
      desc: 'Rider is in transit toward your destination neighborhood.',
      time: 'Estimated 35 mins',
      status: activeStepIndex >= 2 ? (activeStepIndex === 2 ? 'active' : 'completed') : 'upcoming',
    },
    {
      title: 'Delivered to Doorstep',
      desc: 'Handover completed and freshness verified by recipient.',
      time: 'Pending Handover',
      status: activeStepIndex >= 3 ? 'completed' : 'upcoming',
    },
  ];

  const handleCallRider = () => {
    Linking.openURL('tel:+2348023456789').catch(() => {
      Alert.alert('Rider Phone', '+234 802 345 6789 (Kehinde Alao — Dispatch Rider)');
    });
  };

  const handleOpenDirectWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Kehinde, I am following up on MyFarm delivery ${orderCode} to ${destination}.`
    );
    Linking.openURL(`https://wa.me/2348023456789?text=${text}`).catch(() => {
      Alert.alert('WhatsApp', 'Unable to open WhatsApp automatically.');
    });
  };

  const handleTriggerRiderAlert = async () => {
    try {
      await NotificationService.sendRiderDispatchedNotification({
        orderCode,
        recipientName: 'Babatunde Adeleke',
        recipientPhone,
        riderName: 'Kehinde Alao',
        riderPhone: '+234 802 345 6789',
        vehiclePlate: 'OYO-291-LU',
        destination,
        etaMinutes: 35,
      });

      setAlertDispatched(true);
      setActiveStepIndex(2);
      Alert.alert(
        'Alert Dispatched Successfully!',
        `Automated SMS and WhatsApp messages have been sent to ${recipientPhone} with live tracking details.`
      );
    } catch (e) {
      console.warn('Dispatch notification error:', e);
    }
  };

  const handleSimulateNext = () => {
    if (activeStepIndex < 3) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      Alert.alert('Delivery Completed', 'This order has already been delivered to your doorstep!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>{orderCode}</Text>
        </View>
        <View style={styles.livePill}>
          <Text style={styles.livePillText}>● En Route</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.truckCircle}>
              <Truck size={28} color={Colors.primary} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Estimated Arrival</Text>
              <Text style={styles.heroTime}>Within 45 Minutes</Text>
              <Text style={styles.heroSub}>{zoneName}</Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.destinationBox}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.destinationText}>{destination}</Text>
          </View>
        </View>

        {/* Dispatch Rider Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <Text style={styles.riderInitials}>KA</Text>
          </View>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>Kehinde Alao</Text>
            <Text style={styles.riderVehicle}>TVS HLX 150 (OYO-291-LU) • Ibadan Hub</Text>
            <View style={styles.ratingRow}>
              <ShieldCheck size={12} color={Colors.status.success} />
              <Text style={styles.ratingText}>Verified MyFarm Logistics Partner</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
            <Phone size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Milestone Steps Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardHeading}>Delivery Progress</Text>
          <View style={styles.timelineList}>
            {steps.map((s, idx) => {
              const isLast = idx === steps.length - 1;
              const isDone = s.status === 'completed';
              const isActive = s.status === 'active';

              return (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepIndicatorColumn}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isActive && styles.stepDotActive,
                      ]}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} color={Colors.text.inverse} />
                      ) : (
                        <View
                          style={[
                            styles.innerDot,
                            isActive && { backgroundColor: Colors.primary },
                          ]}
                        />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          isDone && { backgroundColor: Colors.primary },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <View style={styles.stepHeaderRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive && { color: Colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {s.title}
                      </Text>
                      <Text style={styles.stepTime}>{s.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Step simulator button for demonstration */}
          <TouchableOpacity
            style={styles.simButton}
            onPress={handleSimulateNext}
          >
            <Text style={styles.simButtonText}>
              Simulate Rider Progress ({activeStepIndex + 1}/4)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Automated Customer Notifications (WhatsApp & SMS) */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View style={styles.notifHeaderLeft}>
              <Smartphone size={20} color={Colors.primary} />
              <Text style={styles.cardHeading}>Automated Dispatch Alerts</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.channelBadgeGreen}>
                <Text style={styles.channelBadgeGreenText}>WhatsApp</Text>
              </View>
              <View style={styles.channelBadgeBlue}>
                <Text style={styles.channelBadgeBlueText}>SMS</Text>
              </View>
            </View>
          </View>

          <Text style={styles.notifSub}>
            Automated alerts are triggered via Termii/SMS and WhatsApp to notify urban buyers when their produce departs the Ido farm hub.
          </Text>

          {/* Channel Selector Tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeChannelTab === 'whatsapp' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveChannelTab('whatsapp')}
            >
              <MessageSquare size={14} color={activeChannelTab === 'whatsapp' ? Colors.surface : Colors.text.muted} />
              <Text
                style={[
                  styles.tabButtonText,
                  activeChannelTab === 'whatsapp' && styles.tabButtonTextActive,
                ]}
              >
                WhatsApp Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeChannelTab === 'sms' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveChannelTab('sms')}
            >
              <Send size={14} color={activeChannelTab === 'sms' ? Colors.surface : Colors.text.muted} />
              <Text
                style={[
                  styles.tabButtonText,
                  activeChannelTab === 'sms' && styles.tabButtonTextActive,
                ]}
              >
                Carrier SMS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formatted Message Bubble Preview */}
          <View
            style={[
              styles.previewBubble,
              activeChannelTab === 'whatsapp' ? styles.previewBubbleWa : styles.previewBubbleSms,
            ]}
          >
            <View style={styles.bubbleHeader}>
              <Text style={styles.bubbleRecipient}>
                To: Babatunde Adeleke ({recipientPhone})
              </Text>
              <Text style={styles.bubbleTag}>
                {activeChannelTab === 'whatsapp' ? 'Verified Sender: MyFarm NG' : 'Sender ID: MyFarm'}
              </Text>
            </View>

            {activeChannelTab === 'whatsapp' ? (
              <View style={styles.waContent}>
                <Text style={styles.waHeading}>🛵 *MyFarm Dispatch Alert — Rider On The Way!* 💨</Text>
                <Text style={styles.waBody}>
                  Order *{orderCode}* has departed the Ido collection hub for doorstep handover.{'\n\n'}
                  👤 *Rider:* Kehinde Alao{'\n'}
                  📞 *Rider Phone:* +234 802 345 6789{'\n'}
                  🏍️ *Motorcycle:* TVS HLX 150 (OYO-291-LU){'\n'}
                  ⏱️ *Estimated Arrival:* ~35 mins{'\n'}
                  📍 *Destination:* {destination}{'\n\n'}
                  Produce freshly packed: {itemsSummary}.{'\n'}
                  👉 Track live in MyFarm: https://myfarm.ng/delivery/{orderCode}
                </Text>
              </View>
            ) : (
              <Text style={styles.smsBody}>
                [MyFarm] Rider Kehinde Alao (+2348023456789) is en route with order {orderCode} on motorcycle OYO-291-LU. ETA: ~35 mins to {destination}. Track live: https://myfarm.ng/delivery/{orderCode}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.triggerAlertButton}
              onPress={handleTriggerRiderAlert}
            >
              <Send size={15} color={Colors.surface} />
              <Text style={styles.triggerAlertButtonText}>
                {alertDispatched ? '✓ Alert Dispatched (Send Again)' : 'Trigger Live SMS & WhatsApp Alert'}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                style={styles.openWaButton}
                onPress={handleOpenDirectWhatsApp}
              >
                <MessageSquare size={14} color="#15803d" />
                <Text style={styles.openWaButtonText}>Open Rider WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewInboxButton}
                onPress={() => router.push('/notifications')}
              >
                <ExternalLink size={14} color={Colors.primary} />
                <Text style={styles.viewInboxButtonText}>In-App Inbox</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Summary & Doorstep Guarantee */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Order Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid (Incl. Delivery)</Text>
            <Text style={styles.summaryValue}>₦{totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>Instant Transfer (Verified)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Freshness Guarantee</Text>
            <Text style={[styles.summaryValue, { color: Colors.status.success }]}>
              100% Farm-Direct (Zero Storage Loss)
            </Text>
          </View>
        </View>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  headerSub: {
    ...Typography.caption,
    fontFamily: 'monospace',
    color: Colors.text.muted,
  },
  livePill: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  livePillText: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.primary,
    fontSize: 11,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  truckCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    fontWeight: '800',
    color: Colors.text.muted,
  },
  heroTime: {
    ...Typography.heading1,
    color: Colors.primary,
  },
  heroSub: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  destinationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  destinationText: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  riderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderInitials: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  riderInfo: {
    flex: 1,
    gap: 2,
  },
  riderName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  riderVehicle: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.status.success,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeading: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  timelineList: {
    paddingVertical: Spacing.xs,
  },
  stepItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.md,
    gap: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stepTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.text.muted,
  },
  stepDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  simButton: {
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryFaint,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  simButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  summaryValue: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  notifCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  channelBadgeGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  channelBadgeGreenText: {
    ...Typography.caption,
    color: '#15803d',
    fontWeight: '700',
    fontSize: 10,
  },
  channelBadgeBlue: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  channelBadgeBlueText: {
    ...Typography.caption,
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 10,
  },
  notifSub: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 4,
    marginVertical: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabButtonTextActive: {
    color: Colors.surface,
    fontWeight: '700',
  },
  previewBubble: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  previewBubbleWa: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  previewBubbleSms: {
    backgroundColor: '#f8fafc',
    borderColor: Colors.border,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 6,
    marginBottom: 4,
  },
  bubbleRecipient: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text.primary,
    fontSize: 11,
  },
  bubbleTag: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.text.muted,
  },
  waContent: {
    gap: 6,
  },
  waHeading: {
    ...Typography.caption,
    fontWeight: '800',
    color: '#15803d',
    fontSize: 12,
  },
  waBody: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontSize: 12,
    lineHeight: 19,
  },
  smsBody: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 19,
  },
  actionButtonGroup: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  triggerAlertButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  triggerAlertButtonText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.surface,
    fontSize: 13,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  openWaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  openWaButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#15803d',
  },
  viewInboxButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  viewInboxButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});
