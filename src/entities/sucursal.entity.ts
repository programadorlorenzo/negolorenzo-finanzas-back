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
import { Organization } from './organization.entity';

@Entity('sucursales')
export class Sucursal {
	@ApiProperty({ description: 'ID único de la sucursal' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Nombre de la sucursal', required: false })
	@Column({ type: 'varchar', length: 100, nullable: true })
	name: string;

	@ApiProperty({ description: 'Código único de la sucursal', required: false })
	@Column({ type: 'varchar', length: 20, nullable: true })
	code: string;

	@ApiProperty({ description: 'Dirección de la sucursal', required: false })
	@Column({ type: 'text', nullable: true })
	address: string;

	@ApiProperty({ description: 'Teléfono de la sucursal', required: false })
	@Column({ type: 'varchar', length: 20, nullable: true })
	phone: string;

	@ApiProperty({ description: 'ID de la organización', required: false })
	@Column({ type: 'integer', nullable: true })
	organizationId: number;

	@ApiProperty({ description: 'Estado activo de la sucursal', required: false })
	@Column({ type: 'boolean', default: true, nullable: true })
	isActive: boolean;

	@ApiProperty({ description: 'Fecha de creación', required: false })
	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@ApiProperty({ description: 'Fecha de actualización', required: false })
	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;

	// Relaciones
	@ManyToOne(() => Organization, organization => organization.sucursales)
	@JoinColumn({ name: 'organizationId' })
	organization: Organization;
}
