import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { typography, borderRadius } from '../theme';
import { useTheme } from '../context';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  const getBackgroundColor = () => {
    if (disabled) return isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border;
    switch (variant) {
      case 'secondary':
        return isDark ? 'rgba(255, 255, 255, 0.08)' : theme.surfaceSecondary;
      case 'danger':
        return '#EF4444';
      case 'outline':
        return 'transparent';
      case 'primary':
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    if (variant === 'outline') return theme.primary;
    if (variant === 'secondary') return theme.textPrimary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1.5, borderColor: theme.primary },
        variant === 'secondary' && { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    ...typography.button,
  },
});
