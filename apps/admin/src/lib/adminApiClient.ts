/**
 * ChargeMesh Admin Portal - Central System API Client
 * Connects Next.js web application to NestJS Administrative Backend API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.ADMIN_API_URL ||
  'http://localhost:3000/api/v1/admin';

export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AdminApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('chargemesh_admin_token');
    }
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('chargemesh_admin_token', token);
      } else {
        localStorage.removeItem('chargemesh_admin_token');
      }
    }
  }

  getAuthToken(): string | null {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<AdminApiResponse<T>> {
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
          error: json.message || `Admin API Error (HTTP ${response.status})`,
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
        error: err.message || 'Failed to communicate with Admin Central System',
      };
    }
  }

  // --- Administrative Authentication ---

  async login(email: string, password?: string): Promise<AdminApiResponse<{ token: string; user: any }>> {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res;
  }

  async logout(): Promise<AdminApiResponse> {
    const res = await this.request('/auth/logout', { method: 'POST' });
    this.setAuthToken(null);
    return res;
  }

  async getProfile(): Promise<AdminApiResponse<any>> {
    return this.request('/auth/profile');
  }

  async changePassword(currentPassword?: string, newPassword?: string): Promise<AdminApiResponse<any>> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // --- Administrative Data ---

  async getDashboard(): Promise<AdminApiResponse<any>> {
    return this.request('/dashboard');
  }

  async getDrivers(): Promise<AdminApiResponse<any[]>> {
    return this.request('/users/drivers');
  }

  async getCpos(): Promise<AdminApiResponse<any[]>> {
    return this.request('/cpos');
  }

  async getLedger(): Promise<AdminApiResponse<any[]>> {
    return this.request('/finance/ledger');
  }

  async getAuditLogs(): Promise<AdminApiResponse<any[]>> {
    return this.request('/audit');
  }
}

export const adminApiClient = new AdminApiClient();
