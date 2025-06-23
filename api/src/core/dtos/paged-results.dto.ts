import { ApiProperty } from '@nestjs/swagger';

export class PagedResultDto<T> {
  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of items' })
  totalItems!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({
    description: 'List of items for the current page',
    isArray: true,
  })
  items!: T[];
}
