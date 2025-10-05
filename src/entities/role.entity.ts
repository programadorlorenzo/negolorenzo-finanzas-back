import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 50, unique: true, nullable: false })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;
}
