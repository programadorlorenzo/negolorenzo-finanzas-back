import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

@Entity('users')
export class User {
	@ApiProperty({ description: 'ID único del usuario' })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Nombre del usuario', required: false })
	@Column({ type: 'varchar', length: 100, nullable: true })
	firstName: string;

	@ApiProperty({ description: 'Apellido del usuario', required: false })
	@Column({ type: 'varchar', length: 100, nullable: true })
	lastName: string;

	@ApiProperty({ description: 'Email del usuario', uniqueItems: true })
	@Column({ type: 'varchar', length: 255, unique: true, nullable: false })
	email: string;

	@Column({ type: 'varchar', length: 255, nullable: false })
	password: string;

	@ApiProperty({ description: 'Estado del usuario', enum: UserStatus, required: false })
	@Column({
		type: 'enum',
		enum: UserStatus,
		default: UserStatus.ACTIVE,
		nullable: true,
	})
	status: UserStatus;

	@ApiProperty({ description: 'Fecha de creación', required: false })
	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@ApiProperty({ description: 'Fecha de actualización', required: false })
	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;
}
