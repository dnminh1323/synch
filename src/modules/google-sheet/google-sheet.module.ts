import { Module } from '@nestjs/common';
import { GoogleSheetController } from './google-sheet.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { GoogleSheetService } from './providers/google-sheet.service';
import { GoogleAuthProvider, GoogleOAuth2ConfigDto } from './providers/google-auth.provider';
import { GoogleSheetConnectorProvider } from './providers/google-sheet-connector.provider';
import GoogleSheetConnectorDto from './dtos/google-sheet-connector.dto';
import credentials from '../../config/credentials';
import { GoogleSheetServiceFactory } from './providers/google-sheet.factory';
import { UsersModule } from '../database/users/users.module';

const googleOAuth2Config: GoogleOAuth2ConfigDto = { // clien id này khác với cái kia, lấy ở đâu quên mất rồi
  clientId: "856990616992-8dcp7r0l9lr2avbikpcqkrr56cfn3q32.apps.googleusercontent.com",
  clientSecret: "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",
  redirectUri: 'https://ad29-123-16-26-175.ngrok-free.app/auth/google/callback', // Credentials > ấn vào OAuth 2.0 Client IDs, sửa Authorized redirect URIs
};

@Module({
  imports: [UsersModule],
  controllers: [GoogleSheetController, GoogleAuthController],
  providers: [
    GoogleSheetServiceFactory,
    {
      provide: 'GOOGLE_OAUTH2_CONFIG',
      useValue: googleOAuth2Config,
    },
    GoogleAuthProvider,
    GoogleSheetConnectorProvider,
    {
      provide: 'GOOGLE_SHEET_CONNECTOR',
      useFactory: () => {
        const connectorDto = new GoogleSheetConnectorDto({
          type: credentials.type,
          project_id: credentials.project_id,
          private_key_id: credentials.private_key_id,
          private_key: credentials.private_key,
          client_email: credentials.client_email,
          client_id: credentials.client_id,
          auth_uri: credentials.auth_uri,
          token_uri: credentials.token_uri,
          auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
          client_x509_cert_url: credentials.client_x509_cert_url,
        });
        return connectorDto;
      },
    },
  ],
  exports: [GoogleSheetServiceFactory],
})
export class GoogleSheetModule {}
