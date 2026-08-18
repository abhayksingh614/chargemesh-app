/**
 * ChargeMesh Shared Constants
 * Business rules and constants shared across backend, admin, and mobile.
 * These values enforce product-level policies from the ChargeMesh specifications.
 */

// ─── Status Freshness Thresholds ──────────────────────────────────────────────

/** Connector status is considered STALE after this many seconds */
export const STATUS_STALE_THRESHOLD_SECONDS = 300; // 5 minutes

/** Connector status is considered UNKNOWN if no data received within this window */
export const STATUS_UNKNOWN_THRESHOLD_SECONDS = 900; // 15 minutes

// ─── Charging Rules ───────────────────────────────────────────────────────────

/**
 * CRITICAL: Unknown status must NEVER be treated as Available.
 * This constant documents and enforces that product rule.
 */
export const UNKNOWN_IS_NOT_AVAILABLE = true;

/**
 * CRITICAL: Stale status must show a freshness warning.
 * Stale data must never be silently presented as live availability.
 */
export const STALE_REQUIRES_WARNING = true;

/** Maximum time (ms) to wait for CPO start command response */
export const CPO_START_COMMAND_TIMEOUT_MS = 30_000;

/** Maximum time (ms) to wait for CPO stop command response */
export const CPO_STOP_COMMAND_TIMEOUT_MS = 15_000;

/** Maximum session idle time before auto-review (seconds) */
export const SESSION_MAX_IDLE_SECONDS = 7_200;

// ─── Payment Constants ────────────────────────────────────────────────────────

/** Currency for all transactions */
export const DEFAULT_CURRENCY = 'INR';

/** Minimum chargeable amount in paise (₹1.00) */
export const MINIMUM_CHARGE_AMOUNT_PAISE = 100;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Map / Location ───────────────────────────────────────────────────────────

/** Default search radius in kilometers */
export const DEFAULT_SEARCH_RADIUS_KM = 5;

/** Maximum allowed search radius in kilometers */
export const MAX_SEARCH_RADIUS_KM = 50;

/** Default map center — India (used when no location available) */
export const DEFAULT_MAP_CENTER = {
  latitude: 20.5937,
  longitude: 78.9629,
};

/** Default map zoom level */
export const DEFAULT_MAP_ZOOM = 5;

/** Zoom level for "near me" view */
export const NEARBY_MAP_ZOOM = 13;

// ─── Connector Types — Supported ─────────────────────────────────────────────

/** Connector types supported by the ChargeMesh catalog */
export const SUPPORTED_CONNECTOR_TYPES = [
  'CCS2',
  'CHADEMO',
  'TYPE2',
  'GBT',
  'TYPE1',
  'CCS1',
] as const;

// ─── OTP ─────────────────────────────────────────────────────────────────────
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 300;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// ─── OCPI ────────────────────────────────────────────────────────────────────
export const OCPI_COUNTRY_CODE = 'IN';
export const OCPI_PARTY_ID = 'CM';
export const OCPI_SUPPORTED_VERSION = '2.3';

// ─── Eco Impact (Future) ──────────────────────────────────────────────────────

/**
 * CO2 factor for India grid (kg CO2 per kWh).
 * Source must be documented and labelled as an estimate.
 * Update periodically as India's grid mix changes.
 */
export const INDIA_GRID_CO2_KG_PER_KWH = 0.71; // approximate 2024 value

// ─── Feature Flags (Default Values) ──────────────────────────────────────────

export const FEATURE_FLAGS = {
  ECO_IMPACT: false,           // CO2 avoided display
  WALLET: false,               // Stored-value wallet (requires regulatory clearance)
  RESERVATIONS: false,         // Booking/reservation feature
  SMART_CHARGING: false,       // Smart charging optimization
  BATTERY_TARGET: false,       // Charge-to-% target (requires reliable vehicle integration)
} as const;

// ─── Error Codes ──────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  OTP_INVALID: 'AUTH_003',
  OTP_EXPIRED: 'AUTH_004',

  // Session
  SESSION_NOT_FOUND: 'SESSION_001',
  SESSION_ALREADY_ACTIVE: 'SESSION_002',
  CONNECTOR_UNAVAILABLE: 'SESSION_003',
  CPO_START_FAILED: 'SESSION_004',
  CPO_STOP_FAILED: 'SESSION_005',
  CPO_TIMEOUT: 'SESSION_006',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_001',
  PAYMENT_ALREADY_CAPTURED: 'PAYMENT_002',
  REFUND_FAILED: 'PAYMENT_003',
  RECONCILIATION_PENDING: 'PAYMENT_004',

  // Connector/Status
  STATUS_UNKNOWN: 'STATUS_001',
  STATUS_STALE: 'STATUS_002',
  CONNECTOR_NOT_FOUND: 'STATUS_003',

  // General
  NOT_FOUND: 'GENERAL_001',
  VALIDATION_ERROR: 'GENERAL_002',
  INTERNAL_ERROR: 'GENERAL_003',
  RATE_LIMITED: 'GENERAL_004',
} as const;
