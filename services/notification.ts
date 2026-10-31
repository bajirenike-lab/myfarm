// ==============================================================================
// MYFARM - MODULAR NOTIFICATION GATEWAY (SMS & WHATSAPP)
// Supports Termii (Nigerian Carrier SMS/WhatsApp), Twilio, and Reactive Mock Provider
// ==============================================================================

import { supabase } from '@/lib/supabase';
import { AppNotification, NotificationType, NotificationChannel } from '@/types';

export interface NotificationPayload {
  userId?: string;
  recipientPhone: string;
  recipientName: string;
  type: NotificationType;
  title: string;
  message: string;
  smsText?: string;
  whatsAppText?: string;
  linkUrl?: string;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  channelsSent: NotificationChannel[];
  deliveryTimestamp: string;
  formattedSms?: string;
  formattedWhatsApp?: string;
  error?: string;
}

export interface NotificationGateway {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  getNotifications(userId?: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
}

/**
 * Format Nigerian phone numbers into international 234 format (Termii requirement)
 */
export function sanitizeNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) {
    return cleaned;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '234' + cleaned.slice(1);
  }
  return cleaned;
}

// ------------------------------------------------------------------------------
// In-Memory Reactive Store (Ensures Zero-Failure Offline / Demo UX)
// ------------------------------------------------------------------------------
class NotificationStore {
  private notifications: AppNotification[] = [
    {
      id: 'notif-seed-01',
      title: 'Milestone Verified: Bed Preparation',
      message: 'Ido Agro Farm agronomist verified raised seed beds and drip lines for your Roma Tomatoes.',
      sms_message: '[MyFarm] Verified: Bed preparation approved for your Roma Tomatoes plot in Ido LGA. Photos live in app.',
      whatsapp_message: '🌱 *MyFarm Verification Alert* ✅\n\nBed preparation approved for your *Roma Tomatoes* plot in Ido LGA.\n\n📷 High-res photos and GPS check live in your cockpit.',
      type: 'ACTIVITY_VERIFIED',
      channel: 'all',
      recipient_name: 'Babatunde Adeleke',
      recipient_phone: '+234 802 345 6789',
      link_url: '/cycles',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'notif-seed-02',
      title: 'Ibadan Weather Advisory',
      message: 'Dry sunny spells across Akinyele & Ido LGAs (31°C). Precision irrigation scheduled for 4:00 PM.',
      sms_message: '[MyFarm] Ibadan Weather: 31°C sunny in Ido LGA. Precision drip irrigation scheduled for 4:00 PM.',
      whatsapp_message: '☀️ *MyFarm Weather Advisory* 💧\n\nIdo LGA: 31°C sunny weather. Precision drip irrigation scheduled for 4:00 PM to ensure optimal tomato seedling hydration.',
      type: 'GENERAL_ALERT',
      channel: 'all',
      recipient_name: 'Babatunde Adeleke',
      recipient_phone: '+234 802 345 6789',
      link_url: '/(tabs)',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  private listeners: ((notification: AppNotification) => void)[] = [];

  addListener(listener: (notification: AppNotification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  addNotification(notification: AppNotification) {
    this.notifications.unshift(notification);
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.warn('Listener error in NotificationStore:', err);
      }
    });
  }

  getAll(): AppNotification[] {
    return [...this.notifications];
  }

  markRead(id: string): boolean {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
      return true;
    }
    return false;
  }

  markAllRead(): boolean {
    this.notifications.forEach((n) => (n.is_read = true));
    return true;
  }
}

export const notificationStore = new NotificationStore();

// ------------------------------------------------------------------------------
// Provider 1: Mock Notification Provider (Default - Zero Cost / Instant Preview)
// ------------------------------------------------------------------------------
export class MockNotificationProvider implements NotificationGateway {
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const messageId = `MSG-MOCK-${Date.now()}-${Math.floor(Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const smsText =
      payload.smsText ||
      `[MyFarm] ${payload.title}: ${payload.message}${payload.linkUrl ? ` Details: https://myfarm.ng${payload.linkUrl}` : ''}`;

    const whatsAppText =
      payload.whatsAppText ||
      `🌱 *MyFarm Notification* 📲\n\n*${payload.title}*\n${payload.message}\n\n👤 Recipient: ${payload.recipientName}\n📞 Phone: ${payload.recipientPhone}\n${payload.linkUrl ? `\n🔗 Link: https://myfarm.ng${payload.linkUrl}` : ''}`;

    const newNotification: AppNotification = {
      id: messageId,
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      channel: payload.channel || 'all',
      recipient_phone: payload.recipientPhone,
      recipient_name: payload.recipientName,
      sms_message: smsText,
      whatsapp_message: whatsAppText,
      link_url: payload.linkUrl,
      is_read: false,
      created_at: timestamp,
      metadata: payload.metadata,
    };

    // 1. Store in reactive memory
    notificationStore.addNotification(newNotification);

    // 2. High-visibility console log for developer & founder inspection
    console.log('\n======================================================');
    console.log('📱 [MYFARM NOTIFICATION GATEWAY] SMS & WHATSAPP DISPATCH');
    console.log(`Type:       ${payload.type}`);
    console.log(`Recipient:  ${payload.recipientName} (${payload.recipientPhone})`);
    console.log(`Channel:    ${payload.channel || 'SMS & WhatsApp (All)'}`);
    console.log('--- SMS PAYLOAD ---');
    console.log(smsText);
    console.log('--- WHATSAPP PAYLOAD ---');
    console.log(whatsAppText);
    console.log('======================================================\n');

    // 3. Attempt Supabase persistence (gracefully handles offline or RLS policies)
    try {
      await supabase.from('notifications').insert([
        {
          id: messageId.startsWith('MSG-MOCK-') ? undefined : messageId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          channel: payload.channel || 'all',
          recipient_phone: payload.recipientPhone,
          sms_message: smsText,
          whatsapp_message: whatsAppText,
          link_url: payload.linkUrl,
          is_read: false,
          created_at: timestamp,
        },
      ]);
    } catch (e) {
      // Non-blocking fallback
      console.warn('Supabase notification insert note (using store fallback):', e);
    }

    return {
      success: true,
      messageId,
      channelsSent: ['sms', 'whatsapp', 'in_app'],
      deliveryTimestamp: timestamp,
      formattedSms: smsText,
      formattedWhatsApp: whatsAppText,
    };
  }

  async getNotifications(userId?: string): Promise<AppNotification[]> {
    // Try cloud Supabase first
    try {
      const query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as AppNotification[];
      }
    } catch (e) {
      console.warn('Using in-memory store for notifications:', e);
    }

    return notificationStore.getAll();
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    notificationStore.markRead(notificationId);
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (e) {
      // silent catch
    }
    return true;
  }

  async markAllAsRead(): Promise<boolean> {
    notificationStore.markAllRead();
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    } catch (e) {
      // silent catch
    }
    return true;
  }
}

// ------------------------------------------------------------------------------
// Provider 2: Termii Notification Provider (Nigerian Telco Carrier API)
// ------------------------------------------------------------------------------
export class TermiiNotificationProvider implements NotificationGateway {
  private apiKey: string;
  private senderId: string;
  private fallbackMock: MockNotificationProvider;

  constructor(apiKey?: string, senderId?: string) {
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_TERMII_API_KEY || '';
    this.senderId = senderId || process.env.EXPO_PUBLIC_TERMII_SENDER_ID || 'MyFarm';
    this.fallbackMock = new MockNotificationProvider();
  }

  /**
   * Direct live test SMS dispatcher
   * Calls Termii API directly and returns exact HTTP response and delivery status
   */
  async testLiveSms(params: {
    targetPhone: string;
    apiKey: string;
    senderId?: string;
    channel?: string;
    message?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const sanitizedPhone = sanitizeNigerianPhone(params.targetPhone);
    const sender = params.senderId || this.senderId || 'MyFarm';
    const channel = params.channel || 'generic';
    const text =
      params.message ||
      `[MyFarm] Live Termii verification test to ${params.targetPhone}. Agricultural alert system operational!`;

    try {
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          to: sanitizedPhone,
          from: sender,
          sms: text,
          type: 'plain',
          channel: channel,
          api_key: params.apiKey,
        }),
      });

      const resJson = await response.json();

      if (response.ok && (resJson.message === 'Successfully Sent' || resJson.message_id)) {
        return { success: true, data: resJson };
      } else {
        return {
          success: false,
          error: resJson.message || resJson.error || 'Termii returned an unhandled response.',
          data: resJson,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Termii API.' };
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // If no real API key is supplied, smoothly run in Sandbox Mock mode
    if (!this.apiKey || this.apiKey === 'sandbox_key' || this.apiKey.includes('placeholder')) {
      console.log('ℹ️ Termii API key not configured. Executing through MockNotificationProvider.');
      return this.fallbackMock.send(payload);
    }

    const sanitizedPhone = sanitizeNigerianPhone(payload.recipientPhone);
    const smsMessage =
      payload.smsText || `[MyFarm] ${payload.title}: ${payload.message}`;

    try {
      // Call Termii Nigerian Direct Route SMS API
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sanitizedPhone,
          from: this.senderId,
          sms: smsMessage,
          type: 'plain',
          channel: 'generic', // supports 'dnd' or 'generic'
          api_key: this.apiKey,
        }),
      });

      const resData = await response.json();

      // Record to store and DB
      await this.fallbackMock.send(payload);

      return {
        success: response.ok,
        messageId: resData.message_id || `TRM-${Date.now()}`,
        channelsSent: ['sms'],
        deliveryTimestamp: new Date().toISOString(),
        formattedSms: smsMessage,
      };
    } catch (err: any) {
      console.warn('Termii dispatch network error, falling back to mock:', err);
      return this.fallbackMock.send(payload);
    }
  }

  async getNotifications(userId?: string): Promise<AppNotification[]> {
    return this.fallbackMock.getNotifications(userId);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    return this.fallbackMock.markAsRead(notificationId);
  }

  async markAllAsRead(): Promise<boolean> {
    return this.fallbackMock.markAllAsRead();
  }
}

// ------------------------------------------------------------------------------
// Unified Notification Service & Template Helper Facade
// ------------------------------------------------------------------------------
class NotificationServiceFacade {
  private gateway: NotificationGateway;

  constructor() {
    // If Termii is configured use Termii, otherwise default to Mock
    if (process.env.EXPO_PUBLIC_TERMII_API_KEY) {
      this.gateway = new TermiiNotificationProvider();
    } else {
      this.gateway = new MockNotificationProvider();
    }
  }

  setGateway(gateway: NotificationGateway) {
    this.gateway = gateway;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    return this.gateway.send(payload);
  }

  async getNotifications(userId?: string): Promise<AppNotification[]> {
    return this.gateway.getNotifications(userId);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    return this.gateway.markAsRead(notificationId);
  }

  async markAllAsRead(): Promise<boolean> {
    return this.gateway.markAllAsRead();
  }

  addListener(listener: (notification: AppNotification) => void) {
    return notificationStore.addListener(listener);
  }

  async testLiveTermiiSms(params: {
    targetPhone: string;
    apiKey: string;
    senderId?: string;
    channel?: string;
    message?: string;
  }) {
    const termii = new TermiiNotificationProvider(params.apiKey, params.senderId);
    return termii.testLiveSms(params);
  }

  // ----------------------------------------------------------------------------
  // High-Level Automated Templates
  // ----------------------------------------------------------------------------

  /**
   * 1. Triggered on Marketplace Produce Checkout
   */
  async sendOrderConfirmedNotification(params: {
    orderCode: string;
    recipientName: string;
    recipientPhone: string;
    itemsSummary: string;
    totalAmount: number;
    zoneName: string;
    deliveryAddress: string;
  }): Promise<NotificationResult> {
    const formattedAmount = params.totalAmount.toLocaleString();

    const sms = `[MyFarm] Order ${params.orderCode} confirmed! Fresh produce (${params.itemsSummary}) is crated at Ido hub for delivery to ${params.zoneName}. Total: NGN ${formattedAmount}. Track: https://myfarm.ng/delivery/${params.orderCode}`;

    const whatsApp = `🌱 *MyFarm Ibadan — Order Confirmed* 📦\n\nHello *${params.recipientName}*! Your order *${params.orderCode}* has been received.\n\n🛒 *Produce:* ${params.itemsSummary}\n💰 *Total Paid:* ₦${formattedAmount}\n📍 *Destination:* ${params.deliveryAddress} (${params.zoneName})\n\nOur field team in Ido LGA is preparing your crate. You will receive rider details as soon as Kehinde is dispatched!\n\n🔗 *Live Order Tracking:* https://myfarm.ng/delivery/${params.orderCode}`;

    return this.send({
      type: 'ORDER_CONFIRMED',
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      title: `Order Confirmed (${params.orderCode})`,
      message: `Your harvest crate of ${params.itemsSummary} has been booked for ${params.zoneName}.`,
      smsText: sms,
      whatsAppText: whatsApp,
      linkUrl: `/delivery/${params.orderCode}`,
      metadata: { orderCode: params.orderCode, totalAmount: params.totalAmount },
    });
  }

  /**
   * 2. Triggered when Dispatch Rider is assigned
   */
  async sendRiderDispatchedNotification(params: {
    orderCode: string;
    recipientName: string;
    recipientPhone: string;
    riderName: string;
    riderPhone: string;
    vehiclePlate: string;
    destination: string;
    etaMinutes: number;
  }): Promise<NotificationResult> {
    const sms = `[MyFarm] Rider ${params.riderName} (${params.riderPhone}) has picked up order ${params.orderCode} on motorcycle ${params.vehiclePlate}. ETA: ~${params.etaMinutes} mins. Track: https://myfarm.ng/delivery/${params.orderCode}`;

    const whatsApp = `🛵 *MyFarm Dispatch Alert — Rider On The Way!* 💨\n\nOrder *${params.orderCode}* is out for doorstep delivery!\n\n👤 *Rider:* ${params.riderName}\n📞 *Rider Phone:* ${params.riderPhone}\n🏍️ *Motorcycle:* TVS HLX 150 (${params.vehiclePlate})\n⏱️ *Estimated Arrival:* ~${params.etaMinutes} minutes\n📍 *Destination:* ${params.destination}\n\nClick below to monitor rider progress in real time:\n👉 https://myfarm.ng/delivery/${params.orderCode}`;

    return this.send({
      type: 'RIDER_DISPATCHED',
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      title: `Rider En Route (${params.orderCode})`,
      message: `${params.riderName} has departed with your produce crate. ETA ~${params.etaMinutes} mins.`,
      smsText: sms,
      whatsAppText: whatsApp,
      linkUrl: `/delivery/${params.orderCode}`,
      metadata: {
        orderCode: params.orderCode,
        riderName: params.riderName,
        riderPhone: params.riderPhone,
      },
    });
  }

  /**
   * 3. Triggered when Admin verifies field activity in Ido/Akinyele
   */
  async sendActivityVerifiedNotification(params: {
    recipientName: string;
    recipientPhone: string;
    cropName: string;
    farmName: string;
    activityTitle: string;
    notes?: string;
  }): Promise<NotificationResult> {
    const sms = `[MyFarm] Milestone Verified! ${params.activityTitle} for your ${params.cropName} at ${params.farmName} has been approved by our agronomist. View photos in your app.`;

    const whatsApp = `🌾 *MyFarm Field Verification* ✅\n\nA new cultivation milestone was verified for your *${params.cropName}* plot!\n\n📍 *Farm:* ${params.farmName}\n📌 *Milestone:* ${params.activityTitle}\n🛡️ *Status:* Verified with GPS & photo evidence\n${params.notes ? `\n📝 *Notes:* "${params.notes}"\n` : ''}\nOpen your MyFarm Cockpit to view updated growth charts and field photos!`;

    return this.send({
      type: 'ACTIVITY_VERIFIED',
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      title: `Verified Milestone: ${params.activityTitle}`,
      message: `Agronomist has approved ${params.activityTitle} on your ${params.cropName} plot at ${params.farmName}.`,
      smsText: sms,
      whatsAppText: whatsApp,
      linkUrl: '/cycles',
      metadata: { farmName: params.farmName, cropName: params.cropName },
    });
  }

  /**
   * 4. Triggered when crop reaches maturity & harvest crating is complete
   */
  async sendHarvestReadyNotification(params: {
    recipientName: string;
    recipientPhone: string;
    cropName: string;
    farmName: string;
    estimatedYieldKg: number;
    deadlineHours?: number;
  }): Promise<NotificationResult> {
    const hours = params.deadlineHours || 48;
    const sms = `[MyFarm] Your ${params.cropName} at ${params.farmName} is ready for harvest (~${params.estimatedYieldKg} kg)! Choose doorstep delivery or marketplace sale within ${hours}h: https://myfarm.ng/harvest`;

    const whatsApp = `🌽 *MyFarm Harvest Alert — Crop Ready!* 🧺\n\nYour *${params.cropName}* plot at *${params.farmName}* has reached peak maturity!\n\n⚖️ *Gross Yield:* ~${params.estimatedYieldKg} kg\n⏳ *Allocation Deadline:* ${hours} hours\n\nPlease select whether you want your produce delivered fresh to your doorstep in Ibadan or listed for sale on the MyFarm Marketplace:\n👉 https://myfarm.ng/harvest`;

    return this.send({
      type: 'HARVEST_READY',
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      title: `Harvest Ready: ${params.cropName}`,
      message: `Your ${params.cropName} yield (~${params.estimatedYieldKg} kg) is mature. Select doorstep delivery or marketplace listing.`,
      smsText: sms,
      whatsAppText: whatsApp,
      linkUrl: '/harvest',
      metadata: { cropName: params.cropName, yieldKg: params.estimatedYieldKg },
    });
  }
}

export const NotificationService = new NotificationServiceFacade();
