import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './modules/bitrix/crm/contact/contact.module';
import { CompanyModule } from './modules/bitrix/crm/company/company.module';
import { AuthModule } from './modules/bitrix/auth/auth.module';
import { CrmModule } from './modules/bitrix/crm/crm.module';
import { BitrixModule } from './modules/bitrix/bitrix.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetModule } from './modules/google-sheet/google-sheet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './modules/database/database.module';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/database/users/users.module';




@Module({
  imports: [ContactModule, CompanyModule, AuthModule, 
    ConfigModule.forRoot({
      isGlobal: true, // Để ConfigModule có thể được sử dụng toàn cục
    }),
    TypeOrmModule.forRoot(databaseConfig),
    BitrixModule,
    CrmModule,
    GoogleSheetModule,
    DatabaseModule,
    UsersModule,    


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}