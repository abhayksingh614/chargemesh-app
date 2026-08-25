import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { typography, borderRadius } from '../theme';
import { useTheme } from '../context';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.primary
            : isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : theme.surface,
          borderColor: selected
            ? theme.primary
            : isDark
            ? 'rgba(255, 255, 255, 0.16)'
            : theme.borderDark,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected
              ? '#FFFFFF'
              : theme.textPrimary,
          },
        ]}
      >
        {icon ? `${icon} ` : ''}{label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1.2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.captionBold,
    fontSize: 13,
  },
});
