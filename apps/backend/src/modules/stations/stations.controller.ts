import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StationsService } from './stations.service';
import { FindStationsDto } from './dto/find-stations.dto';

@Controller('api/v1/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get()
  async findAll(@Query() query: FindStationsDto) {
    return this.stationsService.findAll(query);
  }

  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.stationsService.findById(id);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Put(':id/tariff')
  async updateTariff(
    @Param('id') id: string,
    @Body() body: { tariffPerKwh: number },
  ) {
    return this.stationsService.updateTariff(id, Number(body.tariffPerKwh));
  }
}
