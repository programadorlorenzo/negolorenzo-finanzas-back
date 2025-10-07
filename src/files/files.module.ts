import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from '../entities';

@Module({
	imports: [
		TypeOrmModule.forFeature([File]),
		MulterModule.register({
			dest: './uploads',
		}),
	],
	controllers: [FilesController],
	providers: [FilesService],
	exports: [FilesService],
})
export class FilesModule {}
