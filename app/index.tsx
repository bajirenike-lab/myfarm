import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Linking,
  Platform,
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
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Play,
  HeartHandshake,
  Leaf,
  Clock,
  Sparkles,
  HelpCircle,
  User,
  MapPin,
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
    a: 'Not at all! You do not need to lift a hoe or touch dirt. Our verified local farmers handle 100% of the manual labor — from soil preparation and planting to weeding and harvesting. Certified agronomists inspect every plot weekly to ensure optimum crop health.',
  },
  {
    q: 'How do I know what is happening on my farm plot?',
    a: 'Complete transparency is our core promise. Every key milestone (soil preparation, transplanting, foliar feeding, weeding, and fruiting) is photographed with time and GPS stamps. You receive visual photo reports and alerts directly on your phone.',
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
      {/* 1. TOP HEADER NAVIGATION */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {/* Brand Logo */}
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.logoBadge}>
              <Tractor size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>MyFarm</Text>
              <Text style={styles.brandSubtitle}>AGRICULTURE FOR EVERYONE</Text>
            </View>
          </TouchableOpacity>

          {/* Pilot Badge (Desktop / Tablet) */}
          <View style={styles.pilotBadge}>
            <View style={styles.pilotDot} />
            <Text style={styles.pilotBadgeText}>Pilot Active: Oyo Agro Hub</Text>
          </View>

          {/* Right Header Controls */}
          <View style={styles.headerRight}>
            {currentUser ? (
              <TouchableOpacity
                style={styles.accountBtn}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={15} color={Colors.primary} />
                <Text style={styles.accountBtnText}>Account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            )}

            {/* Hamburger Menu Toggle Button */}
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={() => setMenuOpen(true)}
              accessibilityLabel="Open Navigation Menu"
            >
              <Menu size={22} color={Colors.primary} />
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
                  <Sparkles size={12} color="#FEF3C7" />
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
                  <ArrowRight size={17} color="#0F172A" />
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

        {/* VALUE PILLARS / IMPACT STATS */}
        <View style={styles.impactBar}>
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>100%</Text>
            <Text style={styles.impactLabel}>Managed Farm Labor</Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>~90</Text>
            <Text style={styles.impactLabel}>Days to Harvest</Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>₦ Farm-Gate</Text>
            <Text style={styles.impactLabel}>Zero Retail Inflation</Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactItem}>
            <Text style={styles.impactNumber}>Instant</Text>
            <Text style={styles.impactLabel}>NIP Bank Payouts</Text>
          </View>
        </View>

        {/* 3. THE MYFARM STORY (THE VISION & PURPOSE) */}
        <View style={styles.storySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagGreen}>
              <Leaf size={12} color="#16a34a" />
              <Text style={styles.sectionTagGreenText}>THE MYFARM STORY & MISSION</Text>
            </View>
            <Text style={styles.sectionBigTitle}>Why We Built MyFarm</Text>
            <Text style={styles.sectionSubText}>
              Bridging the gap between busy city dwellers who crave clean, fresh food and passionate local farmers ready to cultivate.
            </Text>
          </View>

          <View style={styles.storyCard}>
            <View style={styles.storyGrid}>
              {/* Problem Card */}
              <View style={styles.storyColumn}>
                <View style={styles.storyIconBoxRed}>
                  <Clock size={20} color="#DC2626" />
                </View>
                <Text style={styles.storyColTitle}>The Urban Dilemma</Text>
                <Text style={styles.storyColBody}>
                  You work hard in the city and want your family to eat fresh, natural, unadulterated food. But between traffic, 9-to-5 jobs, and lack of arable land, you cannot spend your days in the field. Meanwhile, market prices keep climbing and food quality keeps dropping.
                </Text>
              </View>

              {/* Farmer Dilemma */}
              <View style={styles.storyColumn}>
                <View style={styles.storyIconBoxAmber}>
                  <Sprout size={20} color="#D97706" />
                </View>
                <Text style={styles.storyColTitle}>The Rural Reality</Text>
                <Text style={styles.storyColBody}>
                  Local farmers have fertile land, generational wisdom, and the will to work. Yet they lack capital for hybrid seeds, solar irrigation, and fair market access. Exploitative middlemen buy their hard work for pennies, leaving farmers stranded.
                </Text>
              </View>

              {/* The MyFarm Bridge */}
              <View style={[styles.storyColumn, styles.storyColumnHighlight]}>
                <View style={styles.storyIconBoxGreen}>
                  <HeartHandshake size={20} color="#16A34A" />
                </View>
                <Text style={[styles.storyColTitle, { color: Colors.primary }]}>The MyFarm Bridge</Text>
                <Text style={[styles.storyColBody, { color: '#133E2B' }]}>
                  MyFarm connects the city directly to the soil. You sponsor the plot; an experienced local farmer plants and nurtures it; licensed agronomists supervise; and you track every milestone on WhatsApp. When harvest arrives, you either feast or cash out!
                </Text>
              </View>
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
                  <Tractor size={24} color="#FFFFFF" />
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
                <ArrowRight size={17} color="#FFFFFF" />
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
                  <ShoppingBag size={24} color="#FFFFFF" />
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
                <ArrowRight size={17} color="#FFFFFF" />
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
                  <Sprout size={24} color="#FFFFFF" />
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
                <ArrowRight size={17} color="#FFFFFF" />
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

        {/* 5. HOW MYFARM WORKS (STORY JOURNEY) */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTagGreen}>
              <Play size={12} color="#16a34a" />
              <Text style={styles.sectionTagGreenText}>STEP-BY-STEP PROCESS</Text>
            </View>
            <Text style={styles.sectionBigTitle}>How MyFarm Works</Text>
            <Text style={styles.sectionSubText}>
              A transparent, dependable system that takes you from seed to table with complete confidence.
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
              <Text style={styles.stepExplanation}>
                Choose from vetted agricultural clusters. Use our interactive production calculator to select your desired plot (from 50 sqm to a quarter acre) and pick crops like Roma Tomatoes, Habanero Pepper, or Golden Sweet Corn. See total setup cost, projected yield, and expected market value upfront.
              </Text>
            </View>

            {/* Step 2 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>02</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>A Local Farmer Does the Work</Text>
                  <Text style={styles.stepSubMain}>Professional care under agronomist supervision</Text>
                </View>
              </View>
              <Text style={styles.stepExplanation}>
                We pair your plot with an experienced, background-checked local smallholder. They clear the land, plant certified hybrid seedlings, weed, and irrigate daily using solar-powered drip lines. A licensed agronomist visits weekly to inspect soil nutrition and crop health.
              </Text>
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
              <Text style={styles.stepExplanation}>
                No wondering or guessing. As your plants sprout, flower, and develop fruit, you receive live verified photo logs, weather reports, and milestone updates on WhatsApp and inside your MyFarm dashboard. You can even book a weekend visit to walk your plot!
              </Text>
            </View>

            {/* Step 4 */}
            <View style={styles.stepCardDetailed}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>04</Text>
                </View>
                <View style={styles.stepHeadingWrap}>
                  <Text style={styles.stepTitleMain}>Harvest: Eat Fresh or Sell For Profit</Text>
                  <Text style={styles.stepSubMain}>Your produce, your choice</Text>
                </View>
              </View>
              <Text style={styles.stepExplanation}>
                When harvest arrives in ~90 days, you make the decision with one click: have crates of fresh, wholesome food delivered straight to your home, OR let MyFarm sell your harvest to restaurants and food markets on your behalf, with cash deposited into your Nigerian bank account.
              </Text>
            </View>
          </View>
        </View>

        {/* 6. TRUST & PEACE OF MIND */}
        <View style={styles.trustBanner}>
          <View style={styles.trustHeader}>
            <ShieldCheck size={28} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={styles.trustTitle}>The MyFarm Peace of Mind Guarantee</Text>
              <Text style={styles.trustSubtitle}>
                We built MyFarm on transparency, strict verification, and genuine human accountability.
              </Text>
            </View>
          </View>

          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <CheckCircle size={16} color="#16a34a" />
              <Text style={styles.trustItemText}>
                <Text style={{ fontWeight: '700' }}>Physically Vetted Farmland:</Text> Every plot has inspected land titles, fertile soil tests, and clean water sources.
              </Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={16} color="#16a34a" />
              <Text style={styles.trustItemText}>
                <Text style={{ fontWeight: '700' }}>ID-Verified Farmers:</Text> Every partner farmer is background-checked with National ID and biometric validation.
              </Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={16} color="#16a34a" />
              <Text style={styles.trustItemText}>
                <Text style={{ fontWeight: '700' }}>Solar Drip Irrigation:</Text> Crops do not depend on erratic rain. High-efficiency solar pumps water plants every day.
              </Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={16} color="#16a34a" />
              <Text style={styles.trustItemText}>
                <Text style={{ fontWeight: '700' }}>Direct Bank Transfers:</Text> Marketplace sales are paid directly to your Nigerian bank account via NIP transfer.
              </Text>
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
                      <ChevronUp size={20} color={Colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.text.muted} />
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

        {/* 8. CONTACT US & WHATSAPP SUPPORT */}
        <View style={styles.contactBanner}>
          <View style={styles.contactIconCircle}>
            <MessageCircle size={28} color="#FFFFFF" />
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
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>Chat with Us on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailBtn}
              onPress={() => Linking.openURL('mailto:hello@myfarm.ng')}
              activeOpacity={0.8}
            >
              <PhoneCall size={16} color={Colors.primary} />
              <Text style={styles.emailBtnText}>hello@myfarm.ng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <View style={styles.logoBadgeSmall}>
              <Tractor size={16} color="#FFFFFF" />
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
                  <Tractor size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>MyFarm</Text>
                  <Text style={styles.brandSubtitle}>NAVIGATION MENU</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setMenuOpen(false)}
              >
                <X size={20} color="#0F172A" />
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoBadgeSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.6,
  },
  pilotBadge: {
    display: Platform.OS === 'web' ? 'flex' : 'none',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: '#C7E2D1',
  },
  signInBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  accountBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroWrapper: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 20,
  },
  sliderCard: {
    width: '100%',
    minHeight: 380,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  sliderImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sliderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 17, 0.68)',
  },
  sliderContent: {
    zIndex: 2,
    maxWidth: 620,
  },
  sliderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sliderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sliderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 0.5,
  },
  statPill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sliderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 10,
  },
  sliderSubtitle: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 20,
  },
  sliderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sliderPrimaryBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  sliderPrimaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sliderSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  sliderSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    zIndex: 2,
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  sliderDotActive: {
    width: 24,
    backgroundColor: '#F59E0B',
  },
  impactBar: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 36,
    marginHorizontal: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  impactDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  storySection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 44,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTagGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sectionTagGreenText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.6,
  },
  sectionTagAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sectionTagAmberText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  sectionBigTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 6,
  },
  sectionSubText: {
    fontSize: 14.5,
    color: '#475569',
    lineHeight: 22,
    maxWidth: 680,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storyGrid: {
    gap: 16,
  },
  storyColumn: {
    backgroundColor: '#F8FAF7',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storyColumnHighlight: {
    backgroundColor: '#EAF3ED',
    borderColor: '#A3D9B8',
  },
  storyIconBoxRed: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyIconBoxAmber: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyIconBoxGreen: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyColTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  storyColBody: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 21,
  },
  gatewaysSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 44,
  },
  gatewayCardsRow: {
    gap: 18,
  },
  gatewayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
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
    gap: 12,
    marginBottom: 12,
  },
  gatewayIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayHeaderTexts: {
    flex: 1,
  },
  pillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  pillAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillAmberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  pillSlate: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pillSlateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  gatewayTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  gatewayDesc: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 16,
  },
  gatewayFeatureList: {
    gap: 8,
    backgroundColor: '#F8FAF7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  gatewayActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  gatewayActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gatewaySecondaryLink: {
    paddingTop: 10,
    alignItems: 'center',
  },
  gatewaySecondaryLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  howItWorksSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 44,
  },
  stepsFlow: {
    gap: 14,
  },
  stepCardDetailed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepHeadingWrap: {
    flex: 1,
  },
  stepTitleMain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepSubMain: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 1,
  },
  stepExplanation: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 21,
  },
  trustBanner: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 44,
    marginHorizontal: 16,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803d',
  },
  trustSubtitle: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
    lineHeight: 18,
  },
  trustGrid: {
    gap: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  trustItemText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 19,
    flex: 1,
  },
  faqSection: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 44,
  },
  faqList: {
    gap: 10,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 21,
  },
  contactBanner: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 44,
    marginHorizontal: 16,
  },
  contactIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#C7E2D1',
    textAlign: 'center',
    maxWidth: 540,
    lineHeight: 21,
    marginBottom: 20,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  whatsappBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emailBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emailBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  footerBrandText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  footerTagline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 18,
    lineHeight: 19,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  footerCopy: {
    fontSize: 11.5,
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
    maxWidth: 380,
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  drawerSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  drawerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemTexts: {
    flex: 1,
  },
  drawerItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerItemSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  drawerAuthRow: {
    marginTop: 24,
    marginBottom: 40,
  },
  drawerFullBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  drawerFullBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
