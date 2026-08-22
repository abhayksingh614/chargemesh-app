import { Injectable, NotFoundException } from '@nestjs/common';
import { FindStationsDto } from './dto/find-stations.dto';
import { OcppService } from '../ocpp/ocpp.service';

export interface StationConnector {
  id: string;
  connectorNumber: number;
  type: string;
  powerKw: number;
  status: 'AVAILABLE' | 'IN_USE' | 'UNAVAILABLE' | 'UNKNOWN' | 'OFFLINE';
  pricePerKwh: number;
  lastUpdated: string;
}

export interface StationEntity {
  id: string;
  chargePointId: string;
  name: string;
  operator: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: string;
  distanceKm?: number;
  rating: number;
  totalReviews: number;
  amenities: string[];
  connectors: StationConnector[];
}

@Injectable()
export class StationsService {
  private stations: StationEntity[] = [
    {
      id: 'st-delhi-001',
      chargePointId: 'CP-DELHI-001',
      name: 'Connaught Place Supercharge Hub',
      operator: 'Tata Power EZ Charge',
      address: 'Outer Circle, Near Metro Gate 4, New Delhi',
      city: 'New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      rating: 4.8,
      totalReviews: 142,
      amenities: ['Café', 'Restrooms', 'WiFi', '24/7 Security'],
      connectors: [
        {
          id: 'conn-01',
          connectorNumber: 1,
          type: 'CCS2',
          powerKw: 60,
          status: 'AVAILABLE',
          pricePerKwh: 18.5,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'conn-02',
          connectorNumber: 2,
          type: 'CCS2',
          powerKw: 60,
          status: 'AVAILABLE',
          pricePerKwh: 18.5,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'conn-03',
          connectorNumber: 3,
          type: 'TYPE2',
          powerKw: 22,
          status: 'AVAILABLE',
          pricePerKwh: 14.0,
          lastUpdated: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'st-aerocity-002',
      chargePointId: 'CP-AEROCITY-002',
      name: 'Aerocity Worldmark Fast Hub',
      operator: 'Jio-bp pulse',
      address: 'Asset Area 8, Hospitality District, Aerocity, Delhi',
      city: 'New Delhi',
      latitude: 28.552,
      longitude: 77.1215,
      rating: 4.9,
      totalReviews: 89,
      amenities: ['Shopping Mall', 'Dining', 'Valet', 'Covered Parking'],
      connectors: [
        {
          id: 'conn-04',
          connectorNumber: 1,
          type: 'CCS2',
          powerKw: 120,
          status: 'AVAILABLE',
          pricePerKwh: 21.0,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'conn-05',
          connectorNumber: 2,
          type: 'CCS2',
          powerKw: 120,
          status: 'AVAILABLE',
          pricePerKwh: 21.0,
          lastUpdated: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'st-gurgaon-003',
      chargePointId: 'CP-CYBERHUB-003',
      name: 'Cyber Hub Rapid Charger',
      operator: 'Statiq',
      address: 'DLF Cyber City, Phase 2, Sector 24, Gurugram',
      city: 'Gurugram',
      latitude: 28.4952,
      longitude: 77.0892,
      rating: 4.7,
      totalReviews: 210,
      amenities: ['Restaurants', 'ATM', 'Coffee Shop'],
      connectors: [
        {
          id: 'conn-06',
          connectorNumber: 1,
          type: 'CCS2',
          powerKw: 50,
          status: 'AVAILABLE',
          pricePerKwh: 17.5,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'conn-07',
          connectorNumber: 2,
          type: 'CHADEMO',
          powerKw: 50,
          status: 'AVAILABLE',
          pricePerKwh: 17.5,
          lastUpdated: new Date().toISOString(),
        },
      ],
    },
  ];

  constructor(private readonly ocppService: OcppService) {}

  async findAll(dto: FindStationsDto): Promise<StationEntity[]> {
    const userLat = dto.lat ?? 28.6315;
    const userLng = dto.lng ?? 77.2167;

    return this.stations
      .map((station) => {
        // Sync live OCPP state if charge point is registered
        const cpSession = this.ocppService.getChargePointSession(station.chargePointId);

        const updatedConnectors = station.connectors.map((conn) => {
          let status = conn.status;
          if (cpSession && cpSession.status[conn.connectorNumber]) {
            const rawStatus = cpSession.status[conn.connectorNumber];
            if (rawStatus === 'Available') status = 'AVAILABLE';
            else if (rawStatus === 'Charging' || rawStatus === 'Preparing') status = 'IN_USE';
            else if (rawStatus === 'Faulted' || rawStatus === 'Unavailable') status = 'UNAVAILABLE';
          }
          return {
            ...conn,
            status,
          };
        });

        const distKm = this.calculateDistanceKm(
          userLat,
          userLng,
          station.latitude,
          station.longitude,
        );

        return {
          ...station,
          connectors: updatedConnectors,
          distanceKm: parseFloat(distKm.toFixed(1)),
          distance: `${distKm.toFixed(1)} km`,
        };
      })
      .filter((station) => {
        if (dto.radiusKm && station.distanceKm > dto.radiusKm) return false;
        if (dto.connectorType) {
          const hasConn = station.connectors.some(
            (c) => c.type.toUpperCase() === dto.connectorType?.toUpperCase(),
          );
          if (!hasConn) return false;
        }
        if (dto.minPowerKw) {
          const hasPower = station.connectors.some((c) => c.powerKw >= dto.minPowerKw!);
          if (!hasPower) return false;
        }
        if (dto.search) {
          const s = dto.search.toLowerCase();
          const match =
            station.name.toLowerCase().includes(s) ||
            station.operator.toLowerCase().includes(s) ||
            station.city.toLowerCase().includes(s);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  async findById(id: string): Promise<StationEntity> {
    const station = this.stations.find((s) => s.id === id || s.chargePointId === id);
    if (!station) {
      throw new NotFoundException(`Station ${id} not found`);
    }

    const cpSession = this.ocppService.getChargePointSession(station.chargePointId);
    const updatedConnectors = station.connectors.map((conn) => {
      let status = conn.status;
      if (cpSession && cpSession.status[conn.connectorNumber]) {
        const rawStatus = cpSession.status[conn.connectorNumber];
        if (rawStatus === 'Available') status = 'AVAILABLE';
        else if (rawStatus === 'Charging' || rawStatus === 'Preparing') status = 'IN_USE';
        else if (rawStatus === 'Faulted' || rawStatus === 'Unavailable') status = 'UNAVAILABLE';
      }
      return {
        ...conn,
        status,
      };
    });

    return {
      ...station,
      connectors: updatedConnectors,
    };
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
