import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

/**
 * Cấu hình OAuth cho BitrixService.
 */
export interface OAuthConfig {
  domain: string;
  clientId?: string;
  clientSecret?: string;
  refresh_token: string;
  access_token?: string;
}

/**
 * Cấu hình Webhook cho BitrixService.
 */
export interface WebhookConfig {
  webhookUrl: string;
}

/**
 * Cấu hình tổng thể cho BitrixService.
 */
export interface BitrixConfig {
  oauth?: OAuthConfig;
  webhook?: WebhookConfig;
}

/**
 * Dịch vụ Bitrix để gọi API Bitrix24.
 */
@Injectable()
export class BitrixService {
  private readonly oauthConfig?: OAuthConfig;
  private readonly webhookUrl?: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly config: BitrixConfig, private readonly fixedConfig: FixedBitrixConfig) {
    const { clientId, clientSecret } = fixedConfig;

    if (config.oauth) {
      const { domain, refresh_token } = config.oauth;

      if (!domain || !refresh_token) {
        throw new Error('Invalid OAuth data');
      }

      this.oauthConfig = {
        ...config.oauth,
        clientId,
        clientSecret,
      };

      this.axiosInstance = axios.create({
        baseURL: `https://${domain}/rest/`,
      });
    }

    if (config.webhook) {
      this.webhookUrl = config.webhook.webhookUrl;
      this.axiosInstance = axios.create({ baseURL: this.webhookUrl });
    }

    if (!config.oauth && !config.webhook) {
      throw new Error('Either OAuth or webhook configuration is required');
    }
  }

  /**
   * Làm mới token OAuth.
   * @returns Access token mới.
   * @throws Lỗi nếu không thể làm mới token.
   */
  async refreshToken(): Promise<any> {
    if (!this.oauthConfig) {
      throw new Error('OAuth configuration is missing');
    }

    const { clientId, clientSecret, refresh_token } = this.oauthConfig;

    try {
      const response = await axios.get('https://oauth.bitrix.info/oauth/token/', {
        params: {
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refresh_token,
        },
      });

      this.oauthConfig.access_token = response.data.access_token;
      this.oauthConfig.refresh_token = response.data.refresh_token || refresh_token;

      return this.oauthConfig;
    } catch (error: any) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      throw new Error(`Không thể làm mới token: ${errorMessage}`);
    }
  }

  /**
   * Gọi API Bitrix24.
   * @param method Tên phương thức API.
   * @param params Tham số gọi API.
   * @returns Kết quả từ Bitrix24.
   */
  public async call(method: string, params?: any): Promise<any> {
    if (this.webhookUrl) {
      const response = await this.axiosInstance.post(method, { ...params });
      return response.data;
    }

    if (!this.oauthConfig?.access_token) {
      await this.refreshToken();
    }

    try {
      const response = await this.axiosInstance.post(
        method,
        { ...params },
        { params: { auth: this.oauthConfig?.access_token } },
      );
      console.log(response);
      return response.data;
    } catch (error) {
      const oauthConfig = await this.refreshToken();
      const accessToken = oauthConfig.access_token;
      const response = await this.axiosInstance.post(
        method,
        { ...params },
        { params: { auth: accessToken } },
      );
      

      return response.data;
    }
  }
}

/**
 * Cấu hình cố định cho `BitrixService`.
 */
export interface FixedBitrixConfig {
  clientId: string;
  clientSecret: string;
}
