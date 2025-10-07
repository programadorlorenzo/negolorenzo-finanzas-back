import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('files')
export class File {
	@ApiProperty({ description: 'ID único del archivo' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Nombre original del archivo' })
	@Column({ type: 'varchar', length: 255, nullable: false })
	originalName: string;

	@ApiProperty({ description: 'Nombre del archivo en el sistema' })
	@Column({ type: 'varchar', length: 255, nullable: false })
	filename: string;

	@ApiProperty({ description: 'Ruta del archivo' })
	@Column({ type: 'varchar', length: 500, nullable: false })
	path: string;

	@ApiProperty({ description: 'Tipo MIME del archivo' })
	@Column({ type: 'varchar', length: 100, nullable: false })
	mimetype: string;

	@ApiProperty({ description: 'Tamaño del archivo en bytes' })
	@Column({ type: 'integer', nullable: false })
	size: number;

	@ApiProperty({ description: 'Categoría del archivo', example: 'voucher, documento, imagen' })
	@Column({ type: 'varchar', length: 50, nullable: true })
	category?: string;

	@ApiProperty({ description: 'ID del usuario que subió el archivo' })
	@Column({ type: 'integer', nullable: true })
	uploadedBy?: number;

	@ApiProperty({ description: 'Fecha de creación' })
	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@ApiProperty({ description: 'Fecha de actualización' })
	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;
}
