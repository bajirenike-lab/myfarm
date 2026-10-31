import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { fetchFarmWeather } from '@/services/weather';
import { WeatherData } from '@/types';
import {
  Sprout,
  ShieldCheck,
  Calendar,
  CloudSun,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Camera,
} from 'lucide-react-native';

export default function CycleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchFarmWeather().then(setWeather);
  }, []);

  const activities = [
    {
      id: 'act-3',
      stage: 'Vegetative Growth & Foliar Nutrition',
      date: 'Oct 26, 2026 (4 days ago)',
      farmer: 'Samuel Olaniyan (Senior Horticulturist)',
      notes:
        'Completed second manual bed weeding and applied preventive organic neem extract to protect young foliage against early blight. Drip lines flushed.',
      image:
        'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
      inputs: 'Botanical Neem Extract (250ml), Organic Seaweed Extract',
      verified: true,
    },
    {
      id: 'act-2',
      stage: 'Seedling Transplanting',
      date: 'Oct 12, 2026 (18 days ago)',
      farmer: 'Samuel Olaniyan',
      notes:
        'Transplanted 160 vigorous, hardened F1 Roma seedlings onto raised beds at 45cm spacing during morning overcast conditions. Survival rate: 98%.',
      image:
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      inputs: '160 F1 Hybrid Roma Tomato Seedlings',
      verified: true,
    },
    {
      id: 'act-1',
      stage: 'Land Preparation & Ridging',
      date: 'Oct 04, 2026 (26 days ago)',
      farmer: 'Samuel Olaniyan',
      notes:
        'Tilled 50 sqm plot, created high drainage ridges, incorporated 45 kg aged poultry manure and mycorrhizal inoculant into the root zone.',
      image:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      inputs: '45kg Enriched Poultry Compost, Microbial Soil Inoculant',
      verified: true,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.cropTitle}>Roma Tomato (F1 Hybrid)</Text>
            <View style={styles.locationRow}>
              <MapPin size={13} color={Colors.primary} />
              <Text style={styles.locationText}>
                Plot IDO-BLK-A01 • Ido Agro Precision Farm
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>GROWING (DAY 26 OF 75)</Text>
          </View>
        </View>

        {/* Live Weather Indicator */}
        {weather && (
          <View style={styles.weatherStrip}>
            <CloudSun size={18} color={Colors.accentGold} />
            <Text style={styles.weatherText}>
              Farm Weather: {weather.temperature}°C • Sunlight optimal for flowering
            </Text>
          </View>
        )}
      </View>

      {/* Harvest Simulation Shortcut */}
      <View style={styles.harvestNoticeCard}>
        <View style={styles.harvestNoticeTextGroup}>
          <Text style={styles.harvestNoticeTitle}>Harvest Approaching</Text>
          <Text style={styles.harvestNoticeSub}>
            Estimated yield: 160 – 220 kg fresh Roma tomatoes.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.harvestActionBtn}
          onPress={() => router.push(`/harvest/${id}`)}
        >
          <Text style={styles.harvestActionText}>Preview Decisions</Text>
          <ArrowRight size={14} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Timeline Section */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Verified Field Activity Feed</Text>
        <Text style={styles.sectionSubtitle}>
          Real photographs and input records submitted from the field by verified farm
          operators.
        </Text>

        <View style={styles.feed}>
          {activities.map((act, index) => (
            <View key={act.id} style={styles.feedItem}>
              {/* Timeline Connector */}
              <View style={styles.timelineConnector}>
                <View style={styles.timelineDot}>
                  <CheckCircle2 size={16} color={Colors.primary} />
                </View>
                {index < activities.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Feed Card */}
              <View style={styles.feedCard}>
                <Image
                  source={{ uri: act.image }}
                  style={styles.feedImage}
                  resizeMode="cover"
                />

                <View style={styles.feedCardContent}>
                  <View style={styles.feedMetaRow}>
                    <Text style={styles.stageTitle}>{act.stage}</Text>
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck size={12} color={Colors.primary} />
                      <Text style={styles.verifiedText}>Approved</Text>
                    </View>
                  </View>

                  <Text style={styles.dateText}>{act.date}</Text>
                  <Text style={styles.farmerText}>By: {act.farmer}</Text>
                  <Text style={styles.notesText}>{act.notes}</Text>

                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>Inputs Applied:</Text>
                    <Text style={styles.inputVal}>{act.inputs}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitle: {
    ...Typography.heading1,
    color: Colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  weatherStrip: {
    backgroundColor: Colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  weatherText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  harvestNoticeCard: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  harvestNoticeTextGroup: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  harvestNoticeTitle: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  harvestNoticeSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  harvestActionBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  harvestActionText: {
    ...Typography.captionBold,
    color: Colors.text.inverse,
  },
  timelineSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  feed: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  feedItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  feedCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  feedImage: {
    width: '100%',
    height: 160,
  },
  feedCardContent: {
    padding: Spacing.md,
    gap: 4,
  },
  feedMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    fontSize: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  farmerText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  notesText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginVertical: 4,
  },
  inputBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  inputVal: {
    fontSize: 11,
    color: Colors.text.primary,
  },
});
