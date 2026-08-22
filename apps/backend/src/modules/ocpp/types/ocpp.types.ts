export enum OcppMessageType {
  CALL = 2,
  CALLRESULT = 3,
  CALLERROR = 4,
}

export type OcppCallFrame = [
  OcppMessageType.CALL,
  string, // MessageId
  string, // Action
  Record<string, any>, // Payload
];

export type OcppCallResultFrame = [
  OcppMessageType.CALLRESULT,
  string, // MessageId
  Record<string, any>, // Payload
];

export type OcppCallErrorFrame = [
  OcppMessageType.CALLERROR,
  string, // MessageId
  string, // ErrorCode
  string, // ErrorDescription
  Record<string, any>, // ErrorDetails
];

export type OcppFrame = OcppCallFrame | OcppCallResultFrame | OcppCallErrorFrame;

export enum OcppAction {
  BOOT_NOTIFICATION = 'BootNotification',
  HEARTBEAT = 'Heartbeat',
  STATUS_NOTIFICATION = 'StatusNotification',
  AUTHORIZE = 'Authorize',
  START_TRANSACTION = 'StartTransaction',
  STOP_TRANSACTION = 'StopTransaction',
  METER_VALUES = 'MeterValues',
  REMOTE_START_TRANSACTION = 'RemoteStartTransaction',
  REMOTE_STOP_TRANSACTION = 'RemoteStopTransaction',
  RESET = 'Reset',
  UNLOCK_CONNECTOR = 'UnlockConnector',
}

export enum OcppErrorCode {
  NOT_IMPLEMENTED = 'NotImplemented',
  NOT_SUPPORTED = 'NotSupported',
  INTERNAL_ERROR = 'InternalError',
  PROTOCOL_ERROR = 'ProtocolError',
  SECURITY_ERROR = 'SecurityError',
  FORMATION_VIOLATION = 'FormationViolation',
  PROPERTY_CONSTRAINT_VIOLATION = 'PropertyConstraintViolation',
  OCCURRENCE_CONSTRAINT_VIOLATION = 'OccurrenceConstraintViolation',
  TYPE_CONSTRAINT_VIOLATION = 'TypeConstraintViolation',
  GENERIC_ERROR = 'GenericError',
}

export interface BootNotificationRequest {
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber?: string;
  chargeBoxSerialNumber?: string;
  firmwareVersion?: string;
  iccid?: string;
  imsi?: string;
  meterType?: string;
  meterSerialNumber?: string;
}

export interface BootNotificationResponse {
  status: 'Accepted' | 'Pending' | 'Rejected';
  currentTime: string;
  interval: number;
}

export interface HeartbeatResponse {
  currentTime: string;
}

export interface StatusNotificationRequest {
  connectorId: number;
  errorCode: string;
  info?: string;
  status: 'Available' | 'Preparing' | 'Charging' | 'SuspendedEVSE' | 'SuspendedEV' | 'Finishing' | 'Reserved' | 'Unavailable' | 'Faulted';
  timestamp?: string;
  vendorId?: string;
  vendorErrorCode?: string;
}

export interface AuthorizeRequest {
  idTag: string;
}

export interface AuthorizeResponse {
  idTagInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
    expiryDate?: string;
    parentIdTag?: string;
  };
}

export interface StartTransactionRequest {
  connectorId: number;
  idTag: string;
  meterStart: number;
  reservationId?: number;
  timestamp: string;
}

export interface StartTransactionResponse {
  transactionId: number;
  idTagInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
  };
}

export interface StopTransactionRequest {
  idTag?: string;
  meterStop: number;
  timestamp: string;
  transactionId: number;
  reason?: string;
  transactionData?: any[];
}

export interface StopTransactionResponse {
  idTagInfo?: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid';
  };
}

export interface MeterValueSample {
  timestamp: string;
  sampledValue: Array<{
    value: string;
    context?: string;
    format?: string;
    measurand?: string;
    phase?: string;
    location?: string;
    unit?: string;
  }>;
}

export interface MeterValuesRequest {
  connectorId: number;
  transactionId?: number;
  meterValue: MeterValueSample[];
}

export interface RemoteStartTransactionRequest {
  connectorId?: number;
  idTag: string;
  chargingProfile?: any;
}

export interface RemoteStartTransactionResponse {
  status: 'Accepted' | 'Rejected';
}

export interface RemoteStopTransactionRequest {
  transactionId: number;
}

export interface RemoteStopTransactionResponse {
  status: 'Accepted' | 'Rejected';
}
