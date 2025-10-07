import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { Sucursal } from './sucursal.entity';
import { File } from './file.entity';
import { Cuenta } from './cuenta.entity';

export enum StatusPago {
	PENDIENTE = 'pendiente',
	APROBADO = 'aprobado',
	RECHAZADO = 'rechazado',
	PAGADO = 'pagado',
}

export enum Moneda {
	PEN = 'PEN',
	USD = 'USD',
	EUR = 'EUR',
}

@Entity('pagos')
export class Pago {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'text' })
	descripcion: string;

	@Column({ type: 'text', nullable: true })
	justificacion?: string;

	@Column({ name: 'coordinado_con', nullable: true })
	coordinadoCon?: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	total: number;

	@Column({ type: 'enum', enum: Moneda, default: Moneda.PEN })
	moneda: Moneda;

	@Column({ type: 'enum', enum: StatusPago, default: StatusPago.PENDIENTE })
	status: StatusPago;

	// Relación con Sucursal (opcional)
	@Column({ name: 'sucursal_id', nullable: true })
	sucursalId?: number;

	@ManyToOne(() => Sucursal, { nullable: true })
	@JoinColumn({ name: 'sucursal_id' })
	sucursal?: Sucursal;

	// Relación con Cuenta Destino (opcional)
	@Column({ name: 'cuenta_destino_id', nullable: true })
	cuentaDestinoId?: number;

	@ManyToOne(() => Cuenta, { nullable: true })
	@JoinColumn({ name: 'cuenta_destino_id' })
	cuentaDestino?: Cuenta;

	// Relación con Cuenta Propia de Empresa (opcional)
	@Column({ name: 'cuenta_propia_empresa_id', nullable: true })
	cuentaPropiaEmpresaId?: number;

	@ManyToOne(() => Cuenta, { nullable: true })
	@JoinColumn({ name: 'cuenta_propia_empresa_id' })
	cuentaPropiaEmpresa?: Cuenta;

	// Archivo de voucher (imagen)
	@Column({ name: 'voucher_file_id', nullable: true })
	voucherFileId?: number;

	@ManyToOne(() => File, { nullable: true, eager: true })
	@JoinColumn({ name: 'voucher_file_id' })
	voucherFile?: File;

	// Archivos de documentos extras
	@OneToMany(() => PagoDocument, pagoDoc => pagoDoc.pago, { eager: true })
	documentFiles: PagoDocument[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}

// Entidad intermedia para los documentos del pago
@Entity('pago_documents')
export class PagoDocument {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'pago_id' })
	pagoId: number;

	@ManyToOne(() => Pago, pago => pago.documentFiles, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'pago_id' })
	pago: Pago;

	@Column({ name: 'file_id' })
	fileId: number;

	@ManyToOne(() => File, { eager: true })
	@JoinColumn({ name: 'file_id' })
	file: File;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
