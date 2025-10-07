import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { Pago, PagoDocument, File } from '../entities';

@Module({
	imports: [TypeOrmModule.forFeature([Pago, PagoDocument, File])],
	controllers: [PagosController],
	providers: [PagosService],
	exports: [PagosService],
})
export class PagosModule {}
