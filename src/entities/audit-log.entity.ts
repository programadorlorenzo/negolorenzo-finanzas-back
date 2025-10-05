import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
	LOGIN = 'login',
	LOGOUT = 'logout',
	REFRESH = 'refresh',
	PERMISSION_CHANGE = 'permission_change',
}

@Entity('audit_logs')
export class AuditLog {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'integer', nullable: true })
	userId: number;

	@Column({
		type: 'enum',
		enum: AuditAction,
		nullable: false,
	})
	action: AuditAction;

	@Column({ type: 'varchar', length: 100, nullable: false })
	resource: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	resourceId: string;

	@Column({ type: 'jsonb', nullable: true })
	details: Record<string, any>;

	@Column({ type: 'varchar', length: 45, nullable: true })
	ipAddress: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	userAgent: string;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	// Relaciones
	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;
}
