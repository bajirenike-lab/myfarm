import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { fetchFarmWeather, getWeatherDescription } from '@/services/weather';
import { WeatherData, Farm, Crop, ProductionOrder } from '@/types';
import { NotificationService } from '@/services/notification';
import {
  Sprout,
  Sun,
  CloudSun,
  Droplets,
  ArrowRight,
  Calculator,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  Bell,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [featuredFarms, setFeaturedFarms] = useState<Farm[]>([]);
  const [featuredCrops, setFeaturedCrops] = useState<Crop[]>([]);
  const [activeOrders, setActiveOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);

  const checkUnreadNotifications = async () => {
    try {
      const all = await NotificationService.getNotifications();
      const unread = all.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      // fallback
    }
  };

  const loadData = async () => {
    try {
      // 1. Fetch live agricultural weather for Ibadan
      const weatherData = await fetchFarmWeather();
      setWeather(weatherData);

      // 2. Fetch farms from Supabase
      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .limit(2);

      if (farmsData && farmsData.length > 0) {
        setFeaturedFarms(farmsData);
      } else {
        // Fallback demo data if DB table is initializing
        setFeaturedFarms([
          {
            id: 'a1111111-1111-1111-1111-111111111111',
            name: 'Ido Agro Precision Farm',
            slug: 'ido-agro-precision-farm',
            description: 'Solar-powered drip irrigation horticulture hub.',
            state: 'Oyo',
            lga: 'Ido',
            address_description: 'Off Eleyele-Eruwa Road, Ibadan',
            latitude: 7.4589,
            longitude: 3.7654,
            total_area_sqm: 25000,
            available_area_sqm: 18500,
            soil_type: 'Sandy Loam',
            water_source: 'Solar Borehole & Drip',
            is_verified: true,
            cover_image_url:
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
            gallery_urls: [],
          },
        ]);
      }

      // 3. Fetch crops from Supabase
      const { data: cropsData } = await supabase
        .from('crops')
        .select('*')
        .limit(3);

      if (cropsData && cropsData.length > 0) {
        setFeaturedCrops(cropsData);
      } else {
        // Fallback demo crops
        setFeaturedCrops([
          {
            id: 'c1111111-1111-1111-1111-111111111111',
            name: 'Roma Tomato (F1 Hybrid)',
            category: 'Vegetable',
            description: 'High-yielding, disease-resistant determinate tomato.',
            growth_duration_days: 75,
            planting_season: 'All-year',
            water_requirement: 'High',
            soil_requirement: 'Sandy Loam',
            pest_and_disease_notes: 'Neem-managed bio protection',
            image_url:
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
            is_active: true,
          },
          {
            id: 'c2222222-2222-2222-2222-222222222222',
            name: 'Habanero Pepper (Atarodo)',
            category: 'Vegetable',
            description: 'Aromatic, deep-red pungent Scotch Bonnet pepper.',
            growth_duration_days: 90,
            planting_season: 'All-year',
            water_requirement: 'Moderate',
            soil_requirement: 'Loamy soil',
            pest_and_disease_notes: 'Insect sticky traps',
            image_url:
              'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
            is_active: true,
          },
        ]);
      }

      // 4. Fetch user's active orders
      const { data: ordersData } = await supabase
        .from('production_orders')
        .select('*, farm:farms(*), crop:crops(*), package:crop_packages(*)')
        .order('created_at', { ascending: false })
        .limit(2);

      if (ordersData) {
        setActiveOrders(ordersData);
      }
    } catch (e) {
      console.warn('Dashboard loading error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    checkUnreadNotifications();

    const unsubscribe = NotificationService.addListener(() => {
      checkUnreadNotifications();
    });

    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    checkUnreadNotifications();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 1. Header Greeting & Location */}
      <View style={styles.header}>
        <View style={styles.headerGreetingCol}>
          <Text style={styles.greetingText} numberOfLines={1}>
            Welcome, Urban Farmer
          </Text>
          <View style={styles.locationPill}>
            <MapPin size={12} color={Colors.primary} />
            <Text style={styles.locationText}>Ibadan, Oyo State</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.notifIconButton}
            onPress={() => router.push('/notifications')}
            accessibilityLabel="Notifications"
          >
            <Bell size={18} color={Colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calcButton}
            onPress={() => router.push('/calculator')}
            activeOpacity={0.8}
            accessibilityLabel="Production Estimator"
          >
            <Calculator size={15} color={Colors.text.inverse} />
            <Text style={styles.calcButtonText}>Estimator</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Live Agricultural Weather Widget */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherMain}>
            <CloudSun size={28} color={Colors.accentGold} />
            <View>
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
              <Text style={styles.weatherStatus}>
                {getWeatherDescription(weather.weather_code).label} • Ido Belt
              </Text>
            </View>
          </View>
          <View style={styles.weatherMetrics}>
            <View style={styles.metricItem}>
              <Droplets size={14} color={Colors.primaryLight} />
              <Text style={styles.metricText}>
                {weather.humidity ? `${weather.humidity}% Humidity` : '68% Hum'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Sun size={14} color={Colors.accentGold} />
              <Text style={styles.metricText}>Good Irrigation</Text>
            </View>
          </View>
        </View>
      )}

      {/* 3. Hero CTA: Start Your Farm */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTag}>
            <Sparkles size={12} color={Colors.accent} />
            <Text style={styles.heroTagText}>NEW SEASON OPEN</Text>
          </View>
          <Text style={styles.heroTitle}>Grow Fresh Food in Ibadan</Text>
          <Text style={styles.heroSubtitle}>
            Select a verified plot, fund certified inputs, and watch real farmers
            cultivate your harvest.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.heroButtonText}>Start Your Farm</Text>
            <ArrowRight size={18} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Active Farm Cycles Section (If any) */}
      {activeOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Active Cultivations</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/cycles')}>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {activeOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.activeCycleCard}
              onPress={() => router.push(`/cycle/${order.id}`)}
            >
              <View style={styles.cycleHeader}>
                <Text style={styles.cycleCode}>#{order.cycle_code}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.cycleCropName}>
                {order.crop?.name || 'Roma Tomato'}
              </Text>
              <Text style={styles.cycleFarmName}>
                {order.farm?.name || 'Ido Agro Precision Farm'}
              </Text>

              <View style={styles.cycleFooter}>
                <View style={styles.cycleMeta}>
                  <Calendar size={13} color={Colors.text.muted} />
                  <Text style={styles.cycleMetaText}>
                    Duration: {order.crop?.growth_duration_days || 75} Days
                  </Text>
                </View>
                <Text style={styles.viewTimelineText}>View Live Timeline →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 5. Featured Seasonal Crops */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Crops In Season</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.viewAllText}>Explore All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCropList}
        >
          {featuredCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={styles.cropCard}
              onPress={() => router.push(`/crop/${crop.id}`)}
            >
              <Image
                source={{ uri: crop.image_url }}
                style={styles.cropImage}
                resizeMode="cover"
              />
              <View style={styles.cropInfo}>
                <Text style={styles.cropCategory}>{crop.category.toUpperCase()}</Text>
                <Text style={styles.cropName}>{crop.name}</Text>
                <View style={styles.cropMetaRow}>
                  <Calendar size={12} color={Colors.text.secondary} />
                  <Text style={styles.cropDays}>
                    {crop.growth_duration_days} Days to Harvest
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 6. Partner Farms in Ibadan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Partner Farms in Ibadan</Text>
        </View>

        {featuredFarms.map((farm) => (
          <TouchableOpacity
            key={farm.id}
            style={styles.farmCard}
            onPress={() => router.push(`/farm/${farm.id}`)}
          >
            <Image
              source={{ uri: farm.cover_image_url }}
              style={styles.farmImage}
              resizeMode="cover"
            />
            <View style={styles.farmContent}>
              <View style={styles.farmHeaderRow}>
                <Text style={styles.farmName}>{farm.name}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={14} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text style={styles.farmAddress}>
                {farm.lga} LGA, Oyo State • {farm.water_source}
              </Text>
              <Text style={styles.farmDesc} numberOfLines={2}>
                {farm.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 7. Responsible Agriculture Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Real Agriculture Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          Farming involves biological and environmental variability. All yields,
          dates, and unit costs shown are scientifically backed estimates and not
          guaranteed financial returns.
        </Text>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    width: '100%',
  },
  headerGreetingCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  notifIconButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.status.error,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: Colors.surface,
    fontSize: 9,
    fontWeight: '800',
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  calcButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  weatherCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  weatherStatus: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  weatherMetrics: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  heroContent: {
    gap: Spacing.sm,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroTagText: {
    color: Colors.accentGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.inverse,
    lineHeight: 28,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  heroButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  heroButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  viewAllText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  horizontalCropList: {
    gap: Spacing.md,
  },
  cropCard: {
    width: 170,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  cropImage: {
    width: '100%',
    height: 110,
  },
  cropInfo: {
    padding: Spacing.sm,
    gap: 2,
  },
  cropCategory: {
    ...Typography.badge,
    color: Colors.accent,
  },
  cropName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  cropMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cropDays: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  farmCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  farmImage: {
    width: '100%',
    height: 130,
  },
  farmContent: {
    padding: Spacing.md,
    gap: 4,
  },
  farmHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    fontSize: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  farmAddress: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  farmDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginTop: 2,
  },
  activeCycleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 6,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleCode: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  cycleCropName: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  cycleFarmName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  cycleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  cycleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycleMetaText: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  viewTimelineText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  disclaimerTitle: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.secondary,
  },
});
