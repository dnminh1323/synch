import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Kiểu dữ liệu cho thông tin xác thực Google
 */
interface Credentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Đường dẫn đến tệp `credentials.json`
 */
const duongDan: string = join(process.cwd(), 'src', 'config', 'credentials.json');

/**
 * Nội dung của tệp `credentials.json`
 */
const noiDung: string = readFileSync(duongDan, 'utf-8');

/**
 * Thông tin xác thực được đọc từ tệp `credentials.json`
 */
const credentials: Credentials = JSON.parse(noiDung);

/**
 * Xuất thông tin xác thực
 */
export default credentials; 