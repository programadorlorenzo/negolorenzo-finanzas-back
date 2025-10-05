import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Sucursal } from './sucursal.entity';
import { Role } from './role.entity';

@Entity('user_sucursales')
export class UserSucursal {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'integer', nullable: false })
	userId: number;

	@Column({ type: 'integer', nullable: false })
	sucursalId: number;

	@Column({ type: 'integer', nullable: false })
	roleId: number;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@CreateDateColumn({ type: 'timestamp with time zone' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp with time zone' })
	updatedAt: Date;

	// Relaciones
	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Sucursal)
	@JoinColumn({ name: 'sucursalId' })
	sucursal: Sucursal;

	@ManyToOne(() => Role)
	@JoinColumn({ name: 'roleId' })
	role: Role;
}
