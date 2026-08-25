import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context';
import { borderRadius } from '../theme';

interface LanguageToggleProps {
  style?: object;
  variant?: 'pill' | 'compact' | 'segmented';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  style,
  variant = 'pill',
}) => {
  const { setLanguage, toggleLanguage, isHindi } = useLanguage();

  if (variant === 'segmented') {
    return (
      <View style={[styles.segmentedContainer, style]}>
        <TouchableOpacity
          style={[styles.segmentedBtn, !isHindi && styles.segmentedBtnActive]}
          onPress={() => setLanguage('en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentedText, !isHindi && styles.segmentedTextActive]}>
            🇬🇧 EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentedBtn, isHindi && styles.segmentedBtnActive]}
          onPress={() => setLanguage('hi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentedText, isHindi && styles.segmentedTextActive]}>
            🇮🇳 हिन्दी
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.pillContainer, style]}
      onPress={toggleLanguage}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.pillFlag}>{isHindi ? '🇮🇳' : '🇬🇧'}</Text>
      <Text style={styles.pillText}>{isHindi ? 'हिन्दी' : 'English'}</Text>
      <Text style={styles.pillArrow}>⇄</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.35)',
    gap: 4,
  },
  pillFlag: {
    fontSize: 12,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#00D084',
  },
  pillArrow: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: '700',
    marginLeft: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  segmentedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  segmentedBtnActive: {
    backgroundColor: '#00D084',
  },
  segmentedText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  segmentedTextActive: {
    color: '#031726',
    fontWeight: '900',
  },
});
