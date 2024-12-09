import { Controller, Get, Param, Body, Post, Delete, Put } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactAdd, ContactAddResponse, ContactDeleteResponse, ContactGetResponse, ContactUpdate, ContactUpdateResponse } from '../../../../shared/interfaces/contact.interface';
import { BitrixConfig } from '../../bitrix.service';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


/**
 * DTO để nhận cấu hình khách hàng từ yêu cầu.
 */
class CustomerConfigDto implements BitrixConfig {
  oauth?: {
    domain: string;
    refresh_token: string;
  };
  webhook?: {
    webhookUrl: string;
  };
}

/**
 * DTO để tạo liên hệ mới.
 */
export class CreateContactDto {
  @ValidateNested()
  @Type(() => CustomerConfigDto)
  config: CustomerConfigDto;

  fields: ContactAdd['fields'];

  @IsOptional()
  params?: ContactAdd['params'];
}

/**
 * Controller để test ContactService với cấu hình khách hàng.
 */
@Controller('test')
export class TestController {
  constructor(private readonly contactService: ContactService) {}


  // @Post('contact/:id')
  // public async getContact(
  //   @Param('id') id: string | number,
  //   @Body() config: CustomerConfigDto
  // ): Promise<ContactGetResponse> {
  //   return await this.contactService.get(id, config);
  // }

  @Post('contact/add')
  public async addContact(
    @Body() createContactDto: CreateContactDto
  ): Promise<ContactAddResponse> {

    const { fields, params, config } = createContactDto;

    return await this.contactService.add({ fields, params }, config);
  }



  @Put('contact/update/:id')  
  public async updateContact(
    @Param('id') id: string | number,
    @Body('FIELDS') fields: ContactAdd['fields'],
    @Body() config: CustomerConfigDto
  ): Promise<ContactUpdateResponse> {
    return await this.contactService.update( { id, fields }, config);
  }


  @Delete('contact/delete/:id')
  public async deleteContact(
    @Param('id') id: string | number,
    @Body() config: CustomerConfigDto
  ): Promise<ContactDeleteResponse> {
    return await this.contactService.delete(id, config);
  }   
}