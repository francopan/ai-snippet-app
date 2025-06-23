import { IsString } from 'class-validator';

export class GetByIdDto {
  @IsString()
  id!: string;
}
