import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FreshnessState } from '@chargemesh/shared-types';
import { STATUS_STALE_THRESHOLD_SECONDS } from '@chargemesh/shared-constants';
import { colors, typography } from '../theme';

interface FreshnessIndicatorProps {
  freshnessState: FreshnessState;
  dataAgeSeconds?: number;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  freshnessState,
  dataAgeSeconds = 0,
}) => {
  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${Math.max(seconds, 5)}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  if (freshnessState === FreshnessState.UNKNOWN) {
    return (
      <View style={styles.row}>
        <Text style={[styles.text, { color: colors.status.unknown }]}>
          ⚠️ Freshness unverified
        </Text>
      </View>
    );
  }

  if (freshnessState === FreshnessState.DELAYED || dataAgeSeconds >= STATUS_STALE_THRESHOLD_SECONDS) {
    return (
      <View style={styles.row}>
        <Text style={[styles.text, { color: colors.status.stale }]}>
          ⏱️ Delayed • {formatAge(dataAgeSeconds)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.status.available }]}>
        ⚡ Live • {formatAge(dataAgeSeconds)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
    fontWeight: '500',
  },
});
