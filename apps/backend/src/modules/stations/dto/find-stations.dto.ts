import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindStationsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radiusKm?: number;

  @IsString()
  @IsOptional()
  connectorType?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPowerKw?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
