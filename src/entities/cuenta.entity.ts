import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum TipoCuenta {
	AHORROS = 'AHORROS',
	CORRIENTE = 'CORRIENTE',
	PLAZO_FIJO = 'PLAZO_FIJO',
	EMPRESA = 'EMPRESA',
}

export enum Moneda {
	PEN = 'PEN', // Soles
	USD = 'USD', // Dólares
	EUR = 'EUR', // Euros
}

@Entity('cuentas')
export class Cuenta {
	@ApiProperty({ description: 'ID único de la cuenta' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Titular de la cuenta', required: false })
	@Column({ type: 'varchar', length: 255, nullable: true })
	titular: string;

	@ApiProperty({ description: 'Número de cuenta', required: false })
	@Column({ type: 'varchar', length: 50, nullable: true })
	numeroCuenta: string;

	@ApiProperty({ description: 'Código de Cuenta Interbancaria', required: false })
	@Column({ type: 'varchar', length: 50, nullable: true })
	cci: string;

	@ApiProperty({ description: 'Moneda de la cuenta', enum: Moneda, required: false })
	@Column({
		type: 'enum',
		enum: Moneda,
		default: Moneda.PEN,
		nullable: true,
	})
	moneda: Moneda;

	@ApiProperty({ description: 'Tipo de cuenta', enum: TipoCuenta, required: false })
	@Column({
		type: 'enum',
		enum: TipoCuenta,
		default: TipoCuenta.AHORROS,
		nullable: true,
	})
	tipo: TipoCuenta;

	@ApiProperty({ description: 'Banco de la cuenta', required: false })
	@Column({ type: 'varchar', length: 255, nullable: true })
	banco: string;

	@ApiProperty({ description: 'Indica si es cuenta de empresa', required: false })
	@Column({ type: 'boolean', default: false, nullable: true })
	esEmpresa: boolean;

	@ApiProperty({ description: 'Estado activo de la cuenta', required: false })
	@Column({ type: 'boolean', default: true, nullable: true })
	isActive: boolean;

	@ApiProperty({ description: 'ID del usuario que creó la cuenta', required: false })
	@Column({ type: 'integer', nullable: true })
	createdBy: number;

	@ApiProperty({ description: 'Fecha de creación', required: false })
	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@ApiProperty({ description: 'Fecha de actualización', required: false })
	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;

	// Relaciones
	@ManyToOne(() => User, { eager: false })
	@JoinColumn({ name: 'createdBy' })
	creator: User;
}
