import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useAuth, useFavorites, useTheme } from '../context';
import { useNavigation } from '@react-navigation/native';
import { AuthGateModal } from './AuthGateModal';

interface FavoriteButtonProps {
  stationId: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  onToggle?: (isFav: boolean) => void;
}

/**
 * Mathematically constructed, smooth-curved Heart icon.
 * Composed of dual circular top lobes + a 45° rotated bottom diamond base.
 * Produces flawless curvature identical to Apple SF Symbols / Airbnb heart.
 */
const SeamlessHeart: React.FC<{
  isFav: boolean;
  isDark: boolean;
  size: number;
  bgColor: string;
}> = ({ isFav, isDark, size, bgColor }) => {
  const activeRed = '#EF4444';
  const inactiveDark = isDark ? '#E2E8F0' : '#1E293B';

  const unit = size / 20; // scale factor
  const lobeSize = 10.5 * unit;
  const squareSize = 10.5 * unit;
  const offset = 3.6 * unit;

  if (isFav) {
    // Solid Vibrant Red Heart
    return (
      <View style={[styles.heartCanvas, { width: size, height: size }]}>
        <View style={[styles.heartAnchor, { width: squareSize, height: squareSize }]}>
          {/* Rotated Diamond Base */}
          <View
            style={{
              position: 'absolute',
              width: squareSize,
              height: squareSize,
              backgroundColor: activeRed,
              transform: [{ rotate: '45deg' }],
              borderRadius: 1,
            }}
          />
          {/* Left Circular Lobe */}
          <View
            style={{
              position: 'absolute',
              width: lobeSize,
              height: lobeSize,
              borderRadius: lobeSize / 2,
              backgroundColor: activeRed,
              left: -offset,
              top: -offset,
            }}
          />
          {/* Right Circular Lobe */}
          <View
            style={{
              position: 'absolute',
              width: lobeSize,
              height: lobeSize,
              borderRadius: lobeSize / 2,
              backgroundColor: activeRed,
              right: -offset,
              top: -offset,
            }}
          />
        </View>
      </View>
    );
  }

  // Inactive Outline Heart: Outer dark heart with inner background-matched cutout
  const stroke = 1.7 * unit;
  const innerSquare = squareSize - stroke * 2;
  const innerLobe = lobeSize - stroke * 2;
  const innerOffset = offset - stroke;

  return (
    <View style={[styles.heartCanvas, { width: size, height: size }]}>
      {/* Outer Contour */}
      <View style={[styles.heartAnchor, { width: squareSize, height: squareSize }]}>
        {/* Outer Base */}
        <View
          style={{
            position: 'absolute',
            width: squareSize,
            height: squareSize,
            backgroundColor: inactiveDark,
            transform: [{ rotate: '45deg' }],
            borderRadius: 1,
          }}
        />
        {/* Outer Left Lobe */}
        <View
          style={{
            position: 'absolute',
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            backgroundColor: inactiveDark,
            left: -offset,
            top: -offset,
          }}
        />
        {/* Outer Right Lobe */}
        <View
          style={{
            position: 'absolute',
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            backgroundColor: inactiveDark,
            right: -offset,
            top: -offset,
          }}
        />

        {/* Inner Hollow Cutout */}
        <View
          style={{
            position: 'absolute',
            width: innerSquare,
            height: innerSquare,
            backgroundColor: bgColor,
            transform: [{ rotate: '45deg' }],
            left: stroke,
            top: stroke,
            borderRadius: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: innerLobe,
            height: innerLobe,
            borderRadius: innerLobe / 2,
            backgroundColor: bgColor,
            left: -innerOffset,
            top: -innerOffset,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: innerLobe,
            height: innerLobe,
            borderRadius: innerLobe / 2,
            backgroundColor: bgColor,
            right: -innerOffset,
            top: -innerOffset,
          }}
        />
      </View>
    </View>
  );
};

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  stationId,
  size = 'md',
  style,
  onToggle,
}) => {
  const { isGuest } = useAuth();
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const [showAuthGate, setShowAuthGate] = React.useState(false);

  // If user is guest, isFav is always false
  const isFav = isGuest ? false : isFavorite(stationId);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (isGuest) {
      setShowAuthGate(true);
      return;
    }

    // Smooth spring/bounce transition
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();

    const nextState = toggleFavorite(stationId);
    if (onToggle) {
      onToggle(nextState);
    }
  };

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { iconSize: 16, containerSize: 22 };
      case 'lg':
        return { iconSize: 22, containerSize: 28 };
      case 'md':
      default:
        return { iconSize: 18, containerSize: 24 };
    }
  };

  const { iconSize, containerSize } = getDimensions();
  const cardBg = theme.surface || (isDark ? '#1E293B' : '#FFFFFF');

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.buttonBase,
            {
              width: containerSize,
              height: containerSize,
            },
            style,
          ]}
          onPress={handlePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={
            isFav ? 'Remove station from Favorites' : 'Add station to Favorites'
          }
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <SeamlessHeart
            isFav={isFav}
            isDark={isDark}
            size={iconSize}
            bgColor={cardBg}
          />
        </TouchableOpacity>
      </Animated.View>

      <AuthGateModal
        visible={showAuthGate}
        featureName="Favorite Stations"
        onClose={() => setShowAuthGate(false)}
        onLogin={() => {
          setShowAuthGate(false);
          navigation.navigate('Login');
        }}
        onRegister={() => {
          setShowAuthGate(false);
          navigation.navigate('Register');
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  heartCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartAnchor: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2.5,
  },
});
