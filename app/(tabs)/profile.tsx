import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  User,
  Award,
  Share2,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Shovel,
  Smartphone,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    fullName: string;
    email: string;
    referralCode: string;
  }>({
    fullName: 'Babatunde Adeleke',
    email: 'b.adeleke@gmail.com',
    referralCode: 'MYFARM-IBADAN-74',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          fullName: user.user_metadata?.full_name || 'Babatunde Adeleke',
          email: user.email || 'b.adeleke@gmail.com',
          referralCode: 'MYFARM-IBADAN-74',
        });
      }
    });
  }, []);

  const handleShareReferral = () => {
    Alert.alert(
      'Referral Code Copied! 🎁',
      `Share your referral code "${profile.referralCode}" with friends and family in Ibadan. When they fund their first plot, you both receive production credits!`
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {profile.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>VERIFIED URBAN FARMER</Text>
          </View>
        </View>
      </View>

      {/* Agricultural Impact Stats */}
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Your Agricultural Impact</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>215 kg</Text>
            <Text style={styles.statLabel}>Fresh Produce Grown</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>₦45,000</Text>
            <Text style={styles.statLabel}>Est. Market Savings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>1 Farm</Text>
            <Text style={styles.statLabel}>Local Smallholder Supported</Text>
          </View>
        </View>
      </View>

      {/* Farming Achievement Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farming Achievements</Text>
        <View style={styles.badgeGrid}>
          <View style={[styles.badgeItem, styles.badgeActive]}>
            <Text style={styles.badgeEmoji}>🌱</Text>
            <Text style={styles.badgeName}>First Sprout</Text>
            <Text style={styles.badgeDesc}>Funded 1st plot</Text>
          </View>
          <View style={[styles.badgeItem, styles.badgeActive]}>
            <Text style={styles.badgeEmoji}>🍅</Text>
            <Text style={styles.badgeName}>Tomato Pro</Text>
            <Text style={styles.badgeDesc}>Ido Farm Cycle</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>⭐</Text>
            <Text style={styles.badgeName}>Zero Waste</Text>
            <Text style={styles.badgeDesc}>100% Sold/Eaten</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <Text style={styles.badgeName}>Agri Master</Text>
            <Text style={styles.badgeDesc}>3+ Crop Cycles</Text>
          </View>
        </View>
      </View>

      {/* Referral Card */}
      <View style={styles.referralCard}>
        <View style={styles.referralContent}>
          <Sparkles size={20} color={Colors.accentGold} />
          <View style={styles.referralTextGroup}>
            <Text style={styles.referralTitle}>Invite Friends in Ibadan</Text>
            <Text style={styles.referralCodeText}>{profile.referralCode}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral}>
          <Share2 size={16} color={Colors.text.inverse} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings Menu */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/start-farm')}
        >
          <View style={styles.menuItemLeft}>
            <Sprout size={18} color={Colors.primary} />
            <Text style={[styles.menuItemText, { fontWeight: '700', color: Colors.primary }]}>
              🌱 Own a Farm (Hire a Farmer)
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/farmer-onboarding')}
        >
          <View style={styles.menuItemLeft}>
            <Shovel size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>
              🌾 Join as a Partner Farmer
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/farmer-log')}
        >
          <View style={styles.menuItemLeft}>
            <Smartphone size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>
              📱 Farmer Field App (Offline PWA)
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/seller-wallet')}
        >
          <View style={styles.menuItemLeft}>
            <CreditCard size={18} color={Colors.primary} />
            <View>
              <Text style={styles.menuItemText}>Seller Wallet & Bank Payouts</Text>
              <Text style={[Typography.caption, { color: '#15803d', fontWeight: '700', fontSize: 11 }]}>
                ₦117,087 Available for Payout
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/notifications')}
        >
          <View style={styles.menuItemLeft}>
            <Bell size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>Notifications & SMS Alerts</Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/gateway-settings')}
        >
          <View style={styles.menuItemLeft}>
            <Smartphone size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>API Gateways (Termii SMS & Paystack)</Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Shield size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>Production Terms & Conditions</Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <HelpCircle size={18} color={Colors.primary} />
            <Text style={styles.menuItemText}>Help & Farm Operations Support</Text>
          </View>
          <ChevronRight size={18} color={Colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={18} color={Colors.status.error} />
            <Text style={[styles.menuItemText, { color: Colors.status.error }]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  profileEmail: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  impactCard: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  impactTitle: {
    ...Typography.captionBold,
    color: Colors.accentGold,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    gap: Spacing.xs + 2,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
  },
  badgeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    opacity: 0.5,
  },
  badgeActive: {
    opacity: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryFaint,
  },
  badgeEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 9,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  referralCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accentGold,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  referralTextGroup: {
    gap: 2,
  },
  referralTitle: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  referralCodeText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  shareBtnText: {
    ...Typography.captionBold,
    color: Colors.text.inverse,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
});
