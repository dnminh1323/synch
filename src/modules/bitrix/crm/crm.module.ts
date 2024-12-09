import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { CompanyModule } from './company/company.module';
import { TestController } from './contact/test.controller';

@Module({
  imports: [ContactModule, CompanyModule],
  controllers: [TestController],
})
export class CrmModule {}