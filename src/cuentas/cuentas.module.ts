import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentasService } from './cuentas.service';
import { CuentasController } from './cuentas.controller';
import { Cuenta } from '../entities/cuenta.entity';
import { CaslAbilityFactory } from '../permissions/casl-ability.factory';

@Module({
	imports: [TypeOrmModule.forFeature([Cuenta])],
	controllers: [CuentasController],
	providers: [CuentasService, CaslAbilityFactory],
	exports: [CuentasService],
})
export class CuentasModule {}
