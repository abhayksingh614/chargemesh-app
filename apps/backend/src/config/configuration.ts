export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  ocppPort: number;
  corsOrigins: string[];
}

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET || 'chargemesh-super-secret-jwt-key-2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ocppPort: parseInt(process.env.OCPP_PORT || '9000', 10),
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  },
});
