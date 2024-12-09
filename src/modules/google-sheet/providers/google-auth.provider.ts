import { Inject, Injectable } from "@nestjs/common";
import { OAuth2Client, Credentials, TokenInfo } from 'google-auth-library';
import { UsersService } from "../../database/users/users.service";
import { GoogleTokenDto } from "../../database/users/dto/google-token.dto";

/**
 * Data Transfer Object cho cấu hình OAuth2.
 */
export interface GoogleOAuth2ConfigDto {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

/**
 * Nhà cung cấp xác thực Google qua OAuth2.
 */
@Injectable()
export class GoogleAuthProvider {
    private oauth2Client: OAuth2Client;

    constructor(
        @Inject('GOOGLE_OAUTH2_CONFIG')
        private readonly googleOAuth2Config: GoogleOAuth2ConfigDto,
        private readonly usersService: UsersService
    ) {
        this.oauth2Client = new OAuth2Client(
            googleOAuth2Config.clientId,
            googleOAuth2Config.clientSecret,
            googleOAuth2Config.redirectUri
        );
    }

    public getAuthUrl(domain: string): string {
        const scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ];
        
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: domain
        });
    }

    public async handleCallback(code: string, state: string): Promise<void> {
        // console.log("handleCallback", code, state);
        const { tokens } = await this.oauth2Client.getToken(code);
        // console.log("handleCallback", tokens);
        this.oauth2Client.setCredentials(tokens);

        await this.usersService.updateTokens(state, {
            access_token: tokens.access_token,
            refresh_token: code,  
// theo như in ra thì thấy code có dạng: 4/0AeanS0aKqOsR2M2vkharZbRh9sdpWOrC73RY4EuVLb5jwqjJkB5FQF_UVxJLCnucP8iWDg
// na ná với refresh_token kiểu kiểu 1//0e... 
// Nên mạnh dạn đoán code là refresh_token
            scope: tokens.scope,
            token_type: tokens.token_type,
            expiry_date: new Date(tokens.expiry_date)
        });
    }

    public async getClient(): Promise<OAuth2Client> {
        return this.oauth2Client;
    }

    public async verifyToken(token: GoogleTokenDto): Promise<boolean> {
        try {
            this.oauth2Client.setCredentials({
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                expiry_date: new Date(token.expiry_date).getTime()
            });

            const tokenInfo = await this.oauth2Client.getTokenInfo(token.access_token);
            return true;
        } catch (error) {
            return false;
        }
    }

    public async refreshToken(domain: string, token: GoogleTokenDto): Promise<boolean> {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: token.refresh_token
            });

            const { credentials } = await this.oauth2Client.refreshAccessToken();
            
            await this.usersService.updateTokens(domain, {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || token.refresh_token,
                scope: credentials.scope,
                token_type: credentials.token_type,
                expiry_date: new Date(credentials.expiry_date)
            });

            return true;
        } catch (error) {
            return false;
        }
    }
}
