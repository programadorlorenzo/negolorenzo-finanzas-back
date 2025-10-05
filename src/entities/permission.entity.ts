import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	name: string;

	@Column({ type: 'varchar', length: 50, nullable: false })
	resource: string;

	@Column({ type: 'varchar', length: 20, nullable: false })
	action: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;
}
