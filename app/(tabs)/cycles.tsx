import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ProductionOrder } from '@/types';
import {
  Sprout,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';

export default function CyclesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('production_orders')
        .select('*, farm:farms(*), crop:crops(*), package:crop_packages(*)')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setOrders(data);
      } else {
        // Fallback realistic demo cycles for initial validation
        setOrders([
          {
            id: 'ord-demo-001',
            cycle_code: 'CYC-2026-0042',
            user_id: 'usr-1',
            farm_id: 'a1111111-1111-1111-1111-111111111111',
            crop_id: 'c1111111-1111-1111-1111-111111111111',
            package_id: 'e1111111-1111-1111-1111-111111111111',
            plot_id: 'd1111111-1111-1111-1111-111111111101',
            status: 'growing',
            payment_status: 'successful',
            total_amount: 65000,
            target_start_date: '2026-10-01',
            actual_start_date: '2026-10-03',
            estimated_harvest_start: '2026-12-15',
            created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
            farm: {
              id: 'a1111111-1111-1111-1111-111111111111',
              name: 'Ido Agro Precision Farm',
              slug: 'ido-agro',
              description: '',
              state: 'Oyo',
              lga: 'Ido',
              address_description: 'Eleyele-Eruwa Rd, Ibadan',
              latitude: 7.4589,
              longitude: 3.7654,
              total_area_sqm: 25000,
              available_area_sqm: 18500,
              soil_type: 'Sandy Loam',
              water_source: 'Solar Borehole',
              is_verified: true,
              cover_image_url:
                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
              gallery_urls: [],
            },
            crop: {
              id: 'c1111111-1111-1111-1111-111111111111',
              name: 'Roma Tomato (F1 Hybrid)',
              category: 'Vegetable',
              description: '',
              growth_duration_days: 75,
              planting_season: 'All-year',
              water_requirement: 'High',
              soil_requirement: 'Sandy Loam',
              pest_and_disease_notes: '',
              image_url:
                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
              is_active: true,
            },
            package: {
              id: 'e1111111-1111-1111-1111-111111111111',
              crop_id: 'c1111111-1111-1111-1111-111111111111',
              name: 'Starter Tomato Plot (50 sqm)',
              plot_size_sqm: 50,
              target_yield_min_kg: 160,
              target_yield_max_kg: 220,
              base_production_cost: 58000,
              platform_fee: 7000,
              total_price: 65000,
              is_active: true,
            },
          },
        ]);
      }
    } catch (e) {
      console.warn('Orders fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') {
      return !['completed', 'cancelled'].includes(o.status);
    }
    return ['completed', 'cancelled'].includes(o.status);
  });

  const getStageNumber = (status: string) => {
    const stages = [
      'awaiting_payment',
      'awaiting_allocation',
      'allocated',
      'land_preparation',
      'planting',
      'growing',
      'maintenance',
      'harvest_ready',
      'harvested',
      'completed',
    ];
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx + 1 : 1;
  };

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}
          >
            Active Farms (
            {orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length}
            )
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            Completed Harvests (
            {orders.filter((o) => ['completed', 'cancelled'].includes(o.status)).length}
            )
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Sprout size={48} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>No Active Cultivations</Text>
          <Text style={styles.emptySubtitle}>
            You have not funded any farm cycles yet. Start your first farm in
            Ibadan today!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.emptyButtonText}>Start Your Farm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredOrders.map((order) => {
            const stageNum = getStageNumber(order.status);
            const totalStages = 8;
            const progressPercent = Math.min(
              100,
              Math.round((stageNum / totalStages) * 100)
            );

            return (
              <View key={order.id} style={styles.cycleCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cycleCode}>#{order.cycle_code}</Text>
                    <Text style={styles.cropName}>
                      {order.crop?.name || 'Roma Tomato'}
                    </Text>
                    <Text style={styles.farmName}>
                      {order.farm?.name || 'Ido Agro Farm'}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      Stage {stageNum} of {totalStages}:{' '}
                      {order.status.replace('_', ' ')}
                    </Text>
                    <Text style={styles.progressPercent}>{progressPercent}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Meta details */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Clock size={14} color={Colors.text.muted} />
                    <Text style={styles.metricText}>
                      Est. Harvest: Dec 15, 2026
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <TrendingUp size={14} color={Colors.primary} />
                    <Text style={styles.metricText}>
                      Est. 160–220 kg
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.timelineButton}
                    onPress={() => router.push(`/cycle/${order.id}`)}
                  >
                    <Text style={styles.timelineButtonText}>
                      View Verified Timeline
                    </Text>
                    <ArrowRight size={16} color={Colors.text.inverse} />
                  </TouchableOpacity>

                  {order.status === 'harvest_ready' || order.status === 'harvested' ? (
                    <TouchableOpacity
                      style={styles.harvestButton}
                      onPress={() => router.push(`/harvest/${order.id}`)}
                    >
                      <Text style={styles.harvestButtonText}>
                        Choose Outcome (Eat / Sell)
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.heading1,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  emptyButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  cycleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cycleCode: {
    ...Typography.captionBold,
    color: Colors.text.muted,
  },
  cropName: {
    ...Typography.heading2,
    color: Colors.text.primary,
    marginTop: 2,
  },
  farmName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  progressPercent: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  actionRow: {
    gap: Spacing.sm,
  },
  timelineButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
  },
  timelineButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  harvestButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  harvestButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
