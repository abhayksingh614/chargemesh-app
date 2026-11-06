/**
 * ChargeMesh Shared Types
 * Canonical TypeScript types shared across backend, admin, and mobile.
 * Source of truth for API contracts and data models.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ConnectorStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  UNAVAILABLE = 'UNAVAILABLE',
  RESERVED = 'RESERVED',
  OFFLINE = 'OFFLINE',
  UNKNOWN = 'UNKNOWN',
  STALE = 'STALE',
}

export enum FreshnessState {
  LIVE = 'LIVE',
  DELAYED = 'DELAYED',
  UNKNOWN = 'UNKNOWN',
}

export enum ConnectorType {
  CCS2 = 'CCS2',
  CHADEMO = 'CHADEMO',
  TYPE2 = 'TYPE2',
  GBT = 'GBT',
  TYPE1 = 'TYPE1',
  CCS1 = 'CCS1',
  OTHER = 'OTHER',
}

export enum PowerType {
  AC_1_PHASE = 'AC_1_PHASE',
  AC_3_PHASE = 'AC_3_PHASE',
  DC = 'DC',
}

export enum SessionStatus {
  REQUESTED = 'REQUESTED',
  AUTHORIZING = 'AUTHORIZING',
  STARTING = 'STARTING',
  CHARGING = 'CHARGING',
  STOPPING = 'STOPPING',
  COMPLETED = 'COMPLETED',
  RECONCILED = 'RECONCILED',
  // Failure states
  AUTH_FAILED = 'AUTH_FAILED',
  START_FAILED = 'START_FAILED',
  INTERRUPTED = 'INTERRUPTED',
  STOP_FAILED = 'STOP_FAILED',
  RECONCILIATION_REQUIRED = 'RECONCILIATION_REQUIRED',
  REFUND_REQUIRED = 'REFUND_REQUIRED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export enum ChargeTarget {
  AMOUNT = 'AMOUNT',     // INR amount
  ENERGY = 'ENERGY',     // kWh
  TIME = 'TIME',         // Minutes
  BATTERY = 'BATTERY',   // % SOC (only when reliably supported)
}

export enum CompatibilityResult {
  COMPATIBLE = 'COMPATIBLE',
  BEST_MATCH = 'BEST_MATCH',
  LIMITED = 'LIMITED',
  NOT_COMPATIBLE = 'NOT_COMPATIBLE',
  UNKNOWN = 'UNKNOWN',
}

export enum CpoProtocol {
  OCPI_2_3 = 'OCPI_2_3',
  OCPI_2_2 = 'OCPI_2_2',
  PROPRIETARY = 'PROPRIETARY',
}

export enum CpoIntegrationStatus {
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  ONBOARDING = 'ONBOARDING',
  DISABLED = 'DISABLED',
}

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Cpo {
  id: string;
  name: string;
  partyId: string;
  countryCode: string;
  logoUrl?: string;
  website?: string;
  supportPhone?: string;
  supportEmail?: string;
  protocol: CpoProtocol;
  integrationStatus: CpoIntegrationStatus;
  lastSyncAt?: string; // ISO8601
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  cpoId: string;
  externalId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates: Coordinates;
  openingTimes?: string;
  parkingRestrictions?: string;
  facilities?: string[];
  directions?: string;
  helpPhone?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evse {
  id: string;
  locationId: string;
  externalId: string;
  physicalReference?: string;
  capabilities?: string[];
  lastUpdated: string;
}

export interface Connector {
  id: string;
  evseId: string;
  externalId: string;
  type: ConnectorType;
  powerType: PowerType;
  maxVoltage?: number;
  maxAmperage?: number;
  maxPower?: number;   // kW
  status: ConnectorStatus;
  freshnessState: FreshnessState;
  sourceStatusTimestamp?: string;
  ingestedTimestamp?: string;
  dataAgeSeconds?: number;
  tariffId?: string;
  lastUpdated: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Tariff {
  id: string;
  cpoId: string;
  currency: string;
  energyPricePerKwh?: number;
  timePricePerMinute?: number;
  flatFee?: number;
  idleFeePerMinute?: number;
  taxPercent?: number;
  minAmount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
}

export interface ChargingSession {
  id: string;
  userId: string;
  cpoId: string;
  locationId: string;
  evseId: string;
  connectorId: string;
  cpoSessionId?: string;
  status: SessionStatus;
  chargeTarget?: ChargeTarget;
  chargeTargetValue?: number;
  startTime?: string;
  endTime?: string;
  energyKwh?: number;
  durationSeconds?: number;
  tariffId?: string;
  estimatedAmountPaise?: number;
  finalAmountPaise?: number;
  paymentId?: string;
  cdrId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  variant?: string;
  registrationPlate?: string;
  connectorTypes: ConnectorType[];
  maxAcPowerKw?: number;
  maxDcPowerKw?: number;
  batteryCapacityKwh?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface ChargingPreferences {
  autoFilterIncompatible: boolean;
  preferredSpeed: 'ULTRA_FAST' | 'FAST' | 'AC_FAST' | 'ALL';
  preferredConnector: ConnectorType | 'ALL';
  preferredNetworks: string[];
  searchRadiusKm: number;
}

export interface NotificationPreferences {
  sessionAlerts: boolean;
  completionAlerts: boolean;
  stationAvailabilityAlerts: boolean;
  emailInvoices: boolean;
  promotionalOffers: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  dob?: string;
  gender?: UserGender;
  
  // Location Details
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  address?: string;
  
  // Account & Membership
  userCode?: string;
  membershipTier?: string;
  memberSince?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  profileCompletionPercentage?: number;

  // ₹100 Joining Bonus
  joiningBonusStatus?: 'CREDITED' | 'PENDING' | 'USED';
  joiningBonusAmountPaise?: number;

  // Financial & Stats
  walletBalancePaise: number;
  totalKwhCharged: number;
  co2SavedKg: number;
  totalSessions: number;
  authProvider?: 'phone' | 'email' | 'google' | 'guest';

  // Preferences
  chargingPreferences?: ChargingPreferences;
  notificationPreferences?: NotificationPreferences;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Admin Dashboard & RBAC Models ───────────────────────────────────────────

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  ANALYST = 'ANALYST',
}

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  department?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AuditActionType {
  USER_SUSPEND = 'USER_SUSPEND',
  USER_REACTIVATE = 'USER_REACTIVATE',
  WALLET_ADJUSTMENT = 'WALLET_ADJUSTMENT',
  PAYMENT_REFUND = 'PAYMENT_REFUND',
  CPO_UPDATE = 'CPO_UPDATE',
  CPO_SYNC_TRIGGER = 'CPO_SYNC_TRIGGER',
  STATION_CREATE = 'STATION_CREATE',
  STATION_UPDATE = 'STATION_UPDATE',
  REMOTE_COMMAND_EXECUTE = 'REMOTE_COMMAND_EXECUTE',
  EV_MASTER_UPDATE = 'EV_MASTER_UPDATE',
  BROADCAST_CREATE = 'BROADCAST_CREATE',
  ADMIN_USER_CREATE = 'ADMIN_USER_CREATE',
  ADMIN_USER_UPDATE = 'ADMIN_USER_UPDATE',
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole;
  action: AuditActionType;
  targetEntity: 'USER' | 'WALLET' | 'PAYMENT' | 'CPO' | 'STATION' | 'CHARGER' | 'EV_MASTER' | 'BROADCAST' | 'ADMIN';
  targetId: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
}

export interface AdminCpoDetail extends Cpo {
  apiEndpointUrl?: string;
  apiKeyMasked?: string;
  syncFrequencySeconds: number;
  totalStationCount: number;
  totalOnlineChargers: number;
  totalSessionsLifetime: number;
  revenueSharePercent: number;
  uptimePercent30d: number;
  lastSyncResult?: {
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    locationsSynced: number;
    tariffsSynced: number;
    errorCount: number;
    timestamp: string;
  };
}

export interface OemBrandMaster {
  id: string;
  name: string;
  logoEmoji: string;
  country: string;
  modelCount: number;
  models: EvModelMaster[];
}

export interface EvModelMaster {
  id: string;
  brandId: string;
  name: string;
  bodyType: 'SUV' | 'SEDAN' | 'HATCHBACK' | 'CROSSOVER' | 'VAN';
  variants: EvVariantMaster[];
}

export interface EvVariantMaster {
  id: string;
  modelId: string;
  name: string;
  batteryCapacityKwh: number;
  maxDcPowerKw: number;
  maxAcPowerKw: number;
  rangeKm: number;
  connectorTypes: ConnectorType[];
  releaseYear?: number;
  isVerified: boolean;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeDrivers24h: number;
  totalCpos: number;
  totalStations: number;
  chargers: {
    available: number;
    inUse: number;
    unavailable: number;
    offline: number;
    stale: number;
    total: number;
  };
  todayRevenueInr: number;
  todayEnergyKwh: number;
  todayCo2SavedKg: number;
  activeLiveSessions: number;
  recentAlerts: {
    id: string;
    level: 'INFO' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    timestamp: string;
  }[];
}

export interface AdminWalletAdjustmentRequest {
  userId: string;
  amountRupees: number;
  isCredit: boolean;
  reason: string;
  referenceTicketId?: string;
}

export interface AdminUserStatusUpdateRequest {
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  reason: string;
}

export interface AdminBroadcastRequest {
  title: string;
  message: string;
  targetAudience: 'ALL' | 'ACTIVE_DRIVERS' | 'REGION' | 'VEHICLE_MAKE';
  regionFilter?: string;
  vehicleMakeFilter?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

