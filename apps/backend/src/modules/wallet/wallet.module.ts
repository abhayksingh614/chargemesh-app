import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, FinanceLedgerEntity } from '../../database/entities';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FinanceLedgerEntity])],
  controllers: [WalletController],
  providers: [WalletService, RazorpayService],
  exports: [WalletService, RazorpayService],
})
export class WalletModule {}
