<template>
  <view class="card-wrapper">
    <view class="card-container">
      <view class="card-head">
        <view>
          <view class="card-index-info">示例</view>
        </view>
      </view>
      <view class="card-content-wrapper">
        <scroll-view v-if="data" class="card-content-scroll" scroll-y>
          <u-gap height="32" bg-color="#ffffff" />
          <view class="card-content">
            <view v-for="col in columns" :key="col.prop">
              <view v-if="col.type === 'input'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconText" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'inputPhone'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconPhone" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'inputEmail'" class="card-column-item">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="email" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'inputIdCard'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconIdCard" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'inputNumber'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconNumber" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">
                  {{ getNumberValue(col, data[col.prop]) }}
                </view>
              </view>
              <view v-else-if="col.type === 'radio'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconRadio" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'select'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconCheckbox" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
              <view v-else-if="col.type === 'datePicker'" class="card-column-item">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="calendar" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">
                  {{ data[col.prop] ? dayjs(data[col.prop]).format(col.format) : '' }}
                </view>
              </view>
              <view v-else-if="col.type === 'uploadImg'" class="card-column-item">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="photo" />
                  {{ col.label }}
                </view>
                <view class="card-col-value files-wrapper">
                  <view v-if="data[col.prop] && data[col.prop].length > 0" class="image-list">
                    <view v-for="item in data[col.prop]" :key="item.fileId" class="image-item">
                      <image class="image-item-img" :src="item.url" :lazy-load="true" />
                    </view>
                  </view>
                </view>
              </view>
              <view v-else-if="col.type === 'uploadFile'" class="card-column-item">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="file-text" />
                  {{ col.label }}
                </view>
                <view class="card-col-value files-wrapper">
                  <view class="file-list">
                    <view v-for="item in data[col.prop]" :key="item.fileId" class="file-item">
                      <image class="file-item-icon" :src="getFileIcon(item)" />
                      <view class="file-item-name">{{ item.name }}</view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else-if="col.type === 'slider'" class="card-column-item">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconProgress" />
                  {{ col.label }}
                </view>
                <view class="card-col-value progress-field">
                  <u-line-progress
                    class="fill-table-progress"
                    :active-color="col.color"
                    :percent="getPercentValue(data[col.prop])"
                  >
                    <view class="fill-table-progress-text">
                      {{ getPercent(col, data[col.prop]) }} %
                    </view>
                  </u-line-progress>
                </view>
              </view>
              <view v-else-if="col.type === 'userSelect'" class="card-column-item">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="account" />
                  {{ col.label }}
                </view>
                <view class="card-col-value">{{ data[col.prop] }}</view>
              </view>
            </view>
          </view>
          <u-gap :height="220" bg-color="#ffffff" />
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import iconZip from '@/static/fileTypes/Icon-zip.svg';
import iconExcel from '@/static/fileTypes/icon-excel.svg';
import iconFile from '@/static/fileTypes/icon-file.svg';
import iconImage from '@/static/fileTypes/icon-image.svg';
import iconPdf from '@/static/fileTypes/icon-pdf.svg';
import iconPpt from '@/static/fileTypes/icon-ppt.svg';
import iconWord from '@/static/fileTypes/icon-word.svg';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import iconCheckbox from '../../static/columns/checkbox.svg';
import iconIdCard from '../../static/columns/id-card.svg';
import iconNumber from '../../static/columns/number.svg';
import iconPhone from '../../static/columns/phone.svg';
import iconProgress from '../../static/columns/progress-bar.svg';
import iconRadio from '../../static/columns/radio.svg';
import iconText from '../../static/columns/text.svg';

dayjs.locale('zh-cn');

defineProps<{
  columns: any[];
  data: any;
}>();
// 小数位四舍五入
function sp_round(num: string, precision: number) {
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
}
function fixNumber(num: string) {
  let v = num.split('.');
  v[0] = BigInt(v[0]).toString();
  if (v[1]) {
    v[1] = v[1].replace(/0+$/g, '');
  }
  return v.join('.');
}
function getNumberValue(col: any, value: string) {
  if (!value || !value.trim()) {
    return '';
  }
  let v = value.trim();
  if (!Number.isNaN(Number(v))) {
    v = fixNumber(v);
    if (col.precision >= 0) {
      v = sp_round(v, col.precision);
    }
    if (col.thousands) {
      const valueArr = v.split('.');
      valueArr[0] = valueArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return valueArr.join('.');
    }
    return v;
  } else {
    return '';
  }
}
function getPercentValue(value: string) {
  return +value || 0;
}
function getPercent(col: any, value: string) {
  // 仅仅后面补0，不做四舍五入
  return (+(value || '0')).toFixed(col.precision);
}

function getFileIcon(file: any) {
  const extName = file.name ? file.name.split('.').pop() : '';
  if (['pdf'].includes(extName)) {
    return iconPdf;
  } else if (['png', 'jpg', 'jpeg'].includes(extName)) {
    return iconImage;
  } else if (['xls', 'xlt', 'xlsx', 'xlsb', 'xltx'].includes(extName)) {
    return iconExcel;
  } else if (['ppt', 'pot', 'potx', 'pptx', 'ppsx', 'xml'].includes(extName)) {
    return iconPpt;
  } else if (['doc', 'docx'].includes(extName)) {
    return iconWord;
  } else if (['zip', 'rar', '7z'].includes(extName)) {
    return iconZip;
  }

  return iconFile;
}
</script>

<style lang="scss" scoped>
.card-wrapper {
  flex: 1;
  border-radius: 24rpx;
  background-color: #ffffff;
  .card-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .card-head {
    padding: 0 32rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .card-content-wrapper {
    flex: 1;
    overflow: hidden;
  }
  .card-content-scroll {
    height: 100%;
  }
  .card-content {
    padding: 0 32rpx;
  }
  .card-index-info {
    display: flex;
    color: rgba(0, 0, 0, 0.88);
    font-size: 34rpx;
    align-items: center;
  }
  .card-column-item {
    width: 100%;
    overflow: hidden;
  }
  .card-col-label {
    color: rgba(0, 0, 0, 0.88);
    font-size: 30rpx;
    padding: 32rpx 0 16rpx;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .fill-table-col-icon {
    width: 40rpx;
    height: 40rpx;
    font-size: 40rpx;
    margin-right: 16rpx;
    color: #707070;
  }
  .card-col-value {
    color: rgba(0, 0, 0, 0.25);
    line-height: 44rpx;
    min-height: 96rpx;
    padding: 24rpx 30rpx;
    word-break: break-all;
    border-radius: 8rpx;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: rgba(0, 0, 0, 0.06);
  }
  .progress-field {
    background-color: #ffffff;
    align-items: center;
    height: 96rpx;
    padding: 0 30rpx 0;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .files-wrapper {
    background-color: #ffffff;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 0 0 24rpx 30rpx;
    min-height: 88rpx;
  }
  .image-list {
    display: flex;
    flex-wrap: wrap;
  }
  .image-item {
    width: 112rpx;
    height: 112rpx;
    overflow: hidden;
    border-radius: 16rpx;
    position: relative;
    margin-top: 24rpx;
    margin-right: 20rpx;
    z-index: 1;
  }
  .image-item-img {
    width: 112rpx;
    height: 112rpx;
    display: block;
  }
  .file-list {
    overflow: hidden;
    padding-right: 30rpx;
  }
  .file-item {
    margin-top: 24rpx;
    display: flex;
    align-items: center;
    border-radius: 16rpx;
    background: rgba(0, 0, 0, 0.04);
    padding: 24rpx 32rpx;
  }
  .file-item-icon {
    height: 48rpx;
    width: 48rpx;
    display: block;
    margin-right: 16rpx;
  }
  .file-item-name {
    flex: 1;
    color: rgba(0, 0, 0, 0.88);
    font-size: 26rpx;
    word-break: break-all;
  }
  .fill-table-progress {
    position: relative;
    display: block;
    flex: 1;
  }
  .fill-table-progress-text {
    position: absolute;
    left: 16rpx;
    color: #000000;
    white-space: nowrap;
  }
}
</style>
