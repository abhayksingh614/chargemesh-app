import { Controller, Get, Param, Query } from '@nestjs/common';
import { StationsService } from './stations.service';
import { FindStationsDto } from './dto/find-stations.dto';

@Controller('api/v1/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  async findAll(@Query() query: FindStationsDto) {
    return this.stationsService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.stationsService.findById(id);
  }
}
