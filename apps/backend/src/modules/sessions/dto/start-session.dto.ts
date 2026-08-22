import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChargeTargetDto {
  @IsString()
  @IsNotEmpty()
  type: 'SOC' | 'ENERGY' | 'AMOUNT' | 'TIME';

  @IsNumber()
  @IsNotEmpty()
  value: number;
}

export class StartSessionDto {
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @IsString()
  @IsNotEmpty()
  connectorId: string;

  @ValidateNested()
  @Type(() => ChargeTargetDto)
  @IsOptional()
  target?: ChargeTargetDto;
}

export class StopSessionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
