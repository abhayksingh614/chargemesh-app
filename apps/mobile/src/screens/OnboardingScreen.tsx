import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';
import { useAuth } from '../context';

const { width, height } = Dimensions.get('window');

// Exact Color Tokens from ChargeMesh Design System Specification
const CM_COLORS = {
  primaryGreen: '#00D084',
  supportingTeal: '#00BFA5',
  darkBg: '#06131D',
  deepNavy: '#071824',
  primaryText: '#FFFFFF',
  secondaryText: '#D0D7DC',
  subtleBorder: 'rgba(255, 255, 255, 0.18)',
  cardBg: 'rgba(4, 18, 28, 0.88)',
  inactiveIndicator: '#334155',
};

interface OnboardingSlide {
  id: string;
  badgeIcon: string;
  badgeText: string;
  titleWhitePart1: string;
  titleGreenPart: string;
  titleWhitePart2?: string;
  description: string;
  benefits: string[];
  backgroundImage: ImageSourcePropType;
  ctaText: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    badgeIcon: '⚡',
    badgeText: 'ALL-IN-ONE EV CHARGING',
    titleWhitePart1: 'Charge Your EV.\n',
    titleGreenPart: 'Anywhere.',
    titleWhitePart2: ' Anytime.',
    description: 'Find, pay for, and manage EV charging from one simple app.',
    backgroundImage: require('../assets/obscreens/evob_1.png'),
    benefits: [
      'Find nearby charging stations',
      'Pay seamlessly with UPI & Fastag',
      'Get instant digital invoices',
    ],
    ctaText: 'Get Started ⚡ →',
  },
  {
    id: '2',
    badgeIcon: '🌐',
    badgeText: 'ALL-INDIA CHARGING NETWORK',
    titleWhitePart1: '5,000+ EV Chargers.\n',
    titleGreenPart: 'One App.',
    titleWhitePart2: '',
    description:
      'Discover and access charging stations across multiple networks without switching between apps.',
    backgroundImage: require('../assets/obscreens/evob_3.png'),
    benefits: [
      '5,000+ verified charging bays',
      'Live availability & charging status',
      'Smart route planning with GPS',
    ],
    ctaText: 'Continue →',
  },
  {
    id: '3',
    badgeIcon: '📊',
    badgeText: 'LIVE TELEMETRY & SMART CHARGING',
    titleWhitePart1: 'Charge Smarter.\n',
    titleGreenPart: 'Stay in Control.',
    titleWhitePart2: '',
    description:
      'Monitor your charging session, power, battery level, and cost in real time.',
    backgroundImage: require('../assets/obscreens/evob_2.png'),
    benefits: [
      'Live charging speed & power',
      'Battery SoC monitoring',
      'Real-time kWh & cost tracking',
    ],
    ctaText: 'Start Charging ⚡ →',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { completeOnboarding } = useAuth();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    try {
      navigation.replace('Login');
    } catch {
      navigation.navigate('Login');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    try {
      navigation.replace('Login');
    } catch {
      navigation.navigate('Login');
    }
  };

  const handleSignIn = async () => {
    await completeOnboarding();
    try {
      navigation.replace('Login');
    } catch {
      navigation.navigate('Login');
    }
  };

  const onScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    if (slideSize > 0) {
      const index = Math.round(offset / slideSize);
      if (index >= 0 && index < slides.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const contentOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.35, 1, 0.35],
      extrapolate: 'clamp',
    });

    const contentTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [12, 0, 12],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slideWrapper}>
        <ImageBackground
          source={item.backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Subtle Contrast Vignette Overlay */}
          <View style={styles.overlay}>
            <SafeAreaView style={styles.safeSlideContent}>
              {/* Top Spacer for Background Artwork */}
              <View style={styles.topSpacer} />

              {/* Exact Dark Navy/Black Translucent Card */}
              <Animated.View
                style={[
                  styles.cardContainer,
                  {
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                  },
                ]}
              >
                {/* 1. USP Badge Pill */}
                <View style={styles.badgePill}>
                  <Text style={styles.badgeIcon}>{item.badgeIcon}</Text>
                  <Text style={styles.badgeText}>{item.badgeText}</Text>
                </View>

                {/* 2. Headline with ChargeMesh Green Highlight */}
                <Text style={styles.titleText}>
                  {item.titleWhitePart1}
                  <Text style={styles.greenHighlightText}>{item.titleGreenPart}</Text>
                  {item.titleWhitePart2 ? (
                    <Text style={styles.whiteTitleText}>{item.titleWhitePart2}</Text>
                  ) : null}
                </Text>

                {/* 3. Supporting Description */}
                <Text style={styles.descriptionText}>{item.description}</Text>

                {/* 4. Three Feature List Items with Circular Green Checkmarks */}
                <View style={styles.benefitsList}>
                  {item.benefits.map((benefit, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            </SafeAreaView>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const currentCtaText = slides[currentIndex]?.ctaText || 'Continue →';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full-Screen Carousel with 250-350ms Native Transitions */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: onScrollHandler,
          }
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={styles.carousel}
      />

      {/* Top Header: Brand Pill on Left, Skip Button on Right */}
      <SafeAreaView style={styles.topHeaderSafeArea}>
        <View style={styles.topHeader}>
          <View style={styles.brandPill}>
            <Image
              source={require('../assets/logo/cm_fevicon_logo_trans.png')}
              style={styles.brandFavicon}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>ChargeMesh</Text>
          </View>

          <TouchableOpacity
            style={styles.skipPill}
            onPress={handleSkip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Fixed Action Section: Pagination, Primary CTA, Login Link */}
      <SafeAreaView style={styles.bottomControlsSafeArea}>
        <View style={styles.footerContainer}>
          {/* Pagination Indicators: [====] [==] [==] */}
          <View style={styles.progressRow}>
            {slides.map((_, i) => {
              const dotInputRange = [(i - 1) * width, i * width, (i + 1) * width];

              const barWidth = scrollX.interpolate({
                inputRange: dotInputRange,
                outputRange: [14, 26, 14],
                extrapolate: 'clamp',
              });

              const isCurrent = currentIndex === i;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({ index: i, animated: true });
                    setCurrentIndex(i);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: barWidth,
                        backgroundColor: isCurrent
                          ? CM_COLORS.primaryGreen
                          : CM_COLORS.inactiveIndicator,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Large Full-Width Primary CTA Button */}
          <TouchableOpacity
            style={styles.primaryCta}
            activeOpacity={0.86}
            onPress={handleNext}
          >
            <Text style={styles.primaryCtaText}>{currentCtaText}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.signInPromptRow}>
            <Text style={styles.promptText}>Already registered with ChargeMesh? </Text>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.8}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CM_COLORS.darkBg,
  },
  carousel: {
    flex: 1,
  },
  slideWrapper: {
    width: width,
    height: height,
  },
  backgroundImage: {
    width: width,
    height: height,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.28)',
    justifyContent: 'space-between',
  },
  safeSlideContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSpacer: {
    flex: 1,
  },
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: 155,
    backgroundColor: CM_COLORS.cardBg,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.35)',
  },
  badgeIcon: {
    fontSize: 11,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: CM_COLORS.primaryGreen,
    letterSpacing: 0.6,
  },
  titleText: {
    fontSize: 21,
    fontWeight: '800',
    color: CM_COLORS.primaryText,
    lineHeight: 27,
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'left',
  },
  whiteTitleText: {
    color: CM_COLORS.primaryText,
  },
  greenHighlightText: {
    color: CM_COLORS.primaryGreen,
  },
  descriptionText: {
    fontSize: 12.5,
    color: CM_COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'left',
  },
  benefitsList: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1.5,
    borderColor: CM_COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkIcon: {
    color: CM_COLORS.primaryGreen,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 13,
  },
  benefitText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: CM_COLORS.primaryText,
    flex: 1,
  },
  topHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 14,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
  },
  brandFavicon: {
    width: 20,
    height: 20,
    marginRight: 7,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CM_COLORS.primaryText,
    letterSpacing: -0.2,
  },
  skipPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CM_COLORS.subtleBorder,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: CM_COLORS.primaryGreen,
  },
  bottomControlsSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: spacing.lg,
    paddingTop: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
    height: 10,
  },
  progressBar: {
    height: 4.5,
    borderRadius: 2.5,
  },
  primaryCta: {
    width: '100%',
    backgroundColor: CM_COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CM_COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: CM_COLORS.primaryText,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  signInPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    fontSize: 12,
    color: CM_COLORS.secondaryText,
  },
  signInLink: {
    fontSize: 12,
    fontWeight: '700',
    color: CM_COLORS.primaryGreen,
  },
});
