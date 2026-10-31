import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Crop, Farm } from '@/types';
import {
  Search,
  MapPin,
  Calendar,
  Droplets,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from 'lucide-react-native';

export default function DiscoverScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'crops' | 'farms'>('crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLga, setSelectedLga] = useState<string>('All');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: cropsData } = await supabase.from('crops').select('*');
      if (cropsData && cropsData.length > 0) {
        setCrops(cropsData);
      } else {
        // Fallback demo crops
        setCrops([
          {
            id: 'c1111111-1111-1111-1111-111111111111',
            name: 'Roma Tomato (F1 Hybrid)',
            category: 'Vegetable',
            description:
              'High-yielding, firm-skinned determinate tomato variety with high disease resistance.',
            growth_duration_days: 75,
            planting_season: 'All-year (Irrigated)',
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
            description:
              'Aromatic, intensely pungent Scotch Bonnet/Atarodo pepper with deep red fruit.',
            growth_duration_days: 90,
            planting_season: 'All-year',
            water_requirement: 'Moderate',
            soil_requirement: 'Loamy soil',
            pest_and_disease_notes: 'Insect sticky traps',
            image_url:
              'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
            is_active: true,
          },
          {
            id: 'c3333333-3333-3333-3333-333333333333',
            name: 'Sweet Corn (Maize)',
            category: 'Grain',
            description:
              'Fast-maturing sweet corn with tender golden kernels and rapid market turnaround.',
            growth_duration_days: 70,
            planting_season: 'March-June / Aug-Oct',
            water_requirement: 'Moderate',
            soil_requirement: 'Balanced loam',
            pest_and_disease_notes: 'Pheromone traps for armyworm',
            image_url:
              'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
            is_active: true,
          },
          {
            id: 'c4444444-4444-4444-4444-444444444444',
            name: 'Cassava (TME 419)',
            category: 'Root/Tuber',
            description:
              'Elite high-starch cassava stem variety developed by IITA. Drought hardy.',
            growth_duration_days: 270,
            planting_season: 'April-November',
            water_requirement: 'Low',
            soil_requirement: 'Tolerant loam',
            pest_and_disease_notes: 'Minimal pest issues',
            image_url:
              'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=800&q=80',
            is_active: true,
          },
        ]);
      }

      const { data: farmsData } = await supabase.from('farms').select('*');
      if (farmsData && farmsData.length > 0) {
        setFarms(farmsData);
      } else {
        // Fallback demo farms
        setFarms([
          {
            id: 'a1111111-1111-1111-1111-111111111111',
            name: 'Ido Agro Precision Farm',
            slug: 'ido-agro-precision-farm',
            description:
              'A high-tech horticulture and vegetable production farm situated in Ido LGA, Ibadan. Equipped with solar drip irrigation.',
            state: 'Oyo',
            lga: 'Ido',
            address_description: 'Off Eleyele-Eruwa Road, Ido LGA, Ibadan',
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
          {
            id: 'a2222222-2222-2222-2222-222222222222',
            name: 'Akinyele Organic Agri-Hub',
            slug: 'akinyele-organic-agri-hub',
            description:
              'Located along the IITA agricultural corridor in Akinyele, Ibadan. Specializes in organic open-field and semi-protected cultivation.',
            state: 'Oyo',
            lga: 'Akinyele',
            address_description: 'Near Moniya Station, Akinyele LGA, Ibadan',
            latitude: 7.5312,
            longitude: 3.9145,
            total_area_sqm: 45000,
            available_area_sqm: 32000,
            soil_type: 'Rich Alluvial Loam',
            water_source: 'River Dam & Solar Pump',
            is_verified: true,
            cover_image_url:
              'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
            gallery_urls: [],
          },
        ]);
      }
    } catch (e) {
      console.warn('Discovery fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFarms = farms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.lga.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLga = selectedLga === 'All' || f.lga === selectedLga;
    return matchesSearch && matchesLga;
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === 'crops'
              ? 'Search crops (e.g. Tomato, Pepper)...'
              : 'Search farms by name or LGA...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      {/* Tabs Switcher: Crops vs Farms */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'crops' && styles.activeTabButton]}
          onPress={() => setActiveTab('crops')}
        >
          <Sprout
            size={16}
            color={activeTab === 'crops' ? Colors.text.inverse : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'crops' && styles.activeTabText,
            ]}
          >
            Available Crops ({crops.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'farms' && styles.activeTabButton]}
          onPress={() => setActiveTab('farms')}
        >
          <MapPin
            size={16}
            color={activeTab === 'farms' ? Colors.text.inverse : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'farms' && styles.activeTabText,
            ]}
          >
            Partner Farms ({farms.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LGA Filter Pills (when farms tab is active) */}
      {activeTab === 'farms' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lgaFilterRow}
        >
          {['All', 'Ido', 'Akinyele', 'Oluyole'].map((lga) => (
            <TouchableOpacity
              key={lga}
              style={[
                styles.lgaPill,
                selectedLga === lga && styles.activeLgaPill,
              ]}
              onPress={() => setSelectedLga(lga)}
            >
              <Text
                style={[
                  styles.lgaPillText,
                  selectedLga === lga && styles.activeLgaPillText,
                ]}
              >
                {lga === 'All' ? 'All LGAs' : `${lga} LGA`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'crops' ? (
            filteredCrops.map((crop) => (
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
                <View style={styles.cropDetails}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.cropCategory}>
                      {crop.category.toUpperCase()}
                    </Text>
                    <Text style={styles.cropSeason}>
                      {crop.planting_season}
                    </Text>
                  </View>

                  <Text style={styles.cropTitle}>{crop.name}</Text>
                  <Text style={styles.cropDesc} numberOfLines={2}>
                    {crop.description}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={13} color={Colors.primary} />
                      <Text style={styles.metaText}>
                        {crop.growth_duration_days} Days
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Droplets size={13} color={Colors.primaryLight} />
                      <Text style={styles.metaText}>
                        {crop.water_requirement} Water
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.viewPackagesText}>
                      View Production Packages
                    </Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            filteredFarms.map((farm) => (
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
                <View style={styles.farmDetails}>
                  <View style={styles.farmHeader}>
                    <Text style={styles.farmName}>{farm.name}</Text>
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck size={14} color={Colors.primary} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>

                  <Text style={styles.farmLocation}>
                    {farm.address_description}
                  </Text>

                  <View style={styles.farmAttributes}>
                    <Text style={styles.attributePill}>
                      Soil: {farm.soil_type}
                    </Text>
                    <Text style={styles.attributePill}>
                      {farm.water_source}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.viewPackagesText}>
                      Explore Plots & Infrastructure
                    </Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.inverse,
  },
  lgaFilterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  lgaPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeLgaPill: {
    backgroundColor: Colors.primaryFaint,
    borderColor: Colors.primaryLight,
  },
  lgaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  activeLgaPillText: {
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  cropCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cropImage: {
    width: '100%',
    height: 140,
  },
  cropDetails: {
    padding: Spacing.md,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropCategory: {
    ...Typography.badge,
    color: Colors.accent,
  },
  cropSeason: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  cropTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  cropDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: 6,
  },
  viewPackagesText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  farmCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  farmImage: {
    width: '100%',
    height: 140,
  },
  farmDetails: {
    padding: Spacing.md,
    gap: 6,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmName: {
    ...Typography.heading2,
    color: Colors.text.primary,
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
  farmLocation: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  farmAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  attributePill: {
    fontSize: 11,
    backgroundColor: Colors.surfaceSubtle,
    color: Colors.text.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
});
