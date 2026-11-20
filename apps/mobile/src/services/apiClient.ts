/**
 * ChargeMesh Driver Mobile - Unified Backend API Client
 * Connects React Native driver application to NestJS Central System API
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  getAuthToken(): string | null {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: json.message || `Request failed with HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network communication error',
      };
    }
  }

  // --- Authentication ---

  async sendOtp(phoneNumber: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async login(
    phoneNumber: string,
    otp: string,
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
    if (res.success && res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res;
  }

  async logout(): Promise<ApiResponse> {
    const res = await this.request('/auth/logout', { method: 'POST' });
    this.setAuthToken(null);
    return res;
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // --- Charging Stations ---

  async getStations(
    lat = 28.6315,
    lng = 77.2167,
    radiusKm = 25,
  ): Promise<ApiResponse<any[]>> {
    return this.request(`/stations?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
  }

  async getStationDetail(stationId: string): Promise<ApiResponse<any>> {
    return this.request(`/stations/${stationId}`);
  }

  // --- Wallet & Payments ---

  async getWalletBalance(): Promise<
    ApiResponse<{
      walletBalancePaise: number;
      walletHeldPaise: number;
      availableBalancePaise: number;
      balanceRupees: number;
      availableRupees: number;
    }>
  > {
    return this.request('/wallet/balance');
  }

  async createTopupOrder(
    amountRupees: number,
  ): Promise<ApiResponse<{ orderId: string; amountPaise: number; keyId: string }>> {
    return this.request('/wallet/order', {
      method: 'POST',
      body: JSON.stringify({ amountRupees }),
    });
  }

  async verifyTopup(paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amountRupees: number;
  }): Promise<ApiResponse<{ success: boolean; newBalanceRupees: number }>> {
    return this.request('/wallet/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // --- Charging Sessions ---

  async startSession(data: {
    stationId: string;
    connectorId: string;
    target?: { type: string; value: number };
  }): Promise<ApiResponse<any>> {
    return this.request('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stopSession(sessionId: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request(`/sessions/${sessionId}/stop`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.request(`/sessions/${sessionId}`);
  }
}

export const apiClient = new ApiClient();
