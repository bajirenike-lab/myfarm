import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/types';
import { IBADAN_DELIVERY_ZONES, DeliveryZone } from '@/constants/delivery';
import { NotificationService } from '@/services/notification';
import { userMode } from '@/services/userMode';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  X,
  MapPin,
  Truck,
  Clock,
} from 'lucide-react-native';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [cart, setCart] = useState<{ [listingId: string]: number }>({});
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(IBADAN_DELIVERY_ZONES[1]);
  const [deliveryAddress, setDeliveryAddress] = useState('14, Oluyole Way, Bodija');
  const [recipientPhone, setRecipientPhone] = useState('0802 345 6789');
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const { data } = await supabase
        .from('marketplace_listings')
        .select('*, crop:crops(*)')
        .eq('status', 'active');

      if (data && data.length > 0) {
        setListings(data);
      } else {
        // Fallback demo marketplace produce from Ibadan farms
        setListings([
          {
            id: 'lst-001',
            seller_id: 'usr-demo-1',
            crop_id: 'c1111111-1111-1111-1111-111111111111',
            title: 'Farm-Fresh Roma Tomatoes (Crate)',
            description:
              'Crisp, sun-ripened Grade A Roma tomatoes harvested fresh this week from Ido Precision Farm, Ibadan.',
            price_per_kg: 850,
            total_quantity_kg: 200,
            available_quantity_kg: 145,
            unit: 'kg',
            image_urls: [
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
            ],
            is_approved: true,
            status: 'active',
            created_at: new Date().toISOString(),
            crop: {
              id: 'c1111111-1111-1111-1111-111111111111',
              name: 'Roma Tomato',
              category: 'Vegetable',
              description: '',
              growth_duration_days: 75,
              planting_season: '',
              water_requirement: '',
              soil_requirement: '',
              pest_and_disease_notes: '',
              image_url: '',
              is_active: true,
            },
          },
          {
            id: 'lst-002',
            seller_id: 'usr-demo-2',
            crop_id: 'c2222222-2222-2222-2222-222222222222',
            title: 'Aromatic Red Habanero Pepper (Atarodo)',
            description:
              'Freshly harvested pungent Scotch Bonnet peppers from Akinyele Organic Agri-Hub.',
            price_per_kg: 1400,
            total_quantity_kg: 100,
            available_quantity_kg: 78,
            unit: 'kg',
            image_urls: [
              'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
            ],
            is_approved: true,
            status: 'active',
            created_at: new Date().toISOString(),
            crop: {
              id: 'c2222222-2222-2222-2222-222222222222',
              name: 'Habanero Pepper',
              category: 'Vegetable',
              description: '',
              growth_duration_days: 90,
              planting_season: '',
              water_requirement: '',
              soil_requirement: '',
              pest_and_disease_notes: '',
              image_url: '',
              is_active: true,
            },
          },
          {
            id: 'lst-003',
            seller_id: 'usr-demo-3',
            crop_id: 'c3333333-3333-3333-3333-333333333333',
            title: 'Golden Sweet Corn (Fresh Cobs)',
            description:
              'Sweet, tender maize cobs harvested at optimal sugar peak in Ido LGA.',
            price_per_kg: 500,
            total_quantity_kg: 300,
            available_quantity_kg: 210,
            unit: 'kg',
            image_urls: [
              'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
            ],
            is_approved: true,
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn('Marketplace fetch error:', e);
    }
  };

  const updateCart = (listingId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[listingId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[listingId];
        return copy;
      }
      return { ...prev, [listingId]: next };
    });
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const calculateSubtotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = listings.find((l) => l.id === id);
      return total + (item ? item.price_per_kg * qty : 0);
    }, 0);
  };

  const deliveryFee = selectedZone.fee;
  const subtotal = calculateSubtotal();
  const totalAmount = subtotal + (cartItemsCount > 0 ? deliveryFee : 0);

  const handleCheckout = async () => {
    if (!deliveryAddress || !recipientPhone) {
      Alert.alert(
        'Delivery Details Required',
        'Please enter your delivery address in Ibadan and your contact phone number.'
      );
      return;
    }

    setProcessingOrder(true);
    const orderCode = 'MYF-MKT-' + Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = 'TRK-IBD-' + Math.floor(1000 + Math.random() * 9000);

    const itemsSummary =
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = listings.find((l) => l.id === id);
          return item ? `${qty}kg ${item.title}` : `${qty}kg produce`;
        })
        .join(', ') || 'Fresh Farm Produce';

    try {
      // 1. Insert into Supabase marketplace_orders
      const { data: orderData, error: orderErr } = await supabase
        .from('marketplace_orders')
        .insert([
          {
            order_code: orderCode,
            buyer_id: '00000000-0000-0000-0000-000000000001',
            status: 'preparing',
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total_amount: totalAmount,
            delivery_address: {
              zone: selectedZone.name,
              street: deliveryAddress,
              phone: recipientPhone,
              city: 'Ibadan',
              state: 'Oyo',
            },
          },
        ])
        .select('id');

      // 2. Insert into Supabase delivery_requests
      await supabase.from('delivery_requests').insert([
        {
          tracking_number: trackingNumber,
          source_type: 'marketplace_order',
          source_id: orderData?.[0]?.id || '00000000-0000-0000-0000-000000000001',
          recipient_name: 'Babatunde Adeleke',
          recipient_phone: recipientPhone,
          destination_address: `${deliveryAddress}, ${selectedZone.name}, Ibadan`,
          city: 'Ibadan',
          state: 'Oyo',
          status: 'ready_for_dispatch',
          dispatch_notes: `Assigned to Kehinde Alao (Motorcycle #OYO-291-LU). Zone: ${selectedZone.name}`,
        },
      ]);

      // 3. Trigger Automated WhatsApp & SMS Notification Alert
      await NotificationService.sendOrderConfirmedNotification({
        orderCode,
        recipientName: 'Babatunde Adeleke',
        recipientPhone,
        itemsSummary,
        totalAmount,
        zoneName: selectedZone.name,
        deliveryAddress,
      });
    } catch (e) {
      console.warn('Marketplace order creation note:', e);
    }

    setProcessingOrder(false);
    setCheckoutModalVisible(false);
    setCart({});

    // 4. Navigate directly to the live delivery tracking screen
    router.push({
      pathname: '/delivery/[id]',
      params: {
        id: orderCode,
        orderCode,
        address: `${deliveryAddress}, ${selectedZone.name}`,
        zoneName: selectedZone.name,
        totalAmount: totalAmount.toLocaleString(),
        recipientPhone,
        itemsSummary,
      },
    });
  };

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fresh produce in Ibadan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      {/* Produce Grid */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {/* Mode Switcher Bar */}
        <View style={styles.modeBar}>
          <View style={styles.modePillActive}>
            <Text style={{ fontSize: 13 }}>🛒</Text>
            <Text style={styles.modeActiveText}>Food Store</Text>
          </View>
          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => {
              userMode.setIntent('farm_owner');
              router.push('/start-farm');
            }}
          >
            <Text style={{ fontSize: 13 }}>🚜</Text>
            <Text style={styles.switchModeText}>Want to Own a Farm? →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerBox}>
          <Text style={styles.bannerTitle}>Direct From Ibadan Farms</Text>
          <Text style={styles.bannerSubtitle}>
            100% farm-traceable produce harvested directly from verified partner plots.
          </Text>
        </View>

        {filteredListings.map((item) => {
          const qtyInCart = cart[item.id] || 0;

          return (
            <View key={item.id} style={styles.card}>
              <Image
                source={{
                  uri:
                    item.image_urls[0] ||
                    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.priceTag}>
                    ₦{item.price_per_kg.toLocaleString()}/{item.unit}
                  </Text>
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>
                      {item.available_quantity_kg} kg available
                    </Text>
                  </View>

                  <View style={styles.cartActions}>
                    {qtyInCart > 0 && (
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCart(item.id, -5)}
                      >
                        <Minus size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    )}

                    {qtyInCart > 0 && (
                      <Text style={styles.qtyText}>{qtyInCart} kg</Text>
                    )}

                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => updateCart(item.id, 5)}
                    >
                      <Plus size={16} color={Colors.text.inverse} />
                      <Text style={styles.addBtnText}>
                        {qtyInCart > 0 ? '+5 kg' : 'Add 5 kg'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Checkout Bar */}
      {cartItemsCount > 0 && (
        <View style={styles.floatingBar}>
          <View>
            <Text style={styles.floatingItemsText}>
              {cartItemsCount} kg produce selected
            </Text>
            <Text style={styles.floatingTotalText}>
              Total: ₦{totalAmount.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => setCheckoutModalVisible(true)}
          >
            <ShoppingBag size={18} color={Colors.text.inverse} />
            <Text style={styles.checkoutBtnText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery & Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery & Order Summary</Text>
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(false)}
              >
                <X size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.orderSummaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Produce Subtotal</Text>
                <Text style={styles.summaryVal}>₦{subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doorstep Delivery ({selectedZone.name.split('/')[0].trim()})</Text>
                <Text style={styles.summaryVal}>₦{deliveryFee.toLocaleString()}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total Payable</Text>
                <Text style={styles.summaryTotalVal}>
                  ₦{totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Ibadan Delivery Zone Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Ibadan Delivery Destination</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneScroll}>
                {IBADAN_DELIVERY_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <TouchableOpacity
                      key={zone.id}
                      style={[styles.zoneChip, isSelected && styles.zoneChipSelected]}
                      onPress={() => setSelectedZone(zone)}
                    >
                      <Text style={[styles.zoneChipTitle, isSelected && styles.zoneChipTitleSelected]}>
                        {zone.name}
                      </Text>
                      <Text style={[styles.zoneChipFee, isSelected && styles.zoneChipFeeSelected]}>
                        ₦{zone.fee.toLocaleString()} • {zone.estimatedMinutes}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street / Building Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 14 Oluyole Way, Bodija, Ibadan"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholderTextColor={Colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 0802 345 6789"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.text.muted}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmPayBtn}
              onPress={handleCheckout}
              disabled={processingOrder}
            >
              <Truck size={18} color={Colors.text.inverse} />
              <Text style={styles.confirmPayText}>
                {processingOrder ? 'Processing...' : 'Confirm Delivery & Pay'}
              </Text>
            </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  modeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modePillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  modeActiveText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerBox: {
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 2,
  },
  bannerTitle: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    fontSize: 16,
    flex: 1,
  },
  priceTag: {
    ...Typography.heading2,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  cardDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stockBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  stockText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    ...Typography.captionBold,
    color: Colors.text.inverse,
  },
  floatingBar: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingItemsText: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  floatingTotalText: {
    ...Typography.heading2,
    color: Colors.text.inverse,
  },
  checkoutBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  checkoutBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  orderSummaryBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs + 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  summaryVal: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
    marginTop: 4,
  },
  summaryTotalLabel: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  summaryTotalVal: {
    ...Typography.heading2,
    color: Colors.primary,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
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
  zoneScroll: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  zoneChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  zoneChipSelected: {
    backgroundColor: Colors.primaryFaint,
    borderColor: Colors.primary,
  },
  zoneChipTitle: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    fontSize: 12,
  },
  zoneChipTitleSelected: {
    color: Colors.primary,
  },
  zoneChipFee: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontSize: 11,
  },
  zoneChipFeeSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  confirmPayBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  confirmPayText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
