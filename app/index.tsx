import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { userMode } from '@/services/userMode';
import { supabase } from '@/lib/supabase';
import {
  Tractor,
  ShoppingBag,
  Sprout,
  ArrowRight,
  ShieldCheck,
  MapPin,
  CheckCircle,
  PhoneCall,
  ChevronRight,
  Sparkles,
  HelpCircle,
  User,
  ExternalLink,
} from 'lucide-react-native';

export default function UnifiedLandingScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleSelectOwnFarm = () => {
    userMode.setIntent('farm_owner');
    router.push('/start-farm');
  };

  const handleSelectBuyFood = () => {
    userMode.setIntent('food_buyer');
    router.push('/(tabs)/marketplace');
  };

  const handleSelectFarmer = () => {
    router.push('/farmer-onboarding');
  };

  const handleGoToDashboard = () => {
    userMode.setIntent('farm_owner');
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header / Navigation Bar */}
        <View style={styles.topNav}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Tractor size={20} color={Colors.surface} />
            </View>
            <View>
              <Text style={styles.brandTitle}>MyFarm</Text>
              <View style={styles.locationPill}>
                <MapPin size={10} color="#16a34a" />
                <Text style={styles.locationPillText}>Ibadan, Oyo State</Text>
              </View>
            </View>
          </View>

          <View style={styles.navActions}>
            {currentUser ? (
              <TouchableOpacity
                style={styles.accountBtn}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={16} color={Colors.primary} />
                <Text style={styles.accountBtnText}>My Account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.signInBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.liveTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTagText}>LIVE IN IBADAN • VERIFIED FARMS</Text>
          </View>

          <Text style={styles.heroTitle}>
            Own a Farm Without Farming, or Buy Fresh Food Straight From Local Farms.
          </Text>

          <Text style={styles.heroSubtitle}>
            Welcome to the central gateway. Choose what you want to do today in simple, transparent steps:
          </Text>
        </View>

        {/* THE 3 ROUTE PATH CARDS ("The Bus Stop") */}
        <View style={styles.routeCardsContainer}>
          {/* ROUTE 1: OWN A FARM */}
          <View style={[styles.routeCard, styles.routeCardFarm]}>
            <View style={styles.cardHeader}>
              <View style={[styles.routeIconBox, { backgroundColor: '#133E2B' }]}>
                <Tractor size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <View style={styles.pillBadgeGreen}>
                  <Text style={styles.pillBadgeGreenText}>FOR CITIZENS & SPONSORS</Text>
                </View>
                <Text style={styles.cardTitle}>🚜 I Want to Own a Farm</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              Hire a verified local farmer in Ibadan to cultivate crops, manage your plot, and plant for you.
              You track progress via WhatsApp photo logs, and you can keep the fresh harvest or sell it for cash profit.
            </Text>

            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.benefitText}>Verified farm plots in Ido & Akinyele</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.benefitText}>Roma Tomatoes, Habanero Pepper, Sweet Corn</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.benefitText}>Keep your harvest or sell for cash (₦)</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.benefitText}>Zero farm experience needed — farmer handles labor</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryRouteBtn}
              onPress={handleSelectOwnFarm}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryRouteBtnText}>Start a Farm Plot</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryTextLink}
              onPress={handleGoToDashboard}
            >
              <Text style={styles.secondaryTextLinkText}>
                Or explore live farm cockpit & estimator →
              </Text>
            </TouchableOpacity>
          </View>

          {/* ROUTE 2: BUY FRESH FOOD */}
          <View style={[styles.routeCard, styles.routeCardMarket]}>
            <View style={styles.cardHeader}>
              <View style={[styles.routeIconBox, { backgroundColor: '#D97706' }]}>
                <ShoppingBag size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <View style={styles.pillBadgeAmber}>
                  <Text style={styles.pillBadgeAmberText}>FOR HOMES & RESTAURANTS</Text>
                </View>
                <Text style={styles.cardTitle}>🛒 I Want to Buy Fresh Food</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              Buy fresh food straight from local farms at farm-gate prices.
              Harvested fresh the same morning and delivered straight to your doorstep anywhere in Ibadan.
            </Text>

            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#d97706" />
                <Text style={styles.benefitText}>100% farm-fresh (no middlemen, no retail inflation)</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#d97706" />
                <Text style={styles.benefitText}>Crates of tomatoes, bags of peppers, fresh corn & veggies</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#d97706" />
                <Text style={styles.benefitText}>Doorstep delivery to Bodija, Ring Road, Oluyole, UI, Ido</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#d97706" />
                <Text style={styles.benefitText}>Pay safely via Bank Transfer or Card</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryRouteBtn, { backgroundColor: '#D97706' }]}
              onPress={handleSelectBuyFood}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryRouteBtnText}>Shop Fresh Food</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryTextLink}
              onPress={() => router.push('/(auth)/register?mode=food_buyer')}
            >
              <Text style={[styles.secondaryTextLinkText, { color: '#b45309' }]}>
                Create a buyer account for fast checkout →
              </Text>
            </TouchableOpacity>
          </View>

          {/* ROUTE 3: PARTNER FARMER */}
          <View style={[styles.routeCard, styles.routeCardFarmer]}>
            <View style={styles.cardHeader}>
              <View style={[styles.routeIconBox, { backgroundColor: '#1E293B' }]}>
                <Sprout size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <View style={styles.pillBadgeSlate}>
                  <Text style={styles.pillBadgeSlateText}>FOR PHYSICAL FARMERS IN OYO STATE</Text>
                </View>
                <Text style={styles.cardTitle}>👨‍🌾 I Am a Local Farmer</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              Do you have fertile farmland in Oyo State? Partner with MyFarm to get your land funded.
              City sponsors pay for your quality seeds, fertilizer, and irrigation while you receive guaranteed monthly wages and harvest profit bonuses.
            </Text>

            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#475569" />
                <Text style={styles.benefitText}>100% inputs, quality seeds & fertilizers provided</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#475569" />
                <Text style={styles.benefitText}>Guaranteed labor pay + share of harvest sales</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#475569" />
                <Text style={styles.benefitText}>Free agronomist support & solar irrigation setup</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={15} color="#475569" />
                <Text style={styles.benefitText}>Works offline on 2G with simple SMS logs</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryRouteBtn, { backgroundColor: '#1E293B' }]}
              onPress={handleSelectFarmer}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryRouteBtnText}>Register Your Farmland</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryTextLink}
              onPress={() => router.push('/farmer-log')}
            >
              <Text style={[styles.secondaryTextLinkText, { color: '#334155' }]}>
                Already registered? Open Farmer Field App (Offline PWA) →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HOW IT WORKS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionPreTitle}>HOW MYFARM WORKS</Text>
          <Text style={styles.sectionHeading}>Farming Made Simple for Everyone</Text>

          <View style={styles.stepCard}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Choose Your Crop & Farmland</Text>
              <Text style={styles.stepDesc}>
                Pick what you want to grow (Roma Tomatoes, Pepper, Sweet Corn) and select a verified agro station in Ido or Akinyele.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>A Local Farmer Does the Hard Work</Text>
              <Text style={styles.stepDesc}>
                Experienced local smallholders plant, weed, water, and care for your crops with supervision from licensed agronomists.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Receive Fresh Produce or Cash Payout</Text>
              <Text style={styles.stepDesc}>
                When harvest comes in ~90 days, we deliver fresh crates to your kitchen, or we sell it on the market and credit your Nigerian bank account.
              </Text>
            </View>
          </View>
        </View>

        {/* PEACE OF MIND / GUARANTEES */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteeHeader}>
            <ShieldCheck size={22} color="#16a34a" />
            <Text style={styles.guaranteeTitle}>The MyFarm Peace of Mind</Text>
          </View>
          <Text style={styles.guaranteeText}>
            • 100% Verified Farmland in Oyo State with physical inspection.{'\n'}
            • Full transparency: Know the exact farmer handling your plot.{'\n'}
            • Real-time updates via SMS & WhatsApp.{'\n'}
            • Fast doorstep delivery across Ibadan.
          </Text>
        </View>

        {/* QUICK DEMO & TEST ACCESS */}
        <View style={styles.demoSection}>
          <Text style={styles.demoSectionTitle}>Quick Exploration Links</Text>
          <Text style={styles.demoSectionSubtitle}>
            Want to test specific areas before signing up?
          </Text>

          <View style={styles.demoButtonsGrid}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleGoToDashboard}
            >
              <Tractor size={15} color={Colors.primary} />
              <Text style={styles.demoBtnText}>Farm Cockpit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleSelectBuyFood}
            >
              <ShoppingBag size={15} color={Colors.primary} />
              <Text style={styles.demoBtnText}>Food Market</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => router.push('/farmer-log')}
            >
              <Sprout size={15} color={Colors.primary} />
              <Text style={styles.demoBtnText}>Farmer App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/admin/';
                }
              }}
            >
              <Sparkles size={15} color={Colors.primary} />
              <Text style={styles.demoBtnText}>Admin Portal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>🚜 MyFarm Ibadan</Text>
          <Text style={styles.footerTagline}>
            Connecting city dwellers and food buyers to verified local farmers in Oyo State.
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLinkText}>Register</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push('/farmer-onboarding')}>
              <Text style={styles.footerLinkText}>Farmer Onboarding</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerCopy}>© {new Date().getFullYear()} MyFarm Nigeria. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  scrollContent: {
    paddingBottom: 48,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: '#C7E2D1',
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  accountBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroSection: {
    marginBottom: 24,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  liveTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  routeCardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  routeCardFarm: {
    borderColor: '#C7E2D1',
  },
  routeCardMarket: {
    borderColor: '#FED7AA',
  },
  routeCardFarmer: {
    borderColor: '#CBD5E1',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  routeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTexts: {
    flex: 1,
  },
  pillBadgeGreen: {
    backgroundColor: '#EAF3ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillBadgeGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#133E2B',
  },
  pillBadgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillBadgeAmberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  pillBadgeSlate: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillBadgeSlateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 14,
  },
  benefitList: {
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#F8FAF7',
    padding: 12,
    borderRadius: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  primaryRouteBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryRouteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryTextLink: {
    paddingTop: 10,
    alignItems: 'center',
  },
  secondaryTextLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionPreTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  guaranteeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803d',
  },
  guaranteeText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 21,
  },
  demoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  demoSectionSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 12,
  },
  demoButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: '#C7E2D1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 400,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  footerDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footerCopy: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
