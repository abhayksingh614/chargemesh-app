import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  unit,
  subtitle,
  color,
}) => {
  const { theme } = useTheme();
  const metricColor = color || theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: metricColor }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text> : null}
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flex: 1,
    minWidth: '45%',
    margin: spacing.xs,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
