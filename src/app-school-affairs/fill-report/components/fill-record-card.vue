<template>
  <view class="card-wrapper">
    <view class="card-container">
      <view class="card-head">
        <view>
          <view v-if="props.total" class="card-index-info">
            <view class="card-index-current">{{ (props?.index || 0) + 1 }}</view>
            <view class="card-index-split">/</view>
            <view>{{ props.total }}</view>
          </view>
        </view>
        <view v-if="state.activeData" class="card-action-list">
          <u-icon
            v-if="!props.readonly && state.editing"
            class="card-close-icon"
            name="checkmark"
            @click="handleSave"
          />
          <u-icon
            v-if="!props.readonly && !state.editing"
            class="card-close-icon"
            name="edit-pen"
            @click="handleEdit"
          />
          <u-icon
            v-if="!props.readonly"
            color="#FF4D4F"
            class="card-close-icon"
            name="trash"
            @click="handleDelete"
          />
        </view>
      </view>
      <view v-if="state.activeData" class="card-content-wrapper">
        <scroll-view class="card-content-scroll" scroll-y>
          <u-gap height="32" bg-color="#ffffff" />
          <view class="card-content">
            <view v-for="col in props.columns" :key="col.prop">
              <template v-if="col.type === 'input'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconText" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view class="textarea-field-wrapper flex-center">
                    <view class="textarea-field-container">
                      <view class="textarea-field-value">
                        {{ state.activeData[col.prop].value }}
                      </view>
                      <textarea
                        v-model="state.activeData[col.prop].value"
                        class="textarea-field"
                        auto-blur
                        placeholder="请输入"
                        placeholder-style="font-size: 32rpx; line-height: 44rpx;"
                        style="line-height: 44rpx"
                        :maxlength="200"
                        :line-height="44"
                        :always-embed="true"
                        :adjust-position="true"
                        @blur="(e: any) => handleInputBlur(col, e.detail.value)"
                      />
                    </view>
                  </view>
                </view>
                <view v-else class="card-col-value">
                  {{ state.activeData[col.prop].value }}
                </view>
              </template>
              <template v-else-if="col.type === 'inputPhone'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconPhone" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view
                    class="input-field-wrapper"
                    hover-class="none"
                    :hover-stop-propagation="false"
                  >
                    <input
                      v-model="state.activeData[col.prop].value"
                      placeholder="请输入"
                      class="input-field"
                      type="text"
                      auto-blur
                      :maxlength="200"
                      :always-embed="true"
                      :adjust-position="true"
                      :cursor-spacing="40"
                      @input="(e: any) => handleUpdate(col, e.detail.value)"
                      @blur="(e: any) => handleInputBlur(col, e.detail.value)"
                    />
                  </view>
                  <view
                    v-show="!!state.activeData[col.prop].regErrorText"
                    class="input-field-error"
                  >
                    {{ state.activeData[col.prop].regErrorText }}
                  </view>
                </view>
                <view v-else class="card-col-value">{{ state.activeData[col.prop].value }}</view>
              </template>
              <template v-else-if="col.type === 'inputEmail'">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="email" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view
                    class="input-field-wrapper"
                    hover-class="none"
                    :hover-stop-propagation="false"
                  >
                    <input
                      v-model="state.activeData[col.prop].value"
                      placeholder="请输入"
                      class="input-field"
                      type="text"
                      auto-blur
                      :maxlength="200"
                      :always-embed="true"
                      :adjust-position="true"
                      :cursor-spacing="40"
                      @input="(e: any) => handleUpdate(col, e.detail.value)"
                      @blur="(e: any) => handleInputBlur(col, e.detail.value)"
                    />
                  </view>
                  <view
                    v-show="!!state.activeData[col.prop].regErrorText"
                    class="input-field-error"
                  >
                    {{ state.activeData[col.prop].regErrorText }}
                  </view>
                </view>
                <view v-else class="card-col-value">{{ state.activeData[col.prop].value }}</view>
              </template>
              <template v-else-if="col.type === 'inputIdCard'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconIdCard" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view
                    class="input-field-wrapper"
                    hover-class="none"
                    :hover-stop-propagation="false"
                  >
                    <input
                      v-model="state.activeData[col.prop].value"
                      placeholder="请输入"
                      class="input-field"
                      type="text"
                      auto-blur
                      :maxlength="200"
                      :always-embed="true"
                      :adjust-position="true"
                      :cursor-spacing="40"
                      @input="(e: any) => handleUpdate(col, e.detail.value)"
                      @blur="(e: any) => handleInputBlur(col, e.detail.value)"
                    />
                  </view>
                  <view
                    v-show="!!state.activeData[col.prop].regErrorText"
                    class="input-field-error"
                  >
                    {{ state.activeData[col.prop].regErrorText }}
                  </view>
                </view>
                <view v-else class="card-col-value">{{ state.activeData[col.prop].value }}</view>
              </template>
              <template v-else-if="col.type === 'inputNumber'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconNumber" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view
                    class="input-field-wrapper"
                    hover-class="none"
                    :hover-stop-propagation="false"
                  >
                    <input
                      v-model="state.activeData[col.prop].value"
                      placeholder="请输入"
                      class="input-field"
                      auto-blur
                      :maxlength="200"
                      :always-embed="true"
                      :adjust-position="true"
                      :cursor-spacing="40"
                      @input="(e: any) => handleUpdate(col, e.detail.value)"
                      @blur="(e: any) => handleNumberBlur(col, e.detail.value)"
                    />
                  </view>
                  <view
                    v-show="!!state.activeData[col.prop].regErrorText"
                    class="input-field-error"
                  >
                    {{ state.activeData[col.prop].regErrorText }}
                  </view>
                </view>
                <view v-else class="card-col-value">
                  {{ getNumberValue(col, state.activeData[col.prop].value) }}
                </view>
              </template>
              <template v-else-if="col.type === 'radio'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconRadio" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view class="select-field" @click="() => handleSelect(col)">
                    <view class="text-break">{{ getSelectName(col) }}</view>
                    <u-icon name="arrow-down" class="select-field-icon" />
                  </view>
                </view>
                <view v-else class="card-col-value">{{ getSelectName(col) }}</view>
              </template>
              <template v-else-if="col.type === 'select'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconCheckbox" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view class="select-field" @click="() => handleSelect(col)">
                    <view class="text-break">{{ getSelectName(col) }}</view>
                    <u-icon name="arrow-down" class="select-field-icon" />
                  </view>
                </view>
                <view v-else class="card-col-value">{{ getSelectName(col) }}</view>
              </template>
              <template v-else-if="col.type === 'datePicker'">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="calendar" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing" class="date-field-wrapper">
                  <view class="select-field" @click="() => handleDatePicker(col)">
                    <view>{{ getDatePickerName(col) || '请选择' }}</view>
                    <view
                      v-if="getDatePickerName(col)"
                      class="select-field-clear"
                      @click.stop="handleClear(col)"
                    >
                      <u-icon name="close" class="select-clear-icon" />
                    </view>
                    <u-icon v-else name="arrow-down" class="select-field-icon" />
                  </view>
                </view>
                <view v-else class="card-col-value">
                  {{ getDatePickerName(col) || '请选择' }}
                </view>
              </template>
              <template v-else-if="col.type === 'uploadImg'">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="photo" />
                  {{ col.label }}
                </view>
                <view class="card-col-value files-wrapper">
                  <view
                    v-if="state.editing"
                    class="fill-files-header flex-center flex-left"
                    @click="handleImageAdd(col)"
                  >
                    <u-icon class="fill-file-add-icon" name="plus" />
                    添加图片
                  </view>
                  <view v-if="state.activeData[col.prop]" class="image-list">
                    <view
                      v-for="(item, k) in state.activeData[col.prop].value"
                      :key="item.fileId + k"
                      class="image-item"
                    >
                      <image class="image-item-img" :src="item.url" :lazy-load="true" />
                      <view
                        v-if="state.editing"
                        class="icon-image-delete"
                        @click="handleFileDelete(item, col)"
                      >
                        <u-icon name="close" />
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              <template v-else-if="col.type === 'uploadFile'">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="file-text" />
                  {{ col.label }}
                </view>
                <view class="card-col-value files-wrapper">
                  <view
                    v-if="state.editing"
                    class="fill-files-header flex-center flex-left"
                    @click="handleFileAdd(col)"
                  >
                    <u-icon class="fill-file-add-icon" name="plus" />
                    添加文件
                  </view>
                  <view class="file-list">
                    <view
                      v-for="(item, k) in state.activeData[col.prop].value"
                      :key="item.fileId + k"
                      class="file-item"
                    >
                      <image class="file-item-icon" :src="getFileIcon(item)" />
                      <view class="file-item-name">{{ item.name }}</view>
                      <view
                        v-if="state.editing"
                        class="file-item-delete"
                        @click="handleFileDelete(item, col)"
                      >
                        删除
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              <template v-else-if="col.type === 'slider'">
                <view class="card-col-label">
                  <image class="fill-table-col-icon" :src="iconProgress" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing">
                  <view
                    class="input-field-wrapper"
                    hover-class="none"
                    :hover-stop-propagation="false"
                  >
                    <input
                      v-model="state.activeData[col.prop].value"
                      placeholder="请输入"
                      class="input-field"
                      auto-blur
                      :maxlength="200"
                      :always-embed="true"
                      :adjust-position="true"
                      :cursor-spacing="40"
                      @input="(e: any) => handleUpdate(col, e.detail.value)"
                      @blur="(e: any) => handleSliderBlur(col, e.detail.value)"
                    />
                  </view>
                  <view
                    v-show="!!state.activeData[col.prop].regErrorText"
                    class="input-field-error"
                  >
                    {{ state.activeData[col.prop].regErrorText }}
                  </view>
                </view>
                <view v-else class="card-col-value progress-field">
                  <u-line-progress
                    class="fill-table-progress"
                    :active-color="col.color"
                    :percent="getPercentValue(state.activeData[col.prop].value)"
                  >
                    <view class="fill-table-progress-text">
                      {{ getPercent(col, state.activeData[col.prop].value) }} %
                    </view>
                  </u-line-progress>
                </view>
              </template>
              <template v-else-if="col.type === 'userSelect'">
                <view class="card-col-label">
                  <u-icon class="fill-table-col-icon" name="account" />
                  {{ col.label }}
                </view>
                <view v-if="state.editing" class="date-field-wrapper">
                  <view class="select-field" @click="() => handleUserSelect(col)">
                    <view class="text-break">{{ getUserName(col) }}</view>
                    <view
                      v-if="
                        state.activeData[col.prop].value &&
                        state.activeData[col.prop].value.length > 0
                      "
                      class="select-field-clear"
                      @click.stop="handleClear(col)"
                    >
                      <u-icon name="close" class="select-clear-icon" />
                    </view>
                    <u-icon v-else name="arrow-down" class="select-field-icon" />
                  </view>
                </view>
                <view v-else class="card-col-value">
                  {{ getUserName(col) }}
                </view>
              </template>
            </view>
          </view>
          <view
            :style="{
              height: !state.editing ? '220rpx' : '96rpx',
              overflow: 'hidden',
              'border-radius': '0 0 24rpx 24rpx',
            }"
          />
        </scroll-view>
      </view>
    </view>
    <u-modal
      v-model="state.confirmNext"
      content="保存成功，是否继续新增"
      show-cancel-button
      @confirm="handleNextConfirm"
      @cancel="handleNextCancel"
    />
    <u-popup
      v-model="state.showSelect"
      :closeable="false"
      mode="bottom"
      class="fill-select-wrapper"
      safe-area-inset-bottom
    >
      <view class="fill-select-header">
        <view style="color: rgb(96, 98, 102)" @click="state.showSelect = false">取消</view>
        <view class="fill-select-title">{{ state.selectCol.label }}</view>
        <view @click="handleSelected">确定</view>
      </view>
      <scroll-view scroll-y class="fill-select-scroll">
        <view
          v-for="item in state.selectedOptions"
          :key="item.id"
          class="fill-select-item"
          @click="() => handleSelectItem(item)"
        >
          <view class="fill-select-name">{{ item.fullName }}</view>
          <view class="fill-select-check">
            <u-icon v-if="state.selectValue.includes(item.id)" name="checkmark" />
          </view>
        </view>
      </scroll-view>
    </u-popup>
    <u-picker
      v-model="state.showDatePicker"
      :mask-close-able="false"
      mode="time"
      :default-time="state.datePickerDefault"
      :params="state.datePickerParams"
      safe-area-inset-bottom
      @confirm="handleDatePickerConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import showSelector from '@/components/selector/show-selector';
import { LocationScopeEnum, SelectorTypeEnum } from '@/components/selector/types';
import { requestAllChooseImagePer } from '@/services/permissionRequest';
import iconZip from '@/static/fileTypes/Icon-zip.svg';
import iconExcel from '@/static/fileTypes/icon-excel.svg';
import iconFile from '@/static/fileTypes/icon-file.svg';
import iconImage from '@/static/fileTypes/icon-image.svg';
import iconPdf from '@/static/fileTypes/icon-pdf.svg';
import iconPpt from '@/static/fileTypes/icon-ppt.svg';
import iconWord from '@/static/fileTypes/icon-word.svg';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { nextTick, onMounted, reactive, watch } from 'vue';
import { createReportItem, getUploadUrl, updateReportItem } from '../../services/fill-report';
import iconCheckbox from '../../static/columns/checkbox.svg';
import iconIdCard from '../../static/columns/id-card.svg';
import iconNumber from '../../static/columns/number.svg';
import iconPhone from '../../static/columns/phone.svg';
import iconProgress from '../../static/columns/progress-bar.svg';
import iconRadio from '../../static/columns/radio.svg';
import iconText from '../../static/columns/text.svg';

// #ifdef APP-PLUS
import {
  judgeAndroidPermissionCamera,
  judgeAndroidPermissionPhotoLibrary,
  judgeIosPermissionCamera,
  judgeIosPermissionPhotoLibrary,
} from '@/app-platform/utils/app-permission';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
// #endif
import { getFileInfo, updateUploadResult } from '@/services/upload';
import { loginStore } from '@/store/modules/login';

const store = loginStore();
const { userInfo } = store;

dayjs.locale('zh-cn');

const units: any = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

const props = defineProps<{
  readonly?: boolean;
  total?: number;
  index?: number;
  columns: any[];
  seqId: string;
  reportId: string;
  flowBeforeId: string;
  data?: any;
}>();
const state = reactive({
  editing: false,
  activeData: null as any,
  confirmNext: false,
  showSelect: false,
  hasAdded: false,
  selectCol: {} as any,
  selectValue: [] as any[],
  selectedOptions: [] as any[],
  showDatePicker: false,
  showDatePicker2: false, // 日期控件在 APP 第一次展开初始话数据异常。用于标记是否第一次展开，第一次展开做延迟
  datePickerCol: {} as any,
  datePickerDefault: dayjs().format('YYYY-MM-DD HH:mm'),
  datePickerParams: {
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    timestamp: true,
  } as any,
});

const emit = defineEmits(['close', 'delete', 'add', 'update', 'editing']);
function handleSave() {
  const data: any = {};
  let hasError = '';
  let isEmptyRow = true;
  props.columns.forEach((col: any) => {
    const value = state.activeData[col.prop].value;
    if (col.type === 'slider') {
      if (value && value.trim() && !Number.isNaN(Number(value.trim()))) {
        data[col.prop] = +value.trim();
      } else {
        data[col.prop] = undefined;
      }
    } else if (col.type === 'input') {
      data[col.prop] = (value || '').substr(0, 200);
    } else {
      data[col.prop] = value;
    }
    if (!hasError && state.activeData[col.prop].regErrorText) {
      hasError = state.activeData[col.prop].regErrorText;
    }
    if (isEmptyRow) {
      if (
        col.type === 'select' ||
        col.type === 'uploadImg' ||
        col.type === 'uploadFile' ||
        col.type === 'userSelect'
      ) {
        if (data[col.prop] && data[col.prop].length > 0) {
          isEmptyRow = false;
        }
      } else if (
        col.type === 'input' ||
        col.type === 'inputPhone' ||
        col.type === 'inputEmail' ||
        col.type === 'inputIdCard' ||
        col.type === 'inputNumber' ||
        col.type === 'radio'
      ) {
        if (data[col.prop] && data[col.prop].trim()) {
          isEmptyRow = false;
        }
      } else if (col.type === 'slider' && typeof data[col.prop] === 'number') {
        isEmptyRow = false;
      } else if (col.type === 'datePicker' && data[col.prop]) {
        isEmptyRow = false;
      }
    }
  });
  if (hasError) {
    showInfo(hasError);
    return;
  }
  if (isEmptyRow) {
    showInfo('请先填报数据');
    return;
  }
  if (props.data?.id) {
    showLoading();
    updateReportItem(props.reportId, props.data.id, {
      data,
      flowBeforeId: props.flowBeforeId,
      seqId: props.seqId,
    })
      .then(res => {
        emit('update', res);
        state.editing = false;
      })
      .finally(() => {
        hideLoading();
      });
  } else {
    showLoading();
    createReportItem(props.reportId, {
      data,
      flowBeforeId: props.flowBeforeId,
      seqId: props.seqId,
    })
      .then(() => {
        state.hasAdded = true;
        state.confirmNext = true;
      })
      .finally(() => {
        hideLoading();
      });
  }
}
function handleEdit() {
  state.editing = true;
  emit('editing', true);
}
function handleNextConfirm() {
  state.editing = true;
  initActiveData(null, props.columns);
}
function handleNextCancel() {
  emit('add');
  nextTick(() => {
    emit('close');
  });
}
function handleDelete() {
  if (!props.data?.id) {
    if (state.hasAdded) {
      emit('add');
    }
    nextTick(() => {
      emit('close');
    });
  } else {
    emit('delete');
  }
}
function handleInputBlur(col: any, v: any) {
  state.activeData[col.prop].value = (v || '').trim();
}
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
function handleNumberBlur(col: any, v: any) {
  if (v && v.trim() && !Number.isNaN(Number(v.trim()))) {
    const value = fixNumber(v.trim());
    if (col.precision >= 0) {
      state.activeData[col.prop].value = sp_round(value, col.precision);
    } else {
      state.activeData[col.prop].value = value;
    }
  }
}
function handleSliderBlur(col: any, v: any) {
  if (v && v.trim() && !Number.isNaN(Number(v.trim()))) {
    if (v.includes('.')) {
      // toFixed 四舍五入采用的 银行家舍入规则 所以需要补充'00001'做修正
      state.activeData[col.prop].value = (+(v.trim() + '00001')).toFixed(col.precision);
    } else {
      state.activeData[col.prop].value = (+v.trim()).toFixed(col.precision);
    }
  }
}
function handleUpdate(col: any, v: any) {
  let regErrorText = '';
  if (v && col.type === 'inputPhone' && !/^1[3456789]\d{9}$|^0\d{2,3}-?\d{7,8}$/.test(v)) {
    regErrorText = '请输入正确的联系方式';
  } else if (
    v &&
    col.type === 'inputEmail' &&
    !/^[a-z0-9]+([._\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(v)
  ) {
    regErrorText = '请输入正确的邮箱';
  } else if (
    v &&
    col.type === 'inputIdCard' &&
    !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
      v,
    )
  ) {
    regErrorText = '请输入正确的身份证号码';
  } else if (v && v.trim() && col.type === 'inputNumber') {
    if (Number.isNaN(Number(v.trim()))) {
      regErrorText = col.label + '不是有效数值';
    }
  } else if (v && v.trim() && col.type === 'slider') {
    if (Number.isNaN(Number(v.trim()))) {
      regErrorText = col.label + '不是有效数值';
    } else {
      const percent = +v;
      if (percent > 100) {
        regErrorText = col.label + '不能大于 100';
      } else if (percent < 0) {
        regErrorText = col.label + '不能小于 0';
      }
    }
  }
  state.activeData[col.prop].regErrorText = regErrorText;
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
function getSelectName(col: any) {
  const value = state.activeData[col.prop]?.value;
  if (col.type === 'select') {
    if (value && value.length > 0) {
      const names = col.options
        .filter((i: any) => value.includes(i.id))
        .map((i: any) => i.fullName);
      return names.length > 0 ? names.join(',') : '请选择';
    }
    return '请选择';
  } else if (col.type === 'radio') {
    const option = col.options.find((i: any) => i.id === value);
    return option ? option.fullName : '请选择';
  }
  return '';
}
function handleSelect(col: any) {
  if (col.type !== 'select' && col.type !== 'radio') {
    return;
  }
  state.selectCol = col;
  const value = state.activeData[col.prop].value;
  if (value) {
    state.selectValue = col.type === 'select' ? [...value] : [value];
  } else {
    state.selectValue = [];
  }
  state.selectedOptions = col.options;
  state.showSelect = true;
}
function handleSelectItem(option: any) {
  if (state.selectCol.type === 'select') {
    if (state.selectValue.includes(option.id)) {
      state.selectValue = state.selectValue.filter(i => i !== option.id);
    } else {
      state.selectValue.push(option.id);
    }
  } else if (state.selectCol.type === 'radio') {
    if (state.selectValue.includes(option.id)) {
      state.selectValue = [];
    } else {
      state.selectValue = [option.id];
    }
  }
}
function handleSelected() {
  if (state.selectCol) {
    if (state.selectCol.type === 'select') {
      state.activeData[state.selectCol.prop].value = [...state.selectValue];
    } else if (state.selectCol.type === 'radio') {
      state.activeData[state.selectCol.prop].value =
        state.selectValue.length > 0 ? state.selectValue[0] : undefined;
    }
  } else {
    state.activeData[state.selectCol.prop].value = '';
  }
  state.showSelect = false;
}
function getDatePickerName(col: any) {
  const value = state.activeData[col.prop]?.value;
  if (value) {
    return dayjs(value).format(col.format);
  }
  return '';
}
function handleDatePicker(col: any) {
  if (col.type !== 'datePicker') {
    return;
  }
  state.datePickerCol = col;
  state.datePickerParams = {
    year: true,
    month: true,
    day: true,
    hour: false,
    minute: false,
    timestamp: true, // 1.3.7版本提供
  };
  let defaultFormat = 'YYYY-MM-DD';
  if (col.format && col.format.includes('HH:mm')) {
    state.datePickerParams.hour = true;
    state.datePickerParams.minute = true;
    defaultFormat = 'YYYY-MM-DD HH:mm';
  }
  let value = state.activeData[col.prop].value;
  if (value) {
    value = dayjs(value).format(defaultFormat);
  } else {
    value = dayjs().format(defaultFormat);
  }
  state.datePickerDefault = value;
  // #ifdef APP-PLUS
  if (!state.showDatePicker2) {
    state.showDatePicker2 = true;
    setTimeout(() => {
      state.showDatePicker = true;
    }, 100);
  } else {
    state.showDatePicker = true;
  }
  // #endif
  // #ifndef APP-PLUS
  state.showDatePicker = true;
  // #endif
}
async function validPermission() {
  let cameraPermission = false;
  let photoLibPermission = false;

  // #ifdef APP-PLUS
  if (plus.os.name === 'iOS') {
    cameraPermission = judgeIosPermissionCamera();
    photoLibPermission = judgeIosPermissionPhotoLibrary();
  }

  if (plus.os.name === 'Android') {
    cameraPermission = await judgeAndroidPermissionCamera();
    photoLibPermission = await judgeAndroidPermissionPhotoLibrary();
  }
  // #endif

  // #ifdef MP-WEIXIN
  [cameraPermission, photoLibPermission] = await new Promise(resolve => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve([true, true]),
      fail: () => {
        resolve([false, false]);
      },
    });
  });
  // #endif

  if (cameraPermission && photoLibPermission) {
    return ['album', 'camera'];
  }

  if (!cameraPermission && !photoLibPermission) {
    showInfo('没有摄像头及图库权限, 请前往设置授权');
    // #ifdef MP-WEIXIN
    setTimeout(() => {
      uni.openSetting({
        fail: (err: unknown) => {
          console.error('打开设置失败:', err);
        },
      });
    }, 300);
    // #endif
    return [];
  }

  if (!cameraPermission) {
    showInfo('没有摄像头权限, 请前往设置授权');
    return ['album'];
  }
  showInfo('没有图库权限, 请前往设置授权');
  return ['camera'];
}
function getExtraName(path: string) {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
}
function getFileName(path: string) {
  console.log('file path', path);
  const inx = path.lastIndexOf('/') + 1;
  return path.substring(inx);
}
async function uploadImage(file: any, col: any) {
  let fileId = '';
  let uploadResponse = false;
  // #ifdef APP-PLUS
  // App 上传需要原生读取到文件流才能上传，所以 App 的上传通过原生实现
  // App 获取文件地址的全路径
  await new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: file.path,
      success: res3 => {
        if (res3.path) {
          file.path = res3.path;
          resolve(res3.path);
        } else {
          reject('图片地址错误');
        }
      },
      fail: (error: any) => {
        console.log(error);
        reject('图片地址错误');
      },
    });
  });
  // #endif

  const requestParams: any = {
    locationId: userInfo?.locationId,
    fileType: file.extname,
    bucketType: 'public',
  };
  let getUploadUrlData: any = null;
  try {
    getUploadUrlData = await getUploadUrl(requestParams);
  } catch (error: any) {
    if ((error?.data?.message).includes('fileService.fileType.is.limited')) {
      showInfo(`${requestParams.fileType} 文件格式不支持`);
    } else {
      showInfo(error?.msg || error?.desc || error?.data?.message || '请求服务器失败');
    }
    return;
  }
  if (!getUploadUrlData) {
    return;
  }
  fileId = getUploadUrlData.fileId;

  // #ifdef APP-PLUS
  const { status }: any = await callBridge({
    service: Service.file,
    action: Action.fileUpload,
    data: {
      uploadUrl: getUploadUrlData.uploadUrl,
      header: getUploadUrlData.header,
      filePath: file.path,
      fileType: getUploadUrlData.fileType,
    },
  });
  uploadResponse = status == 1;
  // #endif
  // #ifdef H5
  uploadResponse = await new Promise((resolve, reject) => {
    uni.request({
      url: file.path,
      method: 'GET',
      responseType: 'arraybuffer',
      success(response) {
        uni.request({
          url: getUploadUrlData.uploadUrl,
          method: 'PUT',
          data: response.data,
          header: getUploadUrlData.header,
          success(res: any) {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              reject({ msg: '上传失败' });
            }
          },
          fail: function (error: any) {
            reject({ msg: error.msg || error.desc || '上传失败' });
          },
        });
      },
      fail: function (error: any) {
        reject({ msg: error.msg || error.desc || '上传失败' });
      },
    });
  });
  // #endif
  // #ifdef MP-WEIXIN
  uploadResponse = await new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager();
    fs.readFile({
      filePath: file.path,
      success: res => {
        uni.request({
          url: getUploadUrlData.uploadUrl,
          method: 'PUT',
          data: res.data,
          header: getUploadUrlData.header,
          success(res: any) {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              reject({ msg: '上传失败' });
            }
          },
          fail: function (error: any) {
            reject({ msg: error.msg || error.desc || '上传失败' });
          },
        });
      },
      fail: function (error: any) {
        reject({ msg: error.msg || error.desc || '上传失败' });
      },
    });
  });
  // #endif

  if (uploadResponse) {
    const updateResult = await updateUploadResult(fileId, 1, file.name);
    if (updateResult) {
      const fileInfo = await getFileInfo(fileId);
      const { fileName, fullUrl } = fileInfo;
      state.activeData[col.prop].value.push({
        fileId,
        url: fullUrl,
        name: fileName,
      });
    }
  }
}
async function handleImageAdd(col: any) {
  const files = state.activeData[col.prop].value;
  if (files && files.length + 1 > col.limit) {
    showInfo(`当前限制最多可以上传${col.limit}张图片`);
    return false;
  }
  // #ifdef APP-PLUS
  // App且是android需要权限使用说明（华为上架要求）
  if (plus.os.name === 'Android') {
    const hasAuth = await new Promise((resolve, reject) => {
      requestAllChooseImagePer(
        res => {
          // 已有权限
          console.log('permissionRequestResult : ' + JSON.stringify(res));
          resolve(true);
        },
        err => {
          // 无权限
          console.log('permissionRequestFail : ' + JSON.stringify(err));
          reject('');
        },
      );
    });
    if (hasAuth !== true) {
      return;
    }
  }
  // #endif
  // 选择图片文件
  uni.chooseImage({
    sourceType: ['camera', 'album'],
    sizeType: ['original', 'compressed'],
    count: col.limit - (files?.length || 0),
    extension: ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'svg'],
    async success(res: any) {
      console.log('chooseImage', res);
      const images: any[] = res.tempFiles.map((file: any) => ({
        path: file.path,
        name: file.name || getFileName(file.path),
        size: file.size,
        extname: file.name ? file.name.split('.').pop() : getExtraName(file.path),
      }));
      // 过滤尺寸（最大30M）
      const MAX_SIZE = 30 * 1024 * 1024;
      const filter = images.filter(item => item.size <= MAX_SIZE);
      if (filter.length < images.length) {
        showInfo(`图片不能超过 30 MB`);
        return;
      }
      let successCount = 0;
      showLoading();
      for (let i = 0; i < filter.length; i += 1) {
        try {
          await uploadImage(filter[i], col);
          successCount += 1;
        } catch (error) {
          console.log(error);
        }
      }
      hideLoading();
      if (filter.length === successCount) {
        showInfo('上传成功');
      } else {
        showInfo(`${successCount} 张图片上传成功，${filter.length - successCount} 张图片上传失败`);
      }
    },
    fail: async function (res: any) {
      console.log('chooseImageFailed: ' + JSON.stringify(res));
      const { code, errMsg } = res;
      console.log('code: ' + code + ', errMsg: ' + errMsg);
      // 权限验证
      // #ifndef H5
      // 11: android没有拍照权限 12: android没有图库权限
      // 2: ios没有拍照权限 8: ios没有图库权限
      if (plus.os.name !== 'Android') {
        if (code === 2 || code === 8 || code === 11 || code == 12) {
          if (errMsg !== 'chooseImage:fail cancel') {
            const permissionResult = await validPermission();
            console.log('permissionResult = ', permissionResult);
          }
        }
      }
      // #endif
    },
  });
}
async function handleFileAdd(col: any) {
  const files = state.activeData[col.prop].value;
  if (files && files.length + 1 > col.limit) {
    showInfo(`当前限制最多可以上传${col.limit}个文件`);
    return false;
  }
  let file: any = null;
  let fileSize: any = null;
  let fileType: any = null;
  let filePath: any = null;
  let fileName: any = null;
  // #ifdef APP-PLUS
  file = await callBridge({
    service: Service.file,
    action: Action.filePicker,
    data: { fileFilter: '*/*' },
  }).catch((err: any) => {
    const { code, msg } = err;
    console.log('code : ' + code + ', msg : ' + msg);
    // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
    if (code === 201 && msg === '取消') {
      return;
    }
    showInfo('文件选择异常');
  });
  if (file) {
    fileSize = file.fileLength;
    fileType = file.fileType;
    filePath = file.filePath;
    fileName = file.fileName;
  } else {
    return;
  }
  // #endif
  // #ifdef MP-WEIXIN || H5
  let chooseFile: any = null;
  if (uni.chooseFile) {
    chooseFile = uni.chooseFile;
  } else if (uni.chooseMessageFile) {
    chooseFile = uni.chooseMessageFile;
  }
  if (!chooseFile) {
    showInfo('文件选择异常');
    return;
  }
  await new Promise((resolve, reject) => {
    chooseFile({
      count: 1,
      type: 'all',
      async success(res: any) {
        if (res.tempFiles && res.tempFiles[0]) {
          file = res.tempFiles[0];
          resolve(true);
        } else {
          reject();
        }
      },
      fail: async function (res: any) {
        console.log('chooseImageFailed: ' + JSON.stringify(res));
        const { code, errMsg } = res;
        console.log('code: ' + code + ', errMsg: ' + errMsg);
        reject(res);
      },
    });
  });
  if (file) {
    fileSize = file.size;
    fileType = file.name ? file.name.split('.').pop() : getExtraName(file.path);
    filePath = file.path;
    fileName = file.name;
  } else {
    return;
  }
  // #endif
  const canUpload = beforeUpload(fileSize, col);
  if (!canUpload) {
    return;
  }
  const requestParams: any = {
    locationId: userInfo?.locationId,
    fileType: fileType,
    bucketType: 'public',
  };
  let getUploadUrlData: any = null;
  try {
    getUploadUrlData = await getUploadUrl(requestParams);
  } catch (error: any) {
    if ((error?.data?.message).includes('fileService.fileType.is.limited')) {
      showInfo('文件格式不支持');
    } else {
      showInfo(error?.msg || error?.desc || error?.data?.message || '请求服务器失败');
    }
    return;
  }
  if (!getUploadUrlData) {
    return;
  }
  // #ifdef APP-PLUS
  const { status }: any = await callBridge({
    service: Service.file,
    action: Action.fileUpload,
    data: {
      uploadUrl: getUploadUrlData.uploadUrl,
      header: getUploadUrlData.header,
      filePath,
      fileType: getUploadUrlData.fileType,
    },
  }).catch((err: any) => {
    const { code, msg } = err;
    console.log('code : ' + code + ', msg : ' + msg);
    // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
    if (code === 201 && msg === '取消') {
      return;
    }
    showInfo('上传失败');
    console.log('status : ' + status);
  });
  // #endif
  // #ifdef H5
  await new Promise((resolve, reject) => {
    uni.request({
      url: filePath,
      method: 'GET',
      responseType: 'arraybuffer',
      success(response) {
        uni.request({
          url: getUploadUrlData.uploadUrl,
          method: 'PUT',
          data: response.data,
          header: getUploadUrlData.header,
          success(res: any) {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              showInfo('上传失败');
              reject({ msg: '上传失败' });
            }
          },
          fail: function (error: any) {
            showInfo(error.msg || error.desc || '上传失败');
            reject({ msg: error.msg || error.desc || '上传失败' });
          },
        });
      },
      fail: function (error: any) {
        showInfo(error.msg || error.desc || '上传失败');
        reject({ msg: error.msg || error.desc || '上传失败' });
      },
    });
  });
  // #endif
  // #ifdef MP-WEIXIN
  await new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager();
    fs.readFile({
      filePath: filePath,
      success: res => {
        uni.request({
          url: getUploadUrlData.uploadUrl,
          method: 'PUT',
          data: res.data,
          header: getUploadUrlData.header,
          success(res: any) {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              showInfo('上传失败');
              reject({ msg: '上传失败' });
            }
          },
          fail: function (error: any) {
            showInfo(error.msg || error.desc || '上传失败');
            reject({ msg: error.msg || error.desc || '上传失败' });
          },
        });
      },
      fail: function (error: any) {
        showInfo(error.msg || error.desc || '上传失败');
        reject({ msg: error.msg || error.desc || '上传失败' });
      },
    });
  });
  // #endif
  const updateResult = await updateUploadResult(getUploadUrlData.fileId, 1, fileName);
  if (updateResult) {
    const fileInfo = await getFileInfo(getUploadUrlData.fileId);
    const { fileName, fullUrl } = fileInfo;
    state.activeData[col.prop].value.push({
      fileId: getUploadUrlData.fileId,
      url: fullUrl,
      name: fileName,
    });
    showInfo('上传成功');
  }
}
function beforeUpload(fileSize: any, col: any) {
  const isImage = col.type === 'uploadImg';
  if (!fileSize || !col.fileSize) {
    return true;
  }
  const unitNum = units[col.sizeUnit];
  const isRightSize = fileSize / unitNum < col.fileSize;
  if (!isRightSize) {
    showInfo(`${isImage ? '图片' : '文件'}大小超过${col.fileSize}${col.sizeUnit}`);
    return false;
  }
  return true;
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
function handleFileDelete(file: any, col: any) {
  const files = state.activeData[col.prop].value || [];
  state.activeData[col.prop].value = files.filter((i: any) => i.fileId !== file.fileId);
}
function handleClear(col: any) {
  if (
    col.type === 'input' ||
    col.type === 'inputNumber' ||
    col.type === 'inputPhone' ||
    col.type === 'inputEmail' ||
    col.type === 'inputIdCard'
  ) {
    state.activeData[col.prop].value = '';
  } else if (col.type === 'slider' || col.type === 'datePicker' || col.type === 'radio') {
    state.activeData[col.prop].value = undefined;
  } else if (col.type === 'select') {
    state.activeData[col.prop].value = [];
  } else if (col.type === 'userSelect') {
    if (col.multiple) {
      state.activeData[col.prop].value = [];
      state.activeData[col.prop].name = [];
    } else {
      state.activeData[col.prop].value = undefined;
      state.activeData[col.prop].name = undefined;
    }
  }
}
function handleDatePickerConfirm(e: any) {
  state.activeData[state.datePickerCol.prop].value = e.timestamp * 1000;
}
function getUserName(col: any) {
  const name = state.activeData[col.prop].name;
  if (col.multiple) {
    return (name || []).join(';') || '请选择';
  }
  return name || '请选择';
}
function handleUserSelect(col: any) {
  showSelector({
    type: SelectorTypeEnum.acrossLocationPerson,
    locationId: state.activeData[col.prop].creatorTenantId || '',
    scope: LocationScopeEnum.descendant,
    multiple: col.multiple,
    value: state.activeData[col.prop].value,
    callback: (value: any, data: any) => {
      state.activeData[col.prop].value = value;
      if (col.multiple) {
        state.activeData[col.prop].name = data.map((i: any) => i.name);
      } else {
        state.activeData[col.prop].name = data.name;
      }
    },
  });
}
function initActiveData(data: any, columns: any) {
  state.confirmNext = false;
  state.showSelect = false;
  state.hasAdded = false;
  state.selectCol = {};
  state.selectValue = [];
  state.selectedOptions = [];
  state.showDatePicker = false;
  state.showDatePicker2 = false; // 日期控件在 APP 第一次展开初始话数据异常。用于标记是否第一次展开，第一次展开做延迟
  state.datePickerCol = {};
  state.datePickerDefault = dayjs().format('YYYY-MM-DD HH:mm');
  state.datePickerParams = {
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    timestamp: true,
  };

  const activeData = {};
  columns.forEach(col => {
    if (data && data.id) {
      if (col.type === 'userSelect') {
        if (col.multiple) {
          activeData[col.prop] = {
            value: data[col.prop] || [],
            name: data[`${col.prop}_name`]?.split(';'),
            creatorTenantId: data.creatorTenantId || '',
            regErrorText: '',
          };
        } else {
          activeData[col.prop] = {
            value: data[col.prop],
            name: data[`${col.prop}_name`],
            regErrorText: '',
            creatorTenantId: data.creatorTenantId || '',
          };
        }
      } else if (col.type === 'select') {
        activeData[col.prop] = {
          value: data[col.prop],
          name: data[`${col.prop}_name`]?.split(','),
          regErrorText: '',
        };
      } else if (col.type === 'inputNumber') {
        let value = data[col.prop];
        if (value && col.precision >= 0) {
          value = sp_round(value, col.precision);
        }
        activeData[col.prop] = {
          value,
          name: '',
          regErrorText: '',
        };
      } else if (col.type === 'slider') {
        activeData[col.prop] = {
          value:
            typeof data[col.prop] !== 'undefined'
              ? (+data[col.prop]).toFixed(col.precision)
              : undefined,
          name: data[`${col.prop}_name`],
          regErrorText: '',
        };
      } else {
        activeData[col.prop] = {
          value: data[col.prop],
          name: data[`${col.prop}_name`],
          regErrorText: '',
        };
      }
    } else {
      if (col.type === 'datePicker') {
        if (col.__config__.defaultCurrent) {
          activeData[col.prop] = { value: Date.now(), name: '', regErrorText: '' };
        } else {
          activeData[col.prop] = { value: col.__config__.defaultValue, name: '', regErrorText: '' };
        }
      } else if (col.type === 'inputNumber') {
        let value = col.__config__.defaultValue;
        if (col.__config__.defaultValue && col.precision >= 0) {
          value = sp_round(col.__config__.defaultValue, col.precision);
        }
        activeData[col.prop] = {
          value,
          name: '',
          regErrorText: '',
        };
      } else if (col.type === 'slider') {
        activeData[col.prop] = {
          value:
            typeof col.__config__.defaultValue === 'number'
              ? col.__config__.defaultValue.toFixed(col.precision)
              : undefined,
          name: '',
          regErrorText: '',
        };
      } else if (col.type === 'uploadImg' || col.type === 'uploadFile') {
        activeData[col.prop] = { value: [], name: [], regErrorText: '' };
      } else if (col.type) {
        activeData[col.prop] = {
          value: col.__config__.defaultValue || '',
          name: '',
          regErrorText: '',
        };
      }
    }
  });
  state.activeData = activeData;
}
watch(
  () => ({ data: props.data, columns: props.columns, index: props.index }),
  ({ data, columns }) => {
    state.editing = !data;
    state.activeData = null;
    if (columns) {
      nextTick(() => {
        initActiveData(data, columns);
      });
    }
  },
);
onMounted(() => {
  state.editing = !props.data;
  state.activeData = null;
  if (props.columns) {
    nextTick(() => {
      initActiveData(props.data, props.columns);
    });
  }
});
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
    border-radius: 24rpx;
    overflow: hidden;
  }
  .card-content-scroll {
    height: 100%;
  }
  .card-content {
    padding: 0 32rpx;
  }
  .card-close-icon {
    height: 48rpx;
    width: 48rpx;
    font-size: 48rpx;
    color: #1677ff;
  }
  .card-close-icon + .card-close-icon {
    margin-left: 16rpx;
  }
  .card-index-wrapper {
    flex: 1;
  }
  .card-index-info {
    display: flex;
    color: rgba(0, 0, 0, 0.88);
    font-size: 34rpx;
    align-items: center;
  }
  .card-index-split {
    color: rgba(0, 0, 0, 0.88);
    font-size: 40rpx;
    margin-top: -4rpx;
  }
  .card-index-current {
    color: #1677ff;
    font-size: 40rpx;
    font-weight: 500;
  }
  .card-action-list {
    display: flex;
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
    font-size: 32rpx;
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
  .textarea-field-wrapper {
    min-height: 96rpx;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
  .textarea-field-container {
    width: 100%;
    position: relative;
  }
  .textarea-field-value {
    line-height: 44rpx;
    font-size: 32rpx;
    min-height: 92rpx;
    padding: 24rpx 30rpx !important;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .textarea-field {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    font-size: 32rpx !important;
    line-height: 44rpx !important;
    margin: 0 !important;
    padding: 24rpx 30rpx !important;
    border-radius: 4px;
    height: auto !important;
    min-height: 100%;
    max-height: 100%;
    background-color: #fff;
  }
  .input-field-wrapper {
    padding: 24rpx 30rpx;
    height: 96rpx;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .input-field {
    width: 100%;
    line-height: 44rpx;
    height: 44rpx;
    min-height: 44rpx;
    font-size: 32rpx;
  }
  .input-field-error {
    color: #fa3534;
    font-size: 28rpx;
    text-align: left;
  }
  .date-field-wrapper {
    display: flex;
    align-items: flex-start;
  }
  .select-field {
    flex: 1;
    font-size: 32rpx;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding: 24rpx 30rpx;
    min-height: 96rpx;
    line-height: 44rpx;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .select-field-icon {
    margin-top: 8rpx;
  }
  .fill-file-add-icon {
    height: 40rpx;
    width: 40rpx;
    margin-right: 16rpx;
    font-size: 24rpx;
    background-color: #909399;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    overflow: hidden;
  }
  .select-field-clear {
    margin-left: 16rpx;
    margin-top: 2rpx;
  }
  .select-clear-icon {
    height: 40rpx;
    width: 40rpx;
    font-size: 20rpx;
    background-color: #909399;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    overflow: hidden;
  }
  .fill-files-header {
    display: flex;
    align-items: center;
    padding-top: 24rpx;
    font-size: 30rpx;
    line-height: 44rpx;
    color: rgba(0, 0, 0, 0.65);
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
  .icon-image-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
    height: 32rpx;
    width: 32rpx;
    font-size: 24rpx;
    background-color: rgba(0, 0, 0, 0.55);
    color: #ffffff;
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
    overflow: hidden;
  }
  .file-item-delete {
    color: #1677ff;
    font-size: 26rpx;
    margin-left: 16rpx;
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
.fill-select-wrapper {
  :deep(.u-drawer-bottom) {
    border-radius: 16rpx 16rpx 0 0;
  }
  .fill-select-scroll {
    max-height: 48vh;
  }
  .fill-select-header {
    padding: 24rpx;
    color: #1677ff;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .fill-select-title {
    color: rgba(0, 0, 0, 0.88);
    text-align: center;
    font-size: 34rpx;
    font-weight: 500;
  }
  .fill-select-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16rpx 0;
    margin: 0 24rpx;
  }
  .fill-select-item + .fill-select-item {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .fill-select-name {
    flex: 1;
  }
  .fill-select-check {
    width: 40rpx;
    height: 40rpx;
    font-size: 40rpx;
    margin-left: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1677ff;
  }
}
</style>
