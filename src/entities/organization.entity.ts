import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Sucursal } from './sucursal.entity';

@Entity('organizations')
export class Organization {
	@ApiProperty({ description: 'ID único de la organización' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Nombre de la organización', required: false })
	@Column({ type: 'varchar', length: 100, nullable: true })
	name: string;

	@ApiProperty({ description: 'Código único de la organización', required: false })
	@Column({ type: 'varchar', length: 20, unique: true, nullable: true })
	code: string;

	@ApiProperty({ description: 'Descripción de la organización', required: false })
	@Column({ type: 'text', nullable: true })
	description: string;

	@ApiProperty({ description: 'Estado activo de la organización', required: false })
	@Column({ type: 'boolean', default: true, nullable: true })
	isActive: boolean;

	@ApiProperty({ description: 'Fecha de creación', required: false })
	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@ApiProperty({ description: 'Fecha de actualización', required: false })
	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;

	// Relaciones
	@OneToMany(() => Sucursal, sucursal => sucursal.organization)
	sucursales: Sucursal[];
}
