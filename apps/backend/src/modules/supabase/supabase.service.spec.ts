import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/server/core', () => ({
  createAdminClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'usr-test' } }, error: null }),
    },
  }),
  resolveEnv: jest.fn().mockReturnValue({
    data: {
      url: 'https://mock-project.supabase.co',
      secretKeys: { default: 'sb_secret_mock_test_key_67890' },
    },
    error: null,
  }),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'app.supabase.url':
          return 'https://mock-project.supabase.co';
        case 'app.supabase.publishableKey':
          return 'sb_publishable_mock_test_key_12345';
        case 'app.supabase.secretKey':
          return 'sb_secret_mock_test_key_67890';
        case 'app.supabase.jwksUrl':
          return 'https://mock-project.supabase.co/auth/v1/.well-known/jwks.json';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report as configured when credentials are provided', () => {
    expect(service.isConfigured()).toBe(true);
    expect(service.getUrl()).toBe('https://mock-project.supabase.co');
  });

  it('should return Supabase client instance', () => {
    const client = service.getClient();
    expect(client).toBeDefined();
  });

  it('should return Supabase admin client instance', () => {
    const adminClient = service.getAdminClient();
    expect(adminClient).toBeDefined();
  });

  it('should test connection and report status', async () => {
    // Mock global fetch
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const status = await service.testConnection();
    expect(status.connected).toBe(true);
    expect(status.hasPublishableKey).toBe(true);
    expect(status.hasSecretKey).toBe(true);

    global.fetch = originalFetch;
  });

  it('should gracefully handle unconfigured service', async () => {
    const unconfiguredConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: unconfiguredConfigService,
        },
      ],
    }).compile();

    const unconfiguredService = module.get<SupabaseService>(SupabaseService);
    expect(unconfiguredService.isConfigured()).toBe(false);
    expect(unconfiguredService.getClient()).toBeNull();
    expect(unconfiguredService.getAdminClient()).toBeNull();

    const status = await unconfiguredService.testConnection();
    expect(status.connected).toBe(false);
    expect(status.error).toContain('missing');
  });
});
