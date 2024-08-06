import { map } from 'lodash-es';

/**
 * 资产状态样式处理，需同步引入样式文件'@/app-general-affairs-logistics/assets-manage/assets/style.scss'
 * @param type
 * @returns
 */
export const handleStatusStyle = (type?: number | string) => {
  let res = '';
  switch (+(type ?? 0)) {
    case 1: //审批中
      res = 'color-primary-bg text-white';
      break;
    case 2: //已同意
      res = 'color-success-bg text-white';
      break;
    case 3: //已驳回
      res = 'color-error-bg text-white';
      break;
    case 4: //已撤回
      res = 'color-fill-bg text-default';
      break;
    default:
      res = 'color-fill-bg text-default';
      break;
  }
  return res;
};

/** 跳转到资产详情 */
export const handleToAssetDetail = (assetId: string) => {
  if (!assetId) return;
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/detail/index?id=${assetId}`,
  });
};

/** 图片预览 */
export const handleClickImgs = (val?: any[], urlName?: string, index?: number) => {
  const urls = map(val || [], v => v?.[urlName || 'url']);
  if (val?.length) {
    uni.previewImage({
      urls,
      current: index ?? 0,
    });
  }
};
export const fixNumber = (num: string | number) => {
  const v = num.toString().split('.');
  v[0] = BigInt(v[0]).toString();
  if (v[1]) {
    v[1] = v[1].replace(/0+$/g, '');
  }
  return v.join('.');
};

// 小数位四舍五入
export const sp_round = (num: string, precision: number) => {
  // 检验数字字符串
  let v = num;
  if (num.includes('.')) {
    v += '00001';
  } else {
    v += '.00001';
  }

  let [integerPart, decimalPart] = v.split('.');
  decimalPart = [decimalPart.substr(0, precision), decimalPart.substr(precision, 1)].join('.');
  decimalPart = Math.round(+decimalPart).toString();
  if (decimalPart === '0') {
    if (precision > 0) {
      decimalPart = '00000'.substr(0, precision);
      return [integerPart, decimalPart].join('.');
    } else {
      return integerPart;
    }
  } else {
    if (decimalPart.length > precision) {
      // 整数部分需要进1
      decimalPart = decimalPart.substr(1, precision);
      if (integerPart[0] === '-') {
        integerPart = (BigInt(integerPart) - BigInt(1)).toString();
      } else {
        integerPart = (BigInt(integerPart) + BigInt(1)).toString();
      }
      if (!decimalPart) {
        return integerPart;
      }
      return [integerPart, decimalPart].join('.');
    } else {
      if (precision > 0) {
        decimalPart = ('00000' + decimalPart).substr(-precision);
        return [integerPart, decimalPart].join('.');
      } else {
        return integerPart;
      }
    }
  }
};
