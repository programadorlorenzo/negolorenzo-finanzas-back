import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentasService } from './cuentas.service';
import { CuentasController } from './cuentas.controller';
import { Cuenta, Sucursal } from '../entities';

@Module({
	imports: [TypeOrmModule.forFeature([Cuenta, Sucursal])],
	controllers: [CuentasController],
	providers: [CuentasService],
	exports: [CuentasService],
})
export class CuentasModule {}
