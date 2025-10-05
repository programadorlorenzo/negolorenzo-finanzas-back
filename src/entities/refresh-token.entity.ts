import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 500, unique: true, nullable: false })
	token: string;

	@Column({ type: 'integer', nullable: false })
	userId: number;

	@Column({ type: 'varchar', length: 255, nullable: true })
	deviceInfo: string;

	@Column({ type: 'varchar', length: 45, nullable: true })
	ipAddress: string;

	@Column({ type: 'timestamp with time zone', nullable: false })
	expiresAt: Date;

	@Column({ type: 'boolean', default: false })
	isRevoked: boolean;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	// Relaciones
	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;
}
