import { ConnectorStatus } from '@chargemesh/shared-types';

export const colors = {
  // Brand Colors
  primary: '#16A34A',        // Primary Green (CTA, Available, Eco indicators)
  primaryDark: '#064E3B',    // Dark Forest Green (Hero headers, brand emphasis)
  primaryLight: '#86EFAC',   // Light Mint Green
  darkGreen: '#064E3B',      // Dark Forest Green
  ecoLight: '#ECFDF5',       // Eco Mint surface (Cards, badges, subtle backgrounds)

  // Neutral Surfaces & Backgrounds
  background: '#F8FAF9',     // Main app background
  surface: '#FFFFFF',        // Card and container background
  surfaceSecondary: '#F1F5F9', // Secondary subtle surface
  surfaceElevated: '#FFFFFF',// Modals & Bottom sheets

  // Typography
  textPrimary: '#111827',    // Primary text (headings, essential data)
  textSecondary: '#6B7280',  // Secondary / metadata text
  textTertiary: '#9CA3AF',   // Tertiary / subtle text
  textMuted: '#9CA3AF',      // Disabled / placeholder text
  textInverse: '#FFFFFF',    // Light text on dark/green buttons

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#CBD5E1',
  divider: '#E5E7EB',

  // System & Action
  success: '#16A34A',
  warning: '#EA580C',
  danger: '#DC2626',

  // Semantic Status Colors (From UI/UX Specification)
  status: {
    available: '#16A34A',    // Confirmed usable
    availableBg: '#DCFCE7',
    inUse: '#EA580C',        // Occupied
    inUseBg: '#FFEDD5',
    unavailable: '#DC2626',  // Confirmed out of service
    unavailableBg: '#FEE2E2',
    unknown: '#6B7280',      // Uncertainty warning (NEVER green!)
    unknownBg: '#F3F4F6',
    reserved: '#2563EB',     // Blue reservation
    reservedBg: '#DBEAFE',
    stale: '#D97706',        // Warning delayed data
    staleBg: '#FEF3C7',
  }
};

/**
 * Returns consistent UI color and background for any connector status
 */
export function getStatusColor(status: ConnectorStatus) {
  switch (status) {
    case ConnectorStatus.AVAILABLE:
      return { color: colors.status.available, bg: colors.status.availableBg, label: 'Available' };
    case ConnectorStatus.IN_USE:
      return { color: colors.status.inUse, bg: colors.status.inUseBg, label: 'In Use' };
    case ConnectorStatus.UNAVAILABLE:
    case ConnectorStatus.OFFLINE:
      return { color: colors.status.unavailable, bg: colors.status.unavailableBg, label: 'Unavailable' };
    case ConnectorStatus.RESERVED:
      return { color: colors.status.reserved, bg: colors.status.reservedBg, label: 'Reserved' };
    case ConnectorStatus.STALE:
      return { color: colors.status.stale, bg: colors.status.staleBg, label: 'Data Delayed' };
    case ConnectorStatus.UNKNOWN:
    default:
      return { color: colors.status.unknown, bg: colors.status.unknownBg, label: 'Status Unknown' };
  }
}
