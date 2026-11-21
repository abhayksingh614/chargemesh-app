import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@supabase/server/core';

export interface SupabaseConnectionStatus {
  connected: boolean;
  url?: string;
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  error?: string;
  timestamp: string;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;
  private readonly url: string | undefined;
  private readonly publishableKey: string | undefined;
  private readonly secretKey: string | undefined;
  private readonly jwksUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.url =
      this.configService.get<string>('app.supabase.url') ||
      process.env.SUPABASE_URL;
    this.publishableKey =
      this.configService.get<string>('app.supabase.publishableKey') ||
      process.env.SUPABASE_PUBLISHABLE_KEY;
    this.secretKey =
      this.configService.get<string>('app.supabase.secretKey') ||
      process.env.SUPABASE_SECRET_KEY;
    this.jwksUrl =
      this.configService.get<string>('app.supabase.jwksUrl') ||
      process.env.SUPABASE_JWKS_URL;

    this.initClients();
  }

  private initClients(): void {
    if (!this.url) {
      this.logger.warn(
        'Supabase URL is not configured. Supabase services will remain disabled.',
      );
      return;
    }

    try {
      // Initialize admin client using @supabase/server/core if secret key is present
      if (this.secretKey) {
        try {
          this.adminClient = createAdminClient({
            env: {
              url: this.url,
              secretKeys: { default: this.secretKey },
            },
          });
        } catch {
          this.adminClient = createClient(this.url, this.secretKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });
        }
      }

      // Initialize standard client with publishable key or fallback to secret key
      const clientKey = this.publishableKey || this.secretKey;
      if (clientKey) {
        this.client = createClient(this.url, clientKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      }
    } catch (error: any) {
      this.logger.error(`Failed to initialize Supabase clients: ${error.message}`, error.stack);
    }
  }

  async onModuleInit(): Promise<void> {
    if (this.isConfigured()) {
      const status = await this.testConnection();
      if (status.connected) {
        this.logger.log(`Supabase connection established successfully (${this.url})`);
      } else {
        this.logger.warn(`Supabase connection test failed: ${status.error}`);
      }
    } else {
      this.logger.log('Supabase integration is idle (credentials not configured)');
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.url && (this.publishableKey || this.secretKey));
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getAdminClient(): SupabaseClient | null {
    return this.adminClient;
  }

  public getUrl(): string | undefined {
    return this.url;
  }

  public getJwksUrl(): string | undefined {
    return this.jwksUrl;
  }

  public async testConnection(): Promise<SupabaseConnectionStatus> {
    const status: SupabaseConnectionStatus = {
      connected: false,
      url: this.url,
      hasPublishableKey: Boolean(this.publishableKey),
      hasSecretKey: Boolean(this.secretKey),
      timestamp: new Date().toISOString(),
    };

    if (!this.url || (!this.publishableKey && !this.secretKey)) {
      status.error = 'Supabase credentials are incomplete or missing';
      return status;
    }

    try {
      // Test connectivity against the JWKS endpoint or health endpoint
      const targetJwks =
        this.jwksUrl || `${this.url.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;

      const response = await fetch(targetJwks, {
        method: 'GET',
        headers: {
          apikey: (this.secretKey || this.publishableKey)!,
        },
      });

      if (response.ok) {
        status.connected = true;
      } else {
        status.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (err: any) {
      status.error = err.message;
    }

    return status;
  }

  public async verifyUserToken(jwt: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    if (!this.adminClient && !this.client) {
      return { valid: false, error: 'Supabase client is not configured' };
    }

    try {
      const activeClient = this.adminClient || this.client;
      const { data, error } = await activeClient!.auth.getUser(jwt);

      if (error || !data.user) {
        return { valid: false, error: error?.message || 'Invalid user token' };
      }

      return { valid: true, user: data.user };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }
}
