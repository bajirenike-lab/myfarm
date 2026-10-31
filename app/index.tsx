import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, BorderRadius } from '@/constants/theme';
import { userMode } from '@/services/userMode';
import { supabase } from '@/lib/supabase';
import {
  Tractor,
  ShoppingBag,
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  HeartHandshake,
  Leaf,
  Clock,
  Sparkles,
  HelpCircle,
  User,
  Award,
  PhoneCall,
  ExternalLink,
} from 'lucide-react-native';

const HERO_SLIDES = [
  {
    id: 1,
    badge: '🚜 MANAGED URBAN FARMING',
    title: 'Own a Real Farm Plot in 3 Minutes',
    subtitle:
      'Hire a verified local farmer to plant and cultivate crops for you. Watch weekly photo updates on WhatsApp and enjoy fresh harvest or cash profit.',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    primaryAction: 'Start a Farm Plot',
    route: '/start-farm',
    intent: 'farm_owner' as const,
    stat: '38.5% Est. Harvest Profit',
  },
  {
    id: 2,
    badge: '🛒 DIRECT FROM FARMS',
    title: 'Farm-Fresh Food Delivered to Your Door',
    subtitle:
      'Skip the market chaos, bad produce, and retail markups. Freshly harvested Roma tomatoes, peppers, and sweet corn delivered straight to your home.',
    image:
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
    primaryAction: 'Shop Fresh Food',
    route: '/(tabs)/marketplace',
    intent: 'food_buyer' as const,
    stat: 'Same-Day Doorstep Delivery',
  },
  {
    id: 3,
    badge: '👨‍🌾 RURAL PROSPERITY & DIGNITY',
    title: 'Empowering Local Farmers With Funding & Fair Pay',
    subtitle:
      'We partner with rural smallholders, funding 100% of their seeds, fertilizer, and solar drip irrigation while giving them guaranteed income.',
    image:
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
    primaryAction: 'Become a Partner Farmer',
    route: '/farmer-onboarding',
    intent: 'farm_owner' as const,
    stat: '100% Upfront Input Funding',
  },
];

const FAQS = [
  {
    q: 'Do I need any farming experience to own a farm plot?',
    a: 'Not at all! You do not need to lift a hoe or touch dirt. Our verified local farmers handle 100% of the manual labor — from soil preparation and planting to weeding and watering. Certified agronomists inspect every plot weekly to ensure optimum crop health.',
  },
  {
    q: 'How do I know what is happening on my farm plot?',
    a: 'Complete transparency is our core promise. Every key milestone (soil preparation, transplanting, foliar feeding, weeding, and fruiting) is photographed with time and GPS stamps. You receive visual photo reports and alerts directly on your phone via WhatsApp.',
  },
  {
    q: 'What happens when harvest day arrives?',
    a: 'You have full control over your harvest. You can choose to have crates of fresh, chemical-free food delivered straight to your home or restaurant, OR we sell your produce on the open food market on your behalf and credit your Nigerian bank account via instant transfer.',
  },
  {
    q: 'Can I visit my farm plot physically?',
    a: 'Yes, absolutely! Sponsors and farm owners are welcome to schedule a guided weekend visit to walk their plot, inspect their crops, and meet their assigned farmer in person.',
  },
  {
    q: 'I am a local farmer with land. How do I join MyFarm?',
    a: 'Simply click "Become a Partner Farmer" and register your details. Our field team will inspect your farmland, test the soil and water source, and match you with city sponsors who fund all your seeds, fertilizers, and irrigation while paying you guaranteed wages.',
  },
];

export default function UnifiedLandingScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleNavigate = (path: string, intent?: 'farm_owner' | 'food_buyer') => {
    setMenuOpen(false);
    if (intent) {
      userMode.setIntent(intent);
    }
    router.push(path as any);
  };

  const handleOpenWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hello MyFarm Team! I would like to learn more about owning a farm plot and fresh food delivery.'
    );
    Linking.openURL(`https://wa.me/2348000000000?text=${msg}`).catch(() => {});
  };

  const currentSlideData = HERO_SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP HEADER NAVIGATION - CLEAN & RESPONSIVE */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {/* Brand Logo - Simple & Clear */}
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.logoBadge}>
              <Tractor size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>MyFarm</Text>
              <Text style={styles.brandSubtitle}>AGRICULTURE FOR EVERYONE</Text>
            </View>
          </TouchableOpacity>

          {/* Right Header Navigation - ALWAYS VISIBLE HAMBURGER BUTTON */}
          <View style={styles.headerRight}>
            {currentUser ? (
              <TouchableOpacity
                style={styles.accountBtn}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={14} color={Colors.primary} />
                <Text style={styles.accountBtnText}>Account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.signInBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}

            {/* Prominent High-Contrast Hamburger Menu Button */}
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="Open Navigation Menu"
              activeOpacity={0.85}
            >
              <Menu size={18} color="#FFFFFF" />
              <Text style={styles.hamburgerBtnText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PILOT STATUS PILL - DISPLAYED NATURALLY AT TOP */}
        <View style={styles.pilotBadgeContainer}>
          <View style={styles.pilotBadge}>
            <View style={styles.pilotDot} />
            <Text style={styles.pilotBadgeText}>
              Live Pilot Active in Oyo State • Scaling Nationwide
            </Text>
          </View>
        </View>

        {/* HERO CAROUSEL / SLIDER */}
        <View style={styles.heroWrapper}>
          <View style={styles.sliderCard}>
            <Image
              source={{ uri: currentSlideData.image }}
              style={styles.sliderImage}
              resizeMode="cover"
            />
            <View style={styles.sliderOverlay} />

            <View style={styles.sliderContent}>
              <View style={styles.sliderBadgeRow}>
                <View style={styles.sliderBadge}>
                  <Sparkles size={11} color="#FEF3C7" />
                  <Text style={styles.sliderBadgeText}>{currentSlideData.badge}</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>{currentSlideData.stat}</Text>
                </View>
              </View>

              <Text style={styles.sliderTitle}>{currentSlideData.title}</Text>
              <Text style={styles.sliderSubtitle}>{currentSlideData.subtitle}</Text>

              <View style={styles.sliderActionsRow}>
                <TouchableOpacity
                  style={styles.sliderPrimaryBtn}
                  onPress={() => handleNavigate(currentSlideData.route, currentSlideData.intent)}
                  activeOpacity={0.88}
                >
                  <Text style={styles.sliderPrimaryBtnText}>
                    {currentSlideData.primaryAction}
                  </Text>
                  <ArrowRight size={16} color="#0F172A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sliderSecondaryBtn}
                  onPress={() => {
                    if (currentSlideData.intent === 'food_buyer') {
                      handleNavigate('/start-farm', 'farm_owner');
                    } else {
                      handleNavigate('/(tabs)/marketplace', 'food_buyer');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sliderSecondaryBtnText}>
                    {currentSlideData.intent === 'food_buyer'
                      ? 'Own a Farm Plot →'
                      : 'Shop Fresh Food →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Slider Dots */}
            <View style={styles.sliderDotsRow}>
              {HERO_SLIDES.map((slide, idx) => (
                <TouchableOpacity
                  key={slide.id}
                  style={[
                    styles.sliderDot,
                    activeSlide === idx ? styles.sliderDotActive : null,
                  ]}
                  onPress={() => setActiveSlide(idx)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 2X2 RESPONSIVE IMPACT GRID - PERFECTLY ALIGNED */}
        <View style={styles.impactSection}>
          <View style={styles.impactGrid}>
            <View style={styles.impactCardItem}>
              <Text style={styles.impactNumber}>100%</Text>
              <Text style={styles.impactLabel}>Managed Farm Labor</Text>
            </View>
            <View style={styles.impactCardItem}>
              <Text style={styles.impactNumber}>~90 Days</Text>
              <Text style={styles.impactLabel}>From Seed to Harvest</Text>
            </View>
            <View style={styles.impactCardItem}>
              <Text style={styles.impactNumber}>Farm-Gate ₦</Text>
              <Text style={styles.impactLabel}>Zero Retail Inflation</Text>
            </View>
            <View style={styles.impactCardItem}>
              <Text style={styles.impactNumber}>Instant ⚡</Text>
              <Text style={styles.impactLabel}>Bank Payouts via NIP</Text>
            </View>
          </View>
        </View>

        {/* 3. THE MYFARM STORY (CONVERSATIONAL & HUMAN WITH LINE BREAKS) */}
        <View style={styles.storySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagGreen}>
              <Leaf size={12} color="#16a34a" />
              <Text style={styles.sectionTagGreenText}>WHY WE BUILT MYFARM</Text>
            </View>
            <Text style={styles.sectionBigTitle}>We Noticed a Real Problem in Nigeria...</Text>
            <Text style={styles.sectionSubText}>
              And we decided to build a simple, honest way to fix it for both city families and local farmers.
            </Text>
          </View>

          <View style={styles.storyGrid}>
            {/* 1. The City Struggle */}
            <View style={styles.storyCard}>
              <View style={styles.storyIconBoxRed}>
                <Clock size={20} color="#DC2626" />
              </View>
              <Text style={styles.storyColTitle}>The Struggle for People in the City</Text>
              
              <Text style={styles.storyLineText}>
                • You work hard all week and want your family to eat fresh, healthy food.
              </Text>
              <Text style={styles.storyLineText}>
                • But you're busy at work, stuck in traffic, and have zero land to farm.
              </Text>
              <Text style={styles.storyLineText}>
                • You cannot leave your job to clear bush under the hot sun.
              </Text>
              <Text style={styles.storyLineText}>
                • At the market, food prices keep soaring, and you have no idea what chemicals were sprayed on the produce.
              </Text>
            </View>

            {/* 2. The Farmer Reality */}
            <View style={styles.storyCard}>
              <View style={styles.storyIconBoxAmber}>
                <Sprout size={20} color="#D97706" />
              </View>
              <Text style={styles.storyColTitle}>The Reality for Our Local Farmers</Text>

              <Text style={styles.storyLineText}>
                • In rural villages, skilled local farmers have good fertile land and know how to plant.
              </Text>
              <Text style={styles.storyLineText}>
                • But they lack money to buy certified seeds, fertilizers, or solar water pumps.
              </Text>
              <Text style={styles.storyLineText}>
                • Middlemen buy their hard harvest for peanuts, leaving the farmer empty-handed.
              </Text>
              <Text style={styles.storyLineText}>
                • Good food spoils along the road because farmers have no direct link to buyers in the city.
              </Text>
            </View>

            {/* 3. The MyFarm Solution */}
            <View style={[styles.storyCard, styles.storyCardHighlight]}>
              <View style={styles.storyIconBoxGreen}>
                <HeartHandshake size={20} color="#16A34A" />
              </View>
              <Text style={[styles.storyColTitle, { color: Colors.primary }]}>
                The Solution: How MyFarm Connects Both
              </Text>

              <Text style={[styles.storyLineText, { color: '#133E2B' }]}>
                • <Text style={{ fontWeight: '700' }}>You sponsor the plot:</Text> You fund the seeds and inputs in 3 minutes online.
              </Text>
              <Text style={[styles.storyLineText, { color: '#133E2B' }]}>
                • <Text style={{ fontWeight: '700' }}>A vetted farmer works:</Text> An experienced local farmer handles the daily soil prep, planting, and watering.
              </Text>
              <Text style={[styles.storyLineText, { color: '#133E2B' }]}>
                • <Text style={{ fontWeight: '700' }}>You watch on WhatsApp:</Text> Receive real, time-stamped photo updates as crops grow.
              </Text>
              <Text style={[styles.storyLineText, { color: '#133E2B' }]}>
                • <Text style={{ fontWeight: '700' }}>Eat fresh or cash out:</Text> Get fresh crates delivered to your kitchen door, or we sell it on the market and send cash straight to your bank account.
              </Text>
              <Text style={[styles.storyLineText, { color: '#15803d', fontWeight: '700', marginTop: 4 }]}>
                ✓ Everyone wins: Your family eats clean, the farmer earns guaranteed income, and Nigeria feeds itself.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. THE 3 GATEWAYS ("FIND YOUR ROUTE") */}
        <View style={styles.gatewaysSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagAmber}>
              <Sparkles size={12} color="#D97706" />
              <Text style={styles.sectionTagAmberText}>FIND YOUR ROUTE</Text>
            </View>
            <Text style={styles.sectionBigTitle}>How Would You Like to Use MyFarm?</Text>
            <Text style={styles.sectionSubText}>
              Select the path that matches what you want to achieve today. You can always change your role anytime.
            </Text>
          </View>

          <View style={styles.gatewayCardsRow}>
            {/* GATEWAY 1: OWN A FARM */}
            <View style={[styles.gatewayCard, styles.gatewayCardGreen]}>
              <View style={styles.gatewayHeader}>
                <View style={[styles.gatewayIconCircle, { backgroundColor: '#133E2B' }]}>
                  <Tractor size={22} color="#FFFFFF" />
                </View>
                <View style={styles.gatewayHeaderTexts}>
                  <View style={styles.pillGreen}>
                    <Text style={styles.pillGreenText}>MOST POPULAR</Text>
                  </View>
                  <Text style={styles.gatewayTitle}>🚜 I Want to Own a Farm</Text>
                </View>
              </View>

              <Text style={styles.gatewayDesc}>
                Hire a verified local farmer to cultivate crops for you. You own the plot, monitor weekly photo logs on WhatsApp, and decide whether to eat the harvest or sell it for cash profit.
              </Text>

              <View style={styles.gatewayFeatureList}>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#16a34a" />
                  <Text style={styles.featureText}>Verified farm plots with rich organic soil</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#16a34a" />
                  <Text style={styles.featureText}>High-yield Roma Tomatoes, Peppers & Sweet Corn</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#16a34a" />
                  <Text style={styles.featureText}>Keep your harvest or sell for cash payouts (₦)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#16a34a" />
                  <Text style={styles.featureText}>Zero farming experience needed — we handle the labor</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.gatewayActionBtn, { backgroundColor: Colors.primary }]}
                onPress={() => handleNavigate('/start-farm', 'farm_owner')}
                activeOpacity={0.88}
              >
                <Text style={styles.gatewayActionBtnText}>Start a Farm Plot Now</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gatewaySecondaryLink}
                onPress={() => handleNavigate('/calculator')}
              >
                <Text style={styles.gatewaySecondaryLinkText}>
                  Use Production & ROI Calculator →
                </Text>
              </TouchableOpacity>
            </View>

            {/* GATEWAY 2: BUY FRESH FOOD */}
            <View style={[styles.gatewayCard, styles.gatewayCardAmber]}>
              <View style={styles.gatewayHeader}>
                <View style={[styles.gatewayIconCircle, { backgroundColor: '#D97706' }]}>
                  <ShoppingBag size={22} color="#FFFFFF" />
                </View>
                <View style={styles.gatewayHeaderTexts}>
                  <View style={styles.pillAmber}>
                    <Text style={styles.pillAmberText}>FOR HOMES & RESTAURANTS</Text>
                  </View>
                  <Text style={styles.gatewayTitle}>🛒 I Want to Buy Fresh Food</Text>
                </View>
              </View>

              <Text style={styles.gatewayDesc}>
                Skip retail inflation and bruised market produce. Buy freshly harvested vegetables, tubers, and grains directly from farm harvests delivered same-day to your doorstep.
              </Text>

              <View style={styles.gatewayFeatureList}>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#d97706" />
                  <Text style={styles.featureText}>100% farm-fresh (harvested the same morning)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#d97706" />
                  <Text style={styles.featureText}>True farm-gate prices (up to 25% cheaper)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#d97706" />
                  <Text style={styles.featureText}>Reliable doorstep delivery in cold-chain crates</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#d97706" />
                  <Text style={styles.featureText}>Secure payment with Bank Transfer or Card</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.gatewayActionBtn, { backgroundColor: '#D97706' }]}
                onPress={() => handleNavigate('/(tabs)/marketplace', 'food_buyer')}
                activeOpacity={0.88}
              >
                <Text style={styles.gatewayActionBtnText}>Shop Fresh Harvest</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gatewaySecondaryLink}
                onPress={() => handleNavigate('/(auth)/register?mode=food_buyer')}
              >
                <Text style={[styles.gatewaySecondaryLinkText, { color: '#B45309' }]}>
                  Create Free Buyer Account →
                </Text>
              </TouchableOpacity>
            </View>

            {/* GATEWAY 3: PARTNER FARMER */}
            <View style={[styles.gatewayCard, styles.gatewayCardSlate]}>
              <View style={styles.gatewayHeader}>
                <View style={[styles.gatewayIconCircle, { backgroundColor: '#1E293B' }]}>
                  <Sprout size={22} color="#FFFFFF" />
                </View>
                <View style={styles.gatewayHeaderTexts}>
                  <View style={styles.pillSlate}>
                    <Text style={styles.pillSlateText}>FOR PHYSICAL FARMERS</Text>
                  </View>
                  <Text style={styles.gatewayTitle}>👨‍🌾 Become a Partner Farmer</Text>
                </View>
              </View>

              <Text style={styles.gatewayDesc}>
                Do you have farmland and agricultural passion? Partner with MyFarm. City sponsors fund 100% of your seeds, fertilizer, and solar drip irrigation while you earn guaranteed pay and harvest bonuses.
              </Text>

              <View style={styles.gatewayFeatureList}>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#475569" />
                  <Text style={styles.featureText}>100% upfront inputs (certified seeds & fertilizers)</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#475569" />
                  <Text style={styles.featureText}>Guaranteed monthly labor wages + profit share</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#475569" />
                  <Text style={styles.featureText}>Free solar irrigation setup & agronomist training</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={15} color="#475569" />
                  <Text style={styles.featureText}>Works offline on simple phones via SMS & Field PWA</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.gatewayActionBtn, { backgroundColor: '#1E293B' }]}
                onPress={() => handleNavigate('/farmer-onboarding')}
                activeOpacity={0.88}
              >
                <Text style={styles.gatewayActionBtnText}>Apply as a Partner Farmer</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gatewaySecondaryLink}
                onPress={() => handleNavigate('/farmer-log')}
              >
                <Text style={[styles.gatewaySecondaryLinkText, { color: '#334155' }]}>
                  Open Farmer Field App (Offline Mode) →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. HOW MYFARM WORKS (CLEAN BULLET POINTS) */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagGreen}>
              <Sparkles size={12} color="#16a34a" />
              <Text style={styles.sectionTagGreenText}>HOW IT WORKS</Text>
            </View>
            <Text style={styles.sectionBigTitle}>Simple 4-Step Process</Text>
            <Text style={styles.sectionSubText}>
              A transparent, dependable system that takes you from seed to table without the hard manual labor.
            </Text>
          </View>

          <View style={styles.stepsFlow}>
            {/* Step 1 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>01</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>Pick Your Plot & Crop</Text>
                  <Text style={styles.stepSubMain}>Select land size & high-demand produce</Text>
                </View>
              </View>
              <View style={styles.stepBulletsList}>
                <Text style={styles.stepBulletItem}>
                  • Choose Roma Tomatoes, Habanero Pepper, or Golden Sweet Corn.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • Select plot size: 50 sqm (Family plot), 100 sqm, or a quarter acre.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • See transparent setup costs, projected kg yield, and expected profit upfront.
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>02</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>A Local Farmer Does the Hard Work</Text>
                  <Text style={styles.stepSubMain}>Professional care under agronomist checks</Text>
                </View>
              </View>
              <View style={styles.stepBulletsList}>
                <Text style={styles.stepBulletItem}>
                  • We assign a vetted, background-checked local farmer to your plot.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • They clear soil, plant certified seedlings, weed, and irrigate daily with solar pumps.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • Certified agronomists inspect crop health and soil nutrition every week.
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>03</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>Watch Live Progress on WhatsApp</Text>
                  <Text style={styles.stepSubMain}>Time-stamped GPS photo updates</Text>
                </View>
              </View>
              <View style={styles.stepBulletsList}>
                <Text style={styles.stepBulletItem}>
                  • Receive verified photo updates and field logs directly on your WhatsApp.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • Follow germination, flowering, and fruit ripening in real time.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • Optional: Schedule a weekend farm visit anytime to walk your plot in person!
                </Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>04</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>Harvest Day: Eat Fresh or Cash Out</Text>
                  <Text style={styles.stepSubMain}>Your produce, your choice</Text>
                </View>
              </View>
              <View style={styles.stepBulletsList}>
                <Text style={styles.stepBulletItem}>
                  • <Text style={{ fontWeight: '700' }}>Option A (Home Delivery):</Text> Freshly harvested crates delivered to your kitchen door.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • <Text style={{ fontWeight: '700' }}>Option B (Cash Out):</Text> We sell your produce at wholesale market value on your behalf.
                </Text>
                <Text style={styles.stepBulletItem}>
                  • Cash profits are deposited directly into your Nigerian bank account via NIP transfer.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. TRUST & PEACE OF MIND */}
        <View style={styles.trustSection}>
          <View style={styles.trustBanner}>
            <View style={styles.trustHeader}>
              <ShieldCheck size={26} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>The MyFarm Peace of Mind Guarantee</Text>
                <Text style={styles.trustSubtitle}>
                  Built on transparency, strict verification, and genuine human accountability.
                </Text>
              </View>
            </View>

            <View style={styles.trustGrid}>
              <View style={styles.trustItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.trustItemText}>
                  <Text style={{ fontWeight: '700' }}>Physically Vetted Farmland:</Text> Inspected land titles, fertile soil tests, and clean water sources.
                </Text>
              </View>
              <View style={styles.trustItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.trustItemText}>
                  <Text style={{ fontWeight: '700' }}>ID-Verified Farmers:</Text> Background-checked with National ID and biometric validation.
                </Text>
              </View>
              <View style={styles.trustItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.trustItemText}>
                  <Text style={{ fontWeight: '700' }}>Solar Drip Irrigation:</Text> Crops do not depend on erratic rain. Solar pumps water crops daily.
                </Text>
              </View>
              <View style={styles.trustItem}>
                <CheckCircle size={15} color="#16a34a" />
                <Text style={styles.trustItemText}>
                  <Text style={{ fontWeight: '700' }}>Direct Bank Transfers:</Text> Marketplace sales are paid directly to your Nigerian bank account via NIP transfer.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagGreen}>
              <HelpCircle size={12} color="#16a34a" />
              <Text style={styles.sectionTagGreenText}>ANSWERS & CLARITY</Text>
            </View>
            <Text style={styles.sectionBigTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubText}>
              Got questions? Here are honest, direct answers to what people ask us most.
            </Text>
          </View>

          <View style={styles.faqList}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <View key={idx} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    onPress={() => setOpenFaq(isOpen ? null : idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    {isOpen ? (
                      <ChevronUp size={18} color={Colors.primary} />
                    ) : (
                      <ChevronDown size={18} color={Colors.text.muted} />
                    )}
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 8. CONTACT US & WHATSAPP SUPPORT - FULLY RESPONSIVE */}
        <View style={styles.contactSection}>
          <View style={styles.contactCard}>
            <View style={styles.contactIconCircle}>
              <MessageCircle size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.contactTitle}>Have Questions or Want a Custom Farm?</Text>
            <Text style={styles.contactSubtitle}>
              Our team is available to guide you, answer questions about plot availability, and discuss partnership options.
            </Text>

            <View style={styles.contactButtonsRow}>
              <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={handleOpenWhatsApp}
                activeOpacity={0.88}
              >
                <MessageCircle size={17} color="#FFFFFF" />
                <Text style={styles.whatsappBtnText}>Chat with Us on WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailBtn}
                onPress={() => Linking.openURL('mailto:hello@myfarm.ng')}
                activeOpacity={0.8}
              >
                <PhoneCall size={15} color={Colors.primary} />
                <Text style={styles.emailBtnText}>hello@myfarm.ng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 9. FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <View style={styles.logoBadgeSmall}>
              <Tractor size={15} color="#FFFFFF" />
            </View>
            <Text style={styles.footerBrandText}>MyFarm</Text>
          </View>
          <Text style={styles.footerTagline}>
            Empowering everyone to own a farm, eat fresh food, and support hardworking rural farmers.
          </Text>

          <View style={styles.footerLinksGrid}>
            <TouchableOpacity onPress={() => handleNavigate('/start-farm', 'farm_owner')}>
              <Text style={styles.footerLink}>Own a Farm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('/(tabs)/marketplace', 'food_buyer')}>
              <Text style={styles.footerLink}>Buy Fresh Food</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('/farmer-onboarding')}>
              <Text style={styles.footerLink}>Become a Farmer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('/calculator')}>
              <Text style={styles.footerLink}>ROI Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} MyFarm. Built for Nigeria and beyond. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* 10. SLIDE-OUT HAMBURGER NAVIGATION DRAWER / MODAL */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.drawerCard}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <Tractor size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>MyFarm</Text>
                  <Text style={styles.brandSubtitle}>QUICK NAVIGATION</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setMenuOpen(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.drawerScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Menu Section 1: Main Routes */}
              <Text style={styles.drawerSectionLabel}>MAIN GATEWAYS</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/start-farm', 'farm_owner')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#EAF3ED' }]}>
                  <Tractor size={18} color="#133E2B" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>I Want to Own a Farm</Text>
                  <Text style={styles.drawerItemSub}>Hire a local farmer to cultivate for you</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/(tabs)/marketplace', 'food_buyer')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <ShoppingBag size={18} color="#D97706" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>I Want to Buy Fresh Food</Text>
                  <Text style={styles.drawerItemSub}>Farm-gate produce delivered to your door</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/farmer-onboarding')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <Sprout size={18} color="#334155" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>Become a Partner Farmer</Text>
                  <Text style={styles.drawerItemSub}>Get funded & cultivate for city sponsors</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/calculator')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Sparkles size={18} color="#0284C7" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>Production & ROI Calculator</Text>
                  <Text style={styles.drawerItemSub}>Calculate yield, setup cost & harvest value</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Menu Section 2: Explore & Tools */}
              <Text style={styles.drawerSectionLabel}>EXPLORE & TOOLS</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/(tabs)')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Leaf size={18} color="#16A34A" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>Farm Owner Cockpit & Weather</Text>
                  <Text style={styles.drawerItemSub}>Live Ibadan agricultural conditions & active plots</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => handleNavigate('/farmer-log')}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Award size={18} color="#475569" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>Farmer Field App (Offline PWA)</Text>
                  <Text style={styles.drawerItemSub}>Field photo logging tool for local farmers</Text>
                </View>
                <ArrowRight size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Menu Section 3: Contact & Support */}
              <Text style={styles.drawerSectionLabel}>HELP & SUPPORT</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleOpenWhatsApp}
              >
                <View style={[styles.drawerIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <MessageCircle size={18} color="#16A34A" />
                </View>
                <View style={styles.drawerItemTexts}>
                  <Text style={styles.drawerItemTitle}>WhatsApp Helpdesk</Text>
                  <Text style={styles.drawerItemSub}>Chat with our support & operations team</Text>
                </View>
                <ExternalLink size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Account Actions */}
              <View style={styles.drawerAuthRow}>
                {currentUser ? (
                  <TouchableOpacity
                    style={styles.drawerFullBtn}
                    onPress={() => handleNavigate('/(tabs)/profile')}
                  >
                    <User size={16} color="#FFFFFF" />
                    <Text style={styles.drawerFullBtnText}>Open My Account</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.drawerFullBtn}
                    onPress={() => handleNavigate('/(auth)/login')}
                  >
                    <Text style={styles.drawerFullBtnText}>Sign In / Create Account</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
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
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInBtn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: '#C7E2D1',
  },
  signInBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  accountBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  hamburgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburgerBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  pilotBadgeContainer: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pilotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pilotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  pilotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  heroWrapper: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  sliderCard: {
    width: '100%',
    minHeight: 340,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  sliderImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sliderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 17, 0.72)',
  },
  sliderContent: {
    zIndex: 2,
    maxWidth: 600,
  },
  sliderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  sliderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sliderBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 0.5,
  },
  statPill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sliderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 8,
  },
  sliderSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 16,
  },
  sliderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  sliderPrimaryBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  sliderPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sliderSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  sliderSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    zIndex: 2,
  },
  sliderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  sliderDotActive: {
    width: 20,
    backgroundColor: '#F59E0B',
  },
  impactSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  impactCardItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  impactNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  storySection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTagGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sectionTagGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  sectionTagAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sectionTagAmberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  sectionBigTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 6,
  },
  sectionSubText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    maxWidth: 680,
  },
  storyGrid: {
    gap: 14,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storyCardHighlight: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A3D9B8',
    borderWidth: 1.5,
  },
  storyIconBoxRed: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyIconBoxAmber: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyIconBoxGreen: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyColTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  storyLineText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 6,
  },
  gatewaysSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  gatewayCardsRow: {
    gap: 16,
  },
  gatewayCard: {
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
  gatewayCardGreen: {
    borderColor: '#C7E2D1',
  },
  gatewayCardAmber: {
    borderColor: '#FED7AA',
  },
  gatewayCardSlate: {
    borderColor: '#CBD5E1',
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  gatewayIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayHeaderTexts: {
    flex: 1,
  },
  pillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  pillGreenText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803d',
  },
  pillAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  pillAmberText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  pillSlate: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  pillSlateText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#334155',
  },
  gatewayTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  gatewayDesc: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
  },
  gatewayFeatureList: {
    gap: 7,
    backgroundColor: '#F8FAF7',
    padding: 12,
    borderRadius: 11,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  gatewayActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 11,
  },
  gatewayActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  gatewaySecondaryLink: {
    paddingTop: 9,
    alignItems: 'center',
  },
  gatewaySecondaryLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  howItWorksSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  stepsFlow: {
    gap: 12,
  },
  stepCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepHeadingWrap: {
    flex: 1,
  },
  stepTitleMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepSubMain: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  stepBulletsList: {
    gap: 4,
    paddingLeft: 4,
  },
  stepBulletItem: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  trustSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  trustBanner: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  trustTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#15803d',
  },
  trustSubtitle: {
    fontSize: 12.5,
    color: '#166534',
    marginTop: 2,
    lineHeight: 17,
  },
  trustGrid: {
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  trustItemText: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
    flex: 1,
  },
  faqSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  contactSection: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  contactCard: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    textAlign: 'center',
  },
  contactIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#C7E2D1',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 19,
    marginBottom: 18,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  whatsappBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emailBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emailBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  footerBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  footerTagline: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 450,
    marginBottom: 16,
    lineHeight: 18,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 18,
  },
  footerLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  footerCopy: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // MODAL DRAWER STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawerCard: {
    width: '85%',
    maxWidth: 360,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  drawerSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  drawerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemTexts: {
    flex: 1,
  },
  drawerItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  drawerAuthRow: {
    marginTop: 20,
    marginBottom: 36,
  },
  drawerFullBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 11,
  },
  drawerFullBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
