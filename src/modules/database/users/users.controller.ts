import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GoogleTokenDto } from './dto/google-token.dto';
import { BitrixTokenDto } from './dto/bitrix-token.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags("Users")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':domain')
  @ApiOperation({ summary: 'Lấy thông tin một người dùng theo domain' })
  findOne(@Param('domain') domain: string): Promise<User> {
    return this.usersService.findOne(domain);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới người dùng' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':domain')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  update(
    @Param('domain') domain: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(domain, updateUserDto);
  }

  @Patch(':domain/tokens')
  @ApiOperation({ summary: 'Cập nhật tokens của người dùng' })
  updateTokens(
    @Param('domain') domain: string,
    @Body('google_token') googleTokenDto?: GoogleTokenDto,
    @Body('bitrix_token') bitrixTokenDto?: BitrixTokenDto,
  ): Promise<User> {
    return this.usersService.updateTokens(domain, googleTokenDto, bitrixTokenDto);
  }

  @Delete(':domain')
  @ApiOperation({ summary: 'Xóa người dùng' })
  remove(@Param('domain') domain: string): Promise<void> {
    return this.usersService.remove(domain);
  }
}