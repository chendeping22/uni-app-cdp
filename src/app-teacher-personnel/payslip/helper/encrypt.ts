import WxmpRsa from 'wxmp-rsa';
import { RSA_PUBLIC } from './constant';

// RSA加密
export const RSAEncrypt = (str: string) => {
  const encrypt = new WxmpRsa();
  encrypt.setPublicKey(RSA_PUBLIC);
  return encrypt.encrypt(str);
};
