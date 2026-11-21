/**
 * ChargeMesh Admin Portal - Central System API Client
 * Connects Next.js web application to NestJS Administrative Backend API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  process.env.ADMIN_API_URL ||
  'http://localhost:3000/api/v1/admin';

const ROOT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

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
    useRoot = false,
  ): Promise<AdminApiResponse<T>> {
    const baseUrl = useRoot ? ROOT_API_URL : API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;
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

  // --- Administrative Data & Management ---

  async getDashboard(): Promise<AdminApiResponse<any>> {
    return this.request('/dashboard/stats');
  }

  async getDrivers(query?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdminApiResponse<any>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/users${qStr}`);
  }

  async updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
    reason: string,
  ): Promise<AdminApiResponse<any>> {
    return this.request(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  async getCpos(): Promise<AdminApiResponse<any[]>> {
    return this.request('/cpos');
  }

  async triggerCpoSync(cpoId: string): Promise<AdminApiResponse<any>> {
    return this.request(`/cpos/${cpoId}/trigger-sync`, {
      method: 'POST',
    });
  }

  async getLedger(query?: {
    search?: string;
    userId?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdminApiResponse<any>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.userId) params.append('userId', query.userId);
    if (query?.type) params.append('type', query.type);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/finance/transactions${qStr}`);
  }

  async adjustWalletBalance(payload: {
    userId: string;
    amountRupees: number;
    isCredit: boolean;
    reason: string;
    referenceTicketId?: string;
  }): Promise<AdminApiResponse<any>> {
    return this.request('/finance/wallet/adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAuditLogs(query?: {
    targetEntity?: string;
    actorId?: string;
  }): Promise<AdminApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (query?.targetEntity) params.append('targetEntity', query.targetEntity);
    if (query?.actorId) params.append('actorId', query.actorId);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/audit-logs${qStr}`);
  }

  async getSessions(query?: {
    status?: string;
    search?: string;
  }): Promise<AdminApiResponse<any>> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dashboard/sessions${qStr}`);
  }

  async getStations(): Promise<AdminApiResponse<any[]>> {
    return this.request('/stations', {}, true);
  }

  async updateStationTariff(id: string, tariffPerKwh: number): Promise<AdminApiResponse<any>> {
    return this.request(`/stations/${id}/tariff`, {
      method: 'PUT',
      body: JSON.stringify({ tariffPerKwh }),
    }, true);
  }
}

export const adminApiClient = new AdminApiClient();
