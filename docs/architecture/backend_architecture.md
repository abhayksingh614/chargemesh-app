# Backend Platform Architecture

> **Component:** `apps/backend`  
> **Source:** NestJS 10.3 Gateway Architecture  

This diagram documents the modular architecture of the ChargeMesh backend gateway, mapping HTTP REST controllers, WebSocket gateways, dependency-injected services, and request pipelines.

```mermaid
flowchart TD
    subgraph Ingress["Ingress & Middleware Pipeline"]
        HttpEntry["HTTP Ingress (Port 3001)"]
        WsEntry["WebSocket Ingress (ws / wss)"]
        
        CorsFilter["CORS Validation"]
        Validation["Global ValidationPipe (class-validator)"]
        ExceptionFilter["HttpExceptionFilter"]
        Transform["TransformInterceptor"]
        JwtGuard["JwtAuthGuard (Passport JWT)"]
        RolesGuard["RolesGuard (RBAC)"]
    end

    subgraph Controllers["NestJS Controllers"]
        AuthController["AuthController (/api/v1/auth)"]
        StationsController["StationsController (/api/v1/stations)"]
        SessionsController["SessionsController (/api/v1/sessions)"]
        AdminAuditController["AdminAuditController (/api/v1/admin/audit)"]
        AdminAuthController["AdminAuthController (/api/v1/admin/auth)"]
        AdminCpoController["AdminCpoController (/api/v1/admin/cpos)"]
        AdminDashController["AdminDashboardController (/api/v1/admin/dashboard)"]
        AdminFinanceController["AdminFinanceController (/api/v1/admin/finance)"]
        AdminUsersController["AdminUsersController (/api/v1/admin/users)"]
    end

    subgraph Gateways["WebSocket Gateways"]
        OcppGateway["OcppGateway (/ocpp)\n- CSMS Server for Chargers"]
        TelemetryGateway["TelemetryGateway (/telemetry)\n- Real-Time Broadcast Stream"]
    end

    subgraph Services["Core Domain Services"]
        AuthService["AuthService\n- Password Verification (bcrypt)\n- Token Minting (JwtService)"]
        StationsService["StationsService\n- Haversine Spatial Query\n- Connector Status Aggregation"]
        SessionsService["SessionsService\n- Session State Machine\n- Remote Start/Stop Commands"]
        OcppService["OcppService\n- OCPP 1.6-J & 2.0.1 Protocol Engine\n- Transaction Manager"]
        TelemetryService["TelemetryService\n- Metric Broadcaster"]
        AdminServices["Admin Services\n- CPO Sync, Stats, Moderation, Ledger"]
    end

    HttpEntry --> CorsFilter --> Validation --> ExceptionFilter --> Transform
    Transform --> JwtGuard --> Controllers
    JwtGuard --> RolesGuard --> AdminAuditController & AdminCpoController & AdminDashController & AdminFinanceController & AdminUsersController

    WsEntry --> OcppGateway & TelemetryGateway

    AuthController --> AuthService
    StationsController --> StationsService
    SessionsController --> SessionsService
    SessionsController --> OcppService
    SessionsController --> StationsService

    OcppGateway --> OcppService
    OcppService --> TelemetryService
    TelemetryService --> TelemetryGateway

    AdminAuditController & AdminAuthController & AdminCpoController & AdminDashController & AdminFinanceController & AdminUsersController --> AdminServices
```
