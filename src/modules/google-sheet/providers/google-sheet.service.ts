import { Injectable } from '@nestjs/common';
import { GoogleSheetConfig } from '../interfaces/google-sheet-config.interface';
import { GoogleAuthProvider } from './google-auth.provider';
import { google } from 'googleapis';

interface SheetConfig {
  title: string;
  headers: string[];
}

@Injectable()
export class GoogleSheetService {
  constructor(
    private readonly config: GoogleSheetConfig,
    private readonly googleAuthProvider: GoogleAuthProvider,
  ) {}

  private async getClient() {
    const oAuth2Client = await this.googleAuthProvider.getClient();
    oAuth2Client.setCredentials(this.config);
    return oAuth2Client;
  }

  // Chưa thêm điều kiện chỉ tạo khi lần đầu đăng ký, đăng nhập.
  // SHEET_CONFIGS lưu thông tin mặc định khi tạo spreadsheet mới sẽ auto có mấy cái sheet này.
  private readonly SHEET_CONFIGS: SheetConfig[] = [
    {
      title: 'CONTACT',
      headers: [
        'ID', 'LAST_NAME', 'SECOND_NAME', 'NAME', 'ADDRESS', 'ADDRESS_2', 
        'ADDRESS_CITY', 'ADDRESS_PROVINCE', 'ADDRESS_POSTAL_CODE', 'ADDRESS_REGION',
        'ADDRESS_COUNTRY', 'POST', 'COMMENTS', 'HONORIFIC', 'PHOTO', 'LEAD_ID', 'TYPE_ID', 
        'SOURCE_ID', 'SOURCE_DESCRIPTION', 'COMPANY_ID', 'BIRTHDATE', 'EXPORT', 'HAS_PHONE', 
        'HAS_EMAIL', 'HAS_IMOL', 'DATE_CREATE', 'DATE_MODIFY', 'ASSIGNED_BY_ID', 'CREATED_BY_ID', 
        'MODIFY_BY_ID','OPENED', 'ORIGINATOR_ID', 'ORIGIN_ID', 'ORIGIN_VERSION', 'FACE_ID', 
        'UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN','UTM_CONTENT',  'LAST_ACTIVITY_TIME', 
        'LAST_ACTIVITY_BY', 'PHONE', 'EMAIL', 'WEB', 'IM', 'UTM_TERM', 'ADDRESS_LOC_ADDR_ID'
      ]
    },
    {
      title: 'REQUISITE',
      headers: [
        'ID', 'ENTITY_TYPE_ID', 'ENTITY_ID', 'PRESET_ID', 'DATE_CREATE', 'DATE_MODIFY', 
        'CREATED_BY_ID', 'MODIFY_BY_ID', 'NAME', 'CODE', 'XML_ID', 'ORIGINATOR_ID', 
        'ACTIVE', 'ADDRESS_ONLY', 'SORT', 'RQ_NAME', 'RQ_FIRST_NAME', 'RQ_LAST_NAME', 
        'RQ_SECOND_NAME', 'RQ_COMPANY_ID', 'RQ_COMPANY_NAME', 'RQ_COMPANY_FULL_NAME', 
        'RQ_COMPANY_REG_DATE', 'RQ_DIRECTOR', 'RQ_ACCOUNTANT', 'RQ_CEO_NAME', 
        'RQ_CEO_WORK_POS', 'RQ_CONTACT', 'RQ_EMAIL', 'RQ_PHONE', 'RQ_FAX', 
        'RQ_IDENT_TYPE', 'RQ_IDENT_DOC', 'RQ_IDENT_DOC_SER', 'RQ_IDENT_DOC_NUM', 
        'RQ_IDENT_DOC_PERS_NUM', 'RQ_IDENT_DOC_DATE', 'RQ_IDENT_DOC_ISSUED_BY', 
        'RQ_IDENT_DOC_DEP_CODE', 'RQ_INN', 'RQ_KPP', 'RQ_USRLE', 'RQ_IFNS', 
        'RQ_OGRN', 'RQ_OGRNIP', 'RQ_OKPO', 'RQ_OKTMO', 'RQ_OKVED', 'RQ_EDRPOU', 
        'RQ_DRFO', 'RQ_KBE', 'RQ_IIN', 'RQ_BIN', 'RQ_ST_CERT_SER', 'RQ_ST_CERT_NUM', 
        'RQ_ST_CERT_DATE', 'RQ_VAT_PAYER', 'RQ_VAT_ID', 'RQ_VAT_CERT_SER', 
        'RQ_VAT_CERT_NUM', 'RQ_VAT_CERT_DATE', 'RQ_RESIDENCE_COUNTRY', 'RQ_BASE_DOC', 
        'RQ_REGON', 'RQ_KRS', 'RQ_PESEL', 'RQ_LEGAL_FORM', 'RQ_SIRET', 'RQ_SIREN', 
        'RQ_CAPITAL', 'RQ_RCS', 'RQ_CNPJ', 'RQ_STATE_REG', 'RQ_MNPL_REG', 'RQ_CPF'
      ]
    },
    {
        title: 'LOG',
        headers: ['Time', 'Action']
    }
  ];

  private readonly DEFAULT_GRID_PROPERTIES = {
    rowCount: 3000,
    columnCount: 100
  } as const;

  async createSpreadsheet(title: string): Promise<string> {
    const auth = await this.getClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 1. Tạo spreadsheet với các sheet
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title,
        },
        sheets: this.SHEET_CONFIGS.map(config => ({
          properties: {
            title: config.title,
            gridProperties: this.DEFAULT_GRID_PROPERTIES
          }
        }))
      },
    });

    const spreadsheetId = response.data.spreadsheetId;
    const sheetIds = response.data.sheets.map(sheet => sheet.properties.sheetId);

    // 2. Thêm tiêu đề cho từng sheet
    await Promise.all(
      this.SHEET_CONFIGS.map((config, index) => 
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${config.title}!A1:${this.getColumnLetter(config.headers.length)}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [config.headers]
          }
        })
      )
    );

    // 3. Format tiêu đề (in đậm và đóng băng hàng đầu)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: this.SHEET_CONFIGS.map((config, index) => ([
          {
            repeatCell: {
              range: {
                sheetId: sheetIds[index],
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: config.headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  },
                  textFormat: {
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIds[index],
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ])).flat()
      }
    });

    return spreadsheetId;
  }

  // Hàm hỗ trợ chuyển đổi số cột thành chữ cái (1 -> A, 2 -> B, etc.)
  private getColumnLetter(column: number): string {
    let temp: number;
    let letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = Math.floor((column - temp - 1) / 26);
    }
    return letter;
  }

}

