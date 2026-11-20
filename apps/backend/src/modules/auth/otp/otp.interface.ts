export interface OtpSendResult {
  requestId: string;
  cooldownSeconds: number;
  debugCode?: string;
}

export interface StoredOtpRecord {
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  lastSentAt: number;
  purpose: string;
}

export interface IOtpProvider {
  readonly providerName: string;
  sendOtp(phoneNumber: string, code: string): Promise<OtpSendResult>;
  isAvailable(): boolean;
}

export interface IOtpStorage {
  get(phone: string, purpose?: string): Promise<StoredOtpRecord | null>;
  set(phone: string, record: StoredOtpRecord, ttlMs: number): Promise<void>;
  incrementAttempts(phone: string, purpose?: string): Promise<number>;
  delete(phone: string, purpose?: string): Promise<void>;
  readonly isConnected: boolean;
}
