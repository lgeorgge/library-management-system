import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BorrowersService } from '../application/services/borrower.service';
import { CreateBorrowerDto } from '../application/dto/createBorrower.dto';
import { UpdateBorrowerDto } from '../application/dto/updateBorrower.dto';
import { FindAllBorrowersDto } from '../application/dto/findAllBorrowers.dto';

@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Post()
  create(@Body() createBorrowerDto: CreateBorrowerDto) {
    return this.borrowersService.create(createBorrowerDto);
  }

  @Get()
  findAll(@Query() query: FindAllBorrowersDto) {
    const { page, pageSize, search } = query;

    const pagination = { page, pageSize };
    const filters = { search };
    return this.borrowersService.findAll(pagination, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateBorrowerDto: UpdateBorrowerDto,
  ) {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowersService.remove(id);
  }
}
