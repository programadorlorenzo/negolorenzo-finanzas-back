import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'integer', nullable: false })
	roleId: number;

	@Column({ type: 'integer', nullable: false })
	permissionId: number;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	// Relaciones
	@ManyToOne(() => Role)
	@JoinColumn({ name: 'roleId' })
	role: Role;

	@ManyToOne(() => Permission)
	@JoinColumn({ name: 'permissionId' })
	permission: Permission;
}
