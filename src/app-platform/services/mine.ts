import { request } from '@/utils/request';

/** 图片base */
export const fileStreamBase64 = (fileId: string) =>
  request<string>(`/v1/frontend/file-stream/base64/${fileId}`, {}, 'GET');

interface IImgDetect {
  imgId: string;
  imgUrl: string;
  locationId?: string;
}

export interface IGetVoucherRtn {
  modifyMy?: string;
  id: string;
  cardCode: string;
  locationId: string;
  faces: {
    imgId: string;
    imgUrl: string;
    fileId: string;
  }[];
}

type CertificateDetailParams = {
  personType: number; // 人员类型:0、教职工; 1、学生; 2、家长
  personId?: string | number; // 人员id
  locationId: string;
};

export type CertificateInfo = {
  modifyMy?: string; // 是否修改自己的隐私信息，如果是新app端调用，要把这个值设置为1。默认为0。
  cardCode?: string; // 卡号
  id?: string;
  locationId: string;
  faces?: any[]; // 人脸信息
  fingerprints?: any[]; // 指纹详情
  [name: string]: any;
} & CertificateDetailParams;

/** 更新人员头像 */
export const updateUserHead = (headImageId: string) =>
  request(`/personalCenter/actions/updateHeadImage`, { headImageId: headImageId }, 'PUT', {
    spaceType: request.service.building,
    defaultError: true,
  });

/**
 * 图片质量检测
 *  locationId 如果是C端，则必传, 因后端取不到
 */
export const imgDetect = (data: IImgDetect) =>
  request('/v1/face/ai/actions/detect?type=0', data, 'POST', {
    overdueShowLoadingTime: 10,
    spaceType: request.service.sas,
    showLoading: false,
  });

/**
 * 图片质量检测--新--我的档案专用
 *  locationId 如果是C端，则必传, 因后端取不到
 */
export const imgDetectV2 = (data: IImgDetect, locationId: string) =>
  request(`/files/v3/face/ai/actions/detect?type=0&locationId=${locationId}`, data, 'POST', {
    overdueShowLoadingTime: 10,
  });

/** 保存凭证信息 */
export const saveVoucher = (data: CertificateInfo) =>
  request(`/v1/vouchers/actions/save`, data, 'POST', {
    spaceType: request.service.sas,
    defaultError: false,
  });

export const getVoucher = ({ locationId, personType, personId }: CertificateDetailParams) =>
  request<IGetVoucherRtn>(`/v1/vouchers/${locationId}/${personType}/${personId}`, {}, 'GET', {
    spaceType: request.service.sas,
  });

/** 扫描二维码 */
export const scanQRCode = (scanCode: string) =>
  request(`/mobile/login/scanQRCode`, { scanCode }, 'GET', {
    spaceType: request.service.building,
    defaultError: false,
  });

/** 二维码登录 */
export const authQRCode = (authCode: string) =>
  request(`/mobile/login/authQRCode`, { authCode }, 'GET', {
    spaceType: request.service.building,
  });
