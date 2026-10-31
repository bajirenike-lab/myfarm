// ==============================================================================
// MYFARM - IN-APP NOTIFICATIONS & SMS/WHATSAPP INBOX
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { AppNotification, NotificationType } from '@/types';
import { NotificationService } from '@/services/notification';
import {
  ChevronLeft,
  CheckCircle2,
  Bell,
  Truck,
  ShoppingBag,
  Sprout,
  Package,
  MessageSquare,
  Send,
  ExternalLink,
  X,
  Smartphone,
  ShieldCheck,
} from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'orders' | 'farm'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const loadNotifications = async () => {
    try {
      const items = await NotificationService.getNotifications();
      setNotifications(items);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to reactive notifications
    const unsubscribe = NotificationService.addListener(() => {
      loadNotifications();
    });

    return unsubscribe;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    await loadNotifications();
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (!item.is_read) {
      await NotificationService.markAsRead(item.id);
      loadNotifications();
    }
    setSelectedNotification(item);
  };

  const handleSimulateTestAlert = async () => {
    await NotificationService.sendActivityVerifiedNotification({
      recipientName: 'Babatunde Adeleke',
      recipientPhone: '+234 802 345 6789',
      cropName: 'Roma Tomatoes (F1 Hybrid)',
      farmName: 'Ido Agro Precision Farm',
      activityTitle: 'Precision Drip Fertigation & Trellising',
      notes: 'NPK 15:15:15 delivered through solar drip emitters. Canopy vigor rated 9.5/10.',
    });
    await loadNotifications();
    Alert.alert('Simulated Alert Triggered', 'New activity verified SMS & WhatsApp notification generated!');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'alerts') return n.channel === 'all' || n.sms_message || n.whatsapp_message;
    if (filter === 'orders') return n.type === 'ORDER_CONFIRMED' || n.type === 'RIDER_DISPATCHED' || n.type === 'DELIVERY_COMPLETED';
    if (filter === 'farm') return n.type === 'ACTIVITY_VERIFIED' || n.type === 'HARVEST_READY';
    return true;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return <ShoppingBag size={18} color="#15803d" />;
      case 'RIDER_DISPATCHED':
      case 'DELIVERY_COMPLETED':
        return <Truck size={18} color="#0369a1" />;
      case 'ACTIVITY_VERIFIED':
        return <Sprout size={18} color={Colors.primary} />;
      case 'HARVEST_READY':
        return <Package size={18} color="#b45309" />;
      default:
        return <Bell size={18} color={Colors.text.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notification Center</Text>
          <Text style={styles.headerSub}>SMS, WhatsApp & Farm Alerts</Text>
        </View>
        <TouchableOpacity style={styles.markReadButton} onPress={handleMarkAllRead}>
          <CheckCircle2 size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips - Horizontally Scrollable on Mobile to prevent page shifting */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'alerts' && styles.filterChipActive]}
            onPress={() => setFilter('alerts')}
          >
            <Text style={[styles.filterChipText, filter === 'alerts' && styles.filterChipTextActive]}>
              SMS & WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'orders' && styles.filterChipActive]}
            onPress={() => setFilter('orders')}
          >
            <Text style={[styles.filterChipText, filter === 'orders' && styles.filterChipTextActive]}>
              Orders & Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'farm' && styles.filterChipActive]}
            onPress={() => setFilter('farm')}
          >
            <Text style={[styles.filterChipText, filter === 'farm' && styles.filterChipTextActive]}>
              Farm Milestones
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Order dispatches and farm verification alerts will appear here.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, !item.is_read && styles.itemCardUnread]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemIconCircle}>{getIconForType(item.type)}</View>
                <View style={styles.itemTitleBlock}>
                  <Text style={[styles.itemTitle, !item.is_read && styles.itemTitleBold]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemTimestamp}>
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    •{' '}
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.itemMessage} numberOfLines={2}>
                {item.message}
              </Text>

              {/* Channel Indicators */}
              <View style={styles.channelRow}>
                {item.whatsapp_message && (
                  <View style={styles.waBadge}>
                    <Text style={styles.waBadgeText}>WhatsApp Sent</Text>
                  </View>
                )}
                {item.sms_message && (
                  <View style={styles.smsBadge}>
                    <Text style={styles.smsBadgeText}>SMS Dispatched</Text>
                  </View>
                )}
                {item.link_url && (
                  <Text style={styles.deepLinkPrompt}>Tap to inspect payload →</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Simulator CTA */}
        <TouchableOpacity style={styles.testAlertBox} onPress={handleSimulateTestAlert}>
          <Smartphone size={20} color={Colors.primary} />
          <View style={styles.testAlertTextWrap}>
            <Text style={styles.testAlertTitle}>Simulate Farm Verification Alert</Text>
            <Text style={styles.testAlertDesc}>
              Test the SMS and WhatsApp pipeline for an agronomist milestone approval.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Notification Detail & Message Payload Inspector Modal */}
      {selectedNotification && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedNotification}
          onRequestClose={() => setSelectedNotification(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                  <Text style={styles.modalSub}>
                    Dispatched to {selectedNotification.recipient_name || 'Recipient'} (
                    {selectedNotification.recipient_phone || '+234 802 345 6789'})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedNotification(null)}
                >
                  <X size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* WhatsApp Copy Preview */}
                {selectedNotification.whatsapp_message && (
                  <View style={styles.payloadSection}>
                    <View style={styles.payloadHeader}>
                      <MessageSquare size={16} color="#15803d" />
                      <Text style={styles.payloadTitleGreen}>WhatsApp Message Format</Text>
                    </View>
                    <View style={styles.waBubble}>
                      <Text style={styles.waBubbleText}>
                        {selectedNotification.whatsapp_message}
                      </Text>
                    </View>
                  </View>
                )}

                {/* SMS Copy Preview */}
                {selectedNotification.sms_message && (
                  <View style={styles.payloadSection}>
                    <View style={styles.payloadHeader}>
                      <Send size={16} color="#0369a1" />
                      <Text style={styles.payloadTitleBlue}>Carrier SMS Copy (Termii / Telco)</Text>
                    </View>
                    <View style={styles.smsBubble}>
                      <Text style={styles.smsBubbleText}>
                        {selectedNotification.sms_message}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action CTA */}
                {selectedNotification.link_url && (
                  <TouchableOpacity
                    style={styles.openLinkBtn}
                    onPress={() => {
                      const link = selectedNotification.link_url;
                      setSelectedNotification(null);
                      if (link) {
                        router.push(link as any);
                      }
                    }}
                  >
                    <ExternalLink size={16} color={Colors.surface} />
                    <Text style={styles.openLinkBtnText}>Open Linked Screen in MyFarm</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
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
    width: '100%',
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
  markReadButton: {
    padding: Spacing.xs,
  },
  filterBarContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    width: '100%',
    flexGrow: 0,
  },
  filterBarScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  itemCardUnread: {
    borderColor: Colors.primary,
    backgroundColor: '#fbfdfb',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleBlock: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  itemTitleBold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  itemTimestamp: {
    ...Typography.caption,
    color: Colors.text.muted,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  itemMessage: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  waBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  waBadgeText: {
    ...Typography.caption,
    color: '#15803d',
    fontWeight: '700',
    fontSize: 10,
  },
  smsBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  smsBadgeText: {
    ...Typography.caption,
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 10,
  },
  deepLinkPrompt: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 'auto',
  },
  testAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  testAlertTextWrap: {
    flex: 1,
  },
  testAlertTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primary,
  },
  testAlertDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
    maxHeight: '85%',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  modalTitleBlock: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  modalSub: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalBody: {
    gap: Spacing.md,
  },
  payloadSection: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  payloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payloadTitleGreen: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#15803d',
  },
  payloadTitleBlue: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#0369a1',
  },
  waBubble: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  waBubbleText: {
    ...Typography.body,
    fontSize: 13,
    color: '#14532d',
    lineHeight: 20,
  },
  smsBubble: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  smsBubbleText: {
    ...Typography.body,
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  openLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  openLinkBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.surface,
  },
});
