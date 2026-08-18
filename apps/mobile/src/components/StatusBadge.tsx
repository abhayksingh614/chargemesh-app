import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectorStatus } from '@chargemesh/shared-types';
import { getStatusColor, typography, borderRadius } from '../theme';

interface StatusBadgeProps {
  status: ConnectorStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const { color, bg, label } = getStatusColor(status);

  return (
    <View style={[
      styles.container,
      { backgroundColor: bg, borderColor: color },
      size === 'medium' && styles.mediumContainer
    ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[
        styles.text,
        { color },
        size === 'medium' && styles.mediumText
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  mediumContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    ...typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mediumText: {
    fontSize: 13,
  },
});
