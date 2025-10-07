import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('files')
export class File {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'original_name' })
	originalName: string;

	@Column()
	filename: string;

	@Column()
	path: string;

	@Column()
	mimetype: string;

	@Column()
	size: number;

	@Column({ nullable: true })
	category?: string;

	@Column({ name: 'uploaded_by', nullable: true })
	uploadedBy?: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
