import {
  UserProfile,
  UserGender,
  Vehicle,
  ConnectorType,
  ChargingSession,
  SessionStatus,
  ChargeTarget,
} from '@chargemesh/shared-types';
import { mockStations } from './mockData';
import { WalletTransaction } from './walletData';

/**
 * ============================================================================
 * 1. SINGLE CENTRAL DEMO USER PROFILE
 * Primary Prototype Persona: "Abhay" (Clean EV driver across Delhi NCR)
 * ============================================================================
 */
export const DEMO_USER_PROFILE: UserProfile = {
  id: 'usr-abhay-01',
  name: 'Abhay Singh',
  firstName: 'Abhay',
  lastName: 'Singh',
  phoneNumber: '+91 98765 43210',
  email: 'abhay@gmail.com',
  dob: '1993-11-22',
  gender: UserGender.MALE,
  state: 'Uttar Pradesh',
  district: 'Gautam Buddha Nagar',
  city: 'Noida',
  pincode: '201301',
  address: 'Tower 4, Sector 62, Electronic City',
  userCode: 'CM-DRV-6399',
  membershipTier: 'ChargeMesh Elite Member',
  memberSince: 'November 2023',
  walletBalancePaise: 204000, // ₹2,040.00 (Authoritative reconciled balance)
  totalKwhCharged: 428.5,
  co2SavedKg: 351.4,
  totalSessions: 18,
  authProvider: 'phone',
  joiningBonusStatus: 'CREDITED',
  joiningBonusAmountPaise: 10000, // ₹100 welcome bonus
  profileCompletionPercentage: 90,
  chargingPreferences: {
    preferredSpeed: 'ULTRA_FAST',
    preferredConnector: ConnectorType.CCS2,
    preferredNetworks: ['Tata Power EZ Charge', 'Jio-bp pulse', 'Zeon Charging'],
    searchRadiusKm: 25,
    autoFilterIncompatible: true,
  },
  notificationPreferences: {
    sessionAlerts: true,
    completionAlerts: true,
    stationAvailabilityAlerts: true,
    emailInvoices: true,
    promotionalOffers: true,
  },
};

/**
 * ============================================================================
 * 2. USER VEHICLES (Primary: Tata Nexon EV, Secondary: MG ZS EV)
 * ============================================================================
 */
export const DEMO_PRIMARY_VEHICLE: Vehicle = {
  id: 'veh-1',
  userId: DEMO_USER_PROFILE.id,
  make: 'Tata',
  model: 'Nexon EV',
  variant: 'Max Empowered+',
  connectorTypes: [ConnectorType.CCS2, ConnectorType.TYPE2],
  maxAcPowerKw: 7.2,
  maxDcPowerKw: 50,
  batteryCapacityKwh: 40.5,
  isDefault: true,
  createdAt: '2024-01-15T08:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
};

export const DEMO_SECONDARY_VEHICLE: Vehicle = {
  id: 'veh-2',
  userId: DEMO_USER_PROFILE.id,
  make: 'MG',
  model: 'ZS EV',
  variant: 'Exclusive Pro',
  connectorTypes: [ConnectorType.CCS2, ConnectorType.TYPE2],
  maxAcPowerKw: 7.4,
  maxDcPowerKw: 75,
  batteryCapacityKwh: 50.3,
  isDefault: false,
  createdAt: '2024-06-10T12:00:00.000Z',
  updatedAt: '2026-08-22T14:30:00.000Z',
};

export const DEMO_VEHICLES: Vehicle[] = [DEMO_PRIMARY_VEHICLE, DEMO_SECONDARY_VEHICLE];

/**
 * ============================================================================
 * 3. USER SAVED PAYMENT METHODS
 * ============================================================================
 */
export interface DemoPaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'fastag' | 'net_banking';
  title: string;
  subtitle: string;
  isDefault: boolean;
  statusLabel: string;
  icon: string;
  cardBrand?: string;
}

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'upi',
    title: 'UPI (Google Pay)',
    subtitle: 'abhay@upi',
    isDefault: true,
    statusLabel: 'Default',
    icon: '📱',
  },
  {
    id: 'pm-2',
    type: 'card',
    title: 'HDFC Visa Debit Card',
    subtitle: '•••• •••• •••• 4821 · Exp 08/29',
    isDefault: false,
    statusLabel: 'Saved',
    icon: '💳',
    cardBrand: 'Visa',
  },
  {
    id: 'pm-3',
    type: 'fastag',
    title: 'Tata Nexon EV FASTag',
    subtitle: 'DL 8C BC 2026 · IDBI Bank FASTag',
    isDefault: false,
    statusLabel: 'Connected',
    icon: '🏷️',
  },
];

/**
 * ============================================================================
 * 4. MATHEMATICALLY RECONCILED WALLET TRANSACTIONS LEDGER
 *
 * Ledger Trace (Running Balance):
 * 1. 18 Aug: Seed Opening Balance                          = ₹1,000.00
 * 2. 19 Aug: -₹360.00 (Tata Power Cyber Hub Charging)      -> ₹640.00
 * 3. 21 Aug: +₹2,000.00 (HDFC Visa Debit Card Top-up)      -> ₹2,640.00
 * 4. 21 Aug: -₹500.00 (Statiq Sector 29 Charging)         -> ₹2,140.00
 * 5. 23 Aug: +₹100.00 (Hold Refund #CS-8921)              -> ₹2,240.00
 * 6. 24 Aug: -₹1,200.00 (Zeon GT Road Murthal Charging)    -> ₹1,040.00
 * 7. 25 Aug: +₹1,000.00 (UPI Top-up via Google Pay)        -> ₹2,040.00
 * ----------------------------------------------------------------------------
 * Authoritative Closing Balance: ₹2,040.00 (204,000 Paise)
 * ============================================================================
 */
export const DEMO_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-001',
    referenceId: 'CM202608251042001',
    type: 'WALLET_TOPUP_UPI',
    title: '₹1,000 Added',
    subtitle: 'UPI · abhay@upi',
    amountRupees: 1000.0,
    isCredit: true,
    status: 'SUCCESS',
    dateGroup: 'TODAY',
    dateStr: '25 Aug 2026',
    timeStr: '10:42 AM',
    rawTimestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    paymentMethodName: 'UPI (Google Pay)',
    paymentMethodDetail: 'abhay@upi',
    balanceBeforeRupees: 1040.0,
    balanceAfterRupees: 2040.0,
    remarks: 'Auto-credited instantly via NPCI UPI Gateway',
  },
  {
    id: 'tx-002',
    referenceId: 'CM202608241130089',
    type: 'WALLET_DEBIT',
    title: '₹1,200.00 Debited',
    subtitle: 'Zeon — GT Road Murthal Hub · Gun #1',
    amountRupees: 1200.0,
    isCredit: false,
    status: 'SUCCESS',
    dateGroup: '24 AUG 2026',
    dateStr: '24 Aug 2026',
    timeStr: '11:30 AM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    paymentMethodName: 'ChargeMesh Fast Wallet',
    paymentMethodDetail: 'Gun #1 (120 kW DC Fast)',
    balanceBeforeRupees: 2240.0,
    balanceAfterRupees: 1040.0,
    remarks: 'Session completed: 58.5 kWh billed @ ₹20.50/kWh',
  },
  {
    id: 'tx-003',
    referenceId: 'CM202608231315042',
    type: 'WALLET_REFUND',
    title: '₹100.00 Refunded',
    subtitle: 'Session Refund · #CS-8921 Unused Hold',
    amountRupees: 100.0,
    isCredit: true,
    status: 'SUCCESS',
    dateGroup: '23 AUG 2026',
    dateStr: '23 Aug 2026',
    timeStr: '01:15 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 48,
    paymentMethodName: 'ChargeMesh Reconciler',
    paymentMethodDetail: 'Session Unused Energy Hold Refund',
    balanceBeforeRupees: 2140.0,
    balanceAfterRupees: 2240.0,
    remarks: 'Automatic release of unconsumed pre-authorization hold',
  },
  {
    id: 'tx-004',
    referenceId: 'CM202608211745012',
    type: 'WALLET_DEBIT',
    title: '₹500.00 Debited',
    subtitle: 'Statiq Grid — Sector 29 · Gun #1',
    amountRupees: 500.0,
    isCredit: false,
    status: 'SUCCESS',
    dateGroup: '21 AUG 2026',
    dateStr: '21 Aug 2026',
    timeStr: '05:45 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 90,
    paymentMethodName: 'ChargeMesh Fast Wallet',
    paymentMethodDetail: 'Gun #1 (60 kW DC Fast)',
    balanceBeforeRupees: 2640.0,
    balanceAfterRupees: 2140.0,
    remarks: 'Session completed: 25.0 kWh billed @ ₹20.00/kWh',
  },
  {
    id: 'tx-005',
    referenceId: 'CM202608211524089',
    type: 'WALLET_TOPUP_CARD',
    title: '₹2,000 Added',
    subtitle: 'HDFC Visa Debit Card · •••• 4821',
    amountRupees: 2000.0,
    isCredit: true,
    status: 'SUCCESS',
    dateGroup: '21 AUG 2026',
    dateStr: '21 Aug 2026',
    timeStr: '03:24 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 92,
    paymentMethodName: 'HDFC Visa Debit Card',
    paymentMethodDetail: '•••• •••• •••• 4821',
    balanceBeforeRupees: 640.0,
    balanceAfterRupees: 2640.0,
    remarks: 'Prepaid top-up with 2% green energy rewards applied',
  },
  {
    id: 'tx-006',
    referenceId: 'CM202608191830112',
    type: 'WALLET_DEBIT',
    title: '₹360.00 Debited',
    subtitle: 'Tata Power — Cyber Hub Sector 24 · Gun #1',
    amountRupees: 360.0,
    isCredit: false,
    status: 'SUCCESS',
    dateGroup: '19 AUG 2026',
    dateStr: '19 Aug 2026',
    timeStr: '06:30 PM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 140,
    paymentMethodName: 'ChargeMesh Fast Wallet',
    paymentMethodDetail: 'Gun #1 (60 kW DC Fast)',
    balanceBeforeRupees: 1000.0,
    balanceAfterRupees: 640.0,
    remarks: 'Session completed: 18.9 kWh billed @ ₹19.00/kWh',
  },
  {
    id: 'tx-007',
    referenceId: 'CM202608181000001',
    type: 'WALLET_TOPUP_UPI',
    title: '₹1,000 Opening Balance',
    subtitle: 'Initial Wallet Activation Credit',
    amountRupees: 1000.0,
    isCredit: true,
    status: 'SUCCESS',
    dateGroup: '18 AUG 2026',
    dateStr: '18 Aug 2026',
    timeStr: '10:00 AM',
    rawTimestamp: Date.now() - 1000 * 60 * 60 * 168,
    paymentMethodName: 'UPI (Google Pay)',
    paymentMethodDetail: 'abhay@upi',
    balanceBeforeRupees: 0.0,
    balanceAfterRupees: 1000.0,
    remarks: 'Initial wallet balance top-up on account verification',
  },
];

/**
 * ============================================================================
 * 5. CHARGING SESSIONS (Reconciled with Wallet Debits & Real Stations)
 * ============================================================================
 */
export const DEMO_CHARGING_SESSIONS: ChargingSession[] = [
  {
    id: 'sess-101',
    userId: DEMO_USER_PROFILE.id,
    cpoId: 'cpo-zeon',
    locationId: 'zc-gt-03', // Murthal Hub
    evseId: 'evse-zc-3',
    connectorId: 'zc-3-c1',
    cpoSessionId: 'ZC-SESS-992104',
    status: SessionStatus.COMPLETED,
    chargeTarget: ChargeTarget.AMOUNT,
    chargeTargetValue: 1200,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 Aug
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 + 38 * 60 * 1000).toISOString(),
    energyKwh: 58.5,
    durationSeconds: 2280, // 38 mins
    finalAmountPaise: 120000, // ₹1,200.00
    idempotencyKey: 'idem-sess-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-102',
    userId: DEMO_USER_PROFILE.id,
    cpoId: 'cpo-statiq',
    locationId: 'sq-gur-01', // Sector 29
    evseId: 'evse-sq-1',
    connectorId: 'sq-1-c1',
    cpoSessionId: 'SQ-SESS-881240',
    status: SessionStatus.COMPLETED,
    chargeTarget: ChargeTarget.AMOUNT,
    chargeTargetValue: 500,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(), // 21 Aug
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 90 + 28 * 60 * 1000).toISOString(),
    energyKwh: 25.0,
    durationSeconds: 1680, // 28 mins
    finalAmountPaise: 50000, // ₹500.00
    idempotencyKey: 'idem-sess-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-103',
    userId: DEMO_USER_PROFILE.id,
    cpoId: 'cpo-tata',
    locationId: 'tp-del-01', // Cyber Hub
    evseId: 'evse-tp-1',
    connectorId: 'tp-1-c1',
    cpoSessionId: 'TP-SESS-771239',
    status: SessionStatus.COMPLETED,
    chargeTarget: ChargeTarget.AMOUNT,
    chargeTargetValue: 360,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(), // 19 Aug
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 140 + 24 * 60 * 1000).toISOString(),
    energyKwh: 18.9,
    durationSeconds: 1440, // 24 mins
    finalAmountPaise: 36000, // ₹360.00
    idempotencyKey: 'idem-sess-103',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * ============================================================================
 * 6. USER FAVORITE STATIONS (Real Station IDs in mockStations)
 * ============================================================================
 */
export const DEMO_FAVORITE_STATION_IDS: string[] = [
  'tp-del-01', // Tata Power — Cyber Hub Sector 24
  'jb-aero-01', // Jio-bp pulse — Aerocity Hub
  'sq-gur-01', // Statiq — Sector 29 EV Station
];

/**
 * ============================================================================
 * 7. USER BOOKINGS / RESERVATIONS
 * ============================================================================
 */
export interface DemoBooking {
  id: string;
  stationId: string;
  stationName: string;
  cpoName: string;
  vehicleName: string;
  connectorType: string;
  powerKw: number;
  dateTimeStr: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  estimatedCostRupees: number;
  paymentMethod: string;
}

export const DEMO_BOOKINGS: DemoBooking[] = [
  {
    id: 'bk-2026-0826-01',
    stationId: 'tp-del-01',
    stationName: 'Tata Power — Cyber Hub Sector 24',
    cpoName: 'Tata Power EZ Charge',
    vehicleName: 'Tata Nexon EV',
    connectorType: 'CCS2 (DC Fast)',
    powerKw: 60,
    dateTimeStr: 'Today · 06:30 PM',
    status: 'CONFIRMED',
    estimatedCostRupees: 450,
    paymentMethod: 'ChargeMesh Fast Wallet',
  },
];

/**
 * ============================================================================
 * 8. AUTOMATED CONSISTENCY VALIDATION FUNCTION
 * Asserts all financial and relational integrity constraints across demo state
 * ============================================================================
 */
export const validateDemoDataConsistency = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // 1. Validate Wallet Mathematical Balance
  let calculatedBalance = 0;
  // Transactions are ordered newest-to-oldest, let's reverse to trace
  const chronologicalTxs = [...DEMO_WALLET_TRANSACTIONS].reverse();

  chronologicalTxs.forEach((tx) => {
    if (tx.status === 'SUCCESS') {
      if (tx.isCredit) {
        calculatedBalance += tx.amountRupees;
      } else {
        calculatedBalance -= tx.amountRupees;
      }
    }
  });

  const expectedBalance = DEMO_USER_PROFILE.walletBalancePaise / 100;
  if (Math.abs(calculatedBalance - expectedBalance) > 0.01) {
    errors.push(
      `Wallet Balance Mismatch: User Profile has ₹${expectedBalance}, but transactions ledger sum is ₹${calculatedBalance}`
    );
  }

  // 2. Validate Charging Sessions ↔ Wallet Debit Matching
  DEMO_CHARGING_SESSIONS.forEach((session) => {
    const costRupees = (session.finalAmountPaise || 0) / 100;
    const matchingTx = DEMO_WALLET_TRANSACTIONS.find(
      (tx) =>
        !tx.isCredit &&
        tx.status === 'SUCCESS' &&
        Math.abs(tx.amountRupees - costRupees) < 0.01
    );

    if (!matchingTx) {
      errors.push(
        `Charging Session ${session.id} (₹${costRupees}) has no matching wallet debit transaction`
      );
    }
  });

  // 3. Validate Favorite Stations
  DEMO_FAVORITE_STATION_IDS.forEach((stId) => {
    const exists = mockStations.some((s) => s.id === stId);
    if (!exists) {
      errors.push(`Favorite Station ID "${stId}" does not exist in mockStations list`);
    }
  });

  // 4. Validate Primary Vehicle
  if (DEMO_PRIMARY_VEHICLE.userId !== DEMO_USER_PROFILE.id) {
    errors.push(`Primary Vehicle userId does not match demo user id`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
