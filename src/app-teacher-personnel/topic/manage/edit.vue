<template>
  <page>
    <view
      class="topic-manage-edit-wrap"
      style="height: calc(100vh - 128rpx - var(--window-top) - env(safe-area-inset-bottom))"
    >
      <scroll-view :scroll-y="true" style="height: 100%" scroll-with-animation>
        <view class="white-block">
          <view class="section small">
            <view class="head-title1">批次标题<text class="red-dot">*</text></view>
            <view>
              <textarea
                v-model="formState.title"
                auto-height
                class="textarea-input"
                placeholder="请输入批次标题"
                :maxlength="50"
                :placeholder-style="{ fontSize: '16px', color: '#00000073' }"
                :disabled="isFormDisabled"
              ></textarea></view
          ></view>
          <view class="section">
            <view
              class="level flex-between"
              @click="!edu || isFormDisabled ? null : handleShowSelect()"
            >
              <view class="left">
                <view class="head-title1">课题级别<text class="red-dot">*</text></view>
                <view class="level-text">{{
                  find(options, val => val.value == formState.level)?.label || '课题级别'
                }}</view>
              </view>
              <view class="right">
                <u-icon
                  v-if="edu && !isFormDisabled"
                  name="arrow-right"
                  size="40"
                  color="#00000073"
                ></u-icon>
              </view>
            </view>
          </view>
          <view class="section small">
            <view class="head-title1">课题配额</view>
            <view>
              <textarea
                v-model="formState.quota"
                auto-height
                class="textarea-input"
                placeholder="请输入课题配额说明"
                :maxlength="500"
                :placeholder-style="{ fontSize: '16px', color: '#00000073' }"
                :disabled="isFormDisabled"
              ></textarea></view
          ></view>
          <view class="section">
            <view class="head-title1">课题组成员上限<text class="red-dot">*</text></view>
            <view>
              <u-number-box
                v-model="formState.memberLimit"
                :min="1"
                :max="50"
                :disabled="isFormDisabled"
              ></u-number-box
            ></view>
            <view class="limit-desc">成员不包括课题主持人</view>
          </view>
        </view>

        <view class="white-block top padding">
          <view class="head-title1">附件材料</view>
          <UploadFile
            :disabled="isFormDisabled"
            :max-size="20"
            :max-count="10"
            button-text="上传材料"
            :default-file-list="formState._attachmentList"
            @afterUpload="fileAfterUpload('attachment', $event)"
          ></UploadFile>
          <view class="tip">单个文件大小不能超过20M,最多可上传10个附件。</view>
        </view>

        <view class="section-tip"> 课题模板材料 </view>
        <view
          v-for="(item, index) in formState.materials"
          :key="item.stage"
          class="white-block padding"
          :class="{ top: index !== 0 }"
        >
          <view class="head-title1 bold"
            >{{ getTitle(item.stage) }}<text class="red-dot">*</text></view
          >

          <view
            class="time-item flex-between"
            :class="{ disabled: isDisabled(item.stage) }"
            @click="isDisabled(item.stage) ? null : handleShowPicker(item?.deadline, index)"
          >
            <text>截止时间</text>
            <view class="flex"
              ><text class="time">{{
                item?.deadline ? item?.deadline?.format?.('YYYY-MM-DD HH:mm') : '请选择'
              }}</text>
              <u-icon name="arrow-right" size="32" color="#00000073"></u-icon></view
          ></view>
          <UploadFile
            :max-size="20"
            :max-count="10"
            button-text="上传材料"
            :default-file-list="item.attachmentList"
            @afterUpload="fileAfterUpload1(index, $event)"
            :disabled="isFileDisabled(item.stage)"
          ></UploadFile>
        </view>
      </scroll-view>
    </view>

    <view class="topic-manage-edit-bottom">
      <u-button class="btn" type="primary" plain @click="handleCancel">取消</u-button>
      <u-button class="btn" type="primary" :loading="saveLoading" @click="handleSubmit"
        >提交</u-button
      >
    </view>

    <u-picker
      v-model="showPicker"
      mode="time"
      :params="{
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        second: false,
      }"
      :default-time="defaultTime"
      :step="30"
      @confirm="handleConfirm"
    ></u-picker>

    <u-select
      v-model="showSelect"
      :list="options"
      :default-value="defaultValue"
      @confirm="onSelect"
    ></u-select>

    <u-toast ref="toast" />
  </page>
</template>

<script setup lang="ts">
import { detail, save, update } from '@/app-teacher-personnel/topic/api/topicBatch';
import { findByLocationId } from '@/app-teacher-personnel/topic/api/topicMaterialConfig';
import UploadFile from '@/app-teacher-personnel/topic/components/upload/UploadFile.vue';
import { eduLevelEnum, levelEnum } from '@/app-teacher-personnel/topic/helper/enum';
import { isEdu } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { cloneDeep, find, map } from 'lodash-es';
import { computed, ref } from 'vue';

dayjs.extend(isSameOrAfter);

const id = ref('');
const formState = ref<any>({
  memberLimit: 1,
  materials: [
    { stage: 1, deadline: null, attachment: '', attachmentList: [] },
    { stage: 2, deadline: null, attachment: '', attachmentList: [] },
    { stage: 3, deadline: null, attachment: '', attachmentList: [] },
    { stage: 4, deadline: null, attachment: '', attachmentList: [] },
  ],
});
const batchDetail = ref<any>({});
const edu = isEdu();
const showPicker = ref(false);
const showSelect = ref(false);
const defaultTime = ref();
const defaultValue = ref();
const currentClickIndex = ref();
const saveLoading = ref(false);
const toast = ref();

function handleCancel() {
  uni.navigateBack();
}

function validCurrent() {
  let r = { failed: false };
  for (const key of Object.keys(formState.value.materials || [])) {
    const one = formState.value.materials[key];
    const value = one?.deadline;
    if (value && value?.isBefore(dayjs(), 'minute') && !isDisabled(one.stage)) {
      const name = getTitle(one?.stage);
      return { failed: true, msg: name + '不能早于当前时间' };
    }
  }

  return r;
}

const labels = ['课题申报', '开题论证', '中期检查', '结题鉴定'];

function validAfter() {
  let r = { failed: false };
  for (const index of Object.keys(formState.value.materials || [])) {
    const one = formState.value.materials[index];
    const value = one?.deadline;
    if (isDisabled(one.stage)) {
      continue;
    }
    for (let i = 0; i < index; i++) {
      if (
        formState.value.materials?.[i]?.deadline &&
        (formState.value.materials?.[i]?.deadline as dayjs.Dayjs).isSameOrAfter(value, 'minute') &&
        !isDisabled(formState.value.materials?.[i]?.stage)
      ) {
        return {
          failed: true,
          msg: `截止时间不能早于前一阶段的截止时间，请检查后重新填写！`,
          // msg: `${labels[index]}的截止时间不能早于${labels.slice(0, index).join('、')}`,
        };
      }
    }
  }

  return r;
}

//提交
const handleSubmit = async () => {
  console.log('ccc ', formState.value);
  if (!formState.value.title?.trim()) {
    uni.showToast({
      title: '请输入批次标题',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.level) {
    uni.showToast({
      title: '请选择课题级别',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.memberLimit) {
    uni.showToast({
      title: '请输入课题成员组上限',
      icon: 'none',
    });
    return;
  }
  if (
    batchDetail.value.memberLimit &&
    formState.value.memberLimit < batchDetail.value.memberLimit
  ) {
    uni.showToast({
      title: '课题组成员上限只能增加不能减少',
      icon: 'none',
    });
    return;
  }
  for (let one of formState.value.materials) {
    if (!one?.attachment?.length) {
      uni.showToast({
        title: `${getTitle(one?.stage)}请上传模板材料`,
        icon: 'none',
      });
      return;
    }
    if (!one?.deadline) {
      uni.showToast({
        title: `${getTitle(one?.stage)}请选择截止时间`,
        icon: 'none',
      });
      return;
    }
  }

  const _validCurrent = validCurrent();
  if (_validCurrent.failed) {
    toast.value.show({
      title: _validCurrent.msg,
      type: 'default',
    });
    // uni.showToast({
    //   title: _validCurrent.msg,
    //   icon: 'none',
    //   mask: false,
    //   duration: 3000,
    // });
    return;
  }

  const _validAfter = validAfter();
  if (_validAfter.failed) {
    toast.value.show({
      title: _validAfter.msg,
      type: 'default',
    });
    // uni.showToast({
    //   title: _validAfter.msg,
    //   icon: 'none',
    //   mask: false,
    //   duration: 3000,
    // });
    return;
  }

  const finalData = { ...(formState.value || {}), title: formState.value.title?.trim() };

  try {
    saveLoading.value = true;
    if (id.value) {
      await update(finalData);
      uni.showToast({
        title: '更新成功',
        icon: 'success',
      });
    } else {
      await save(finalData);
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
    }
    uni.$emit('refreshTopicManageList');
    uni.navigateBack();
  } catch (error) {
  } finally {
    saveLoading.value = false;
  }
};

const isDisabled = (index: number) => index < formState.value.stage;
const isFileDisabled = (index: number) => index <= formState.value.stage;
const isFormDisabled = computed(() => {
  return !!(batchDetail.value.id && batchDetail.value.stage !== 1);
});

const options = computed(() => {
  return edu ? eduLevelEnum : levelEnum;
});

function getTitle(_stage) {
  switch (_stage) {
    case 1:
      return '课题申报';
    case 2:
      return '开题论证';
    case 3:
      return '中期检查';
    case 4:
      return '结题鉴定';
    default:
      return '';
  }
}

function fileAfterUpload(field, files: any[]) {
  formState.value[field] = map(files, f => f.fileId)?.join(',');
}
function fileAfterUpload1(index, files: any[]) {
  formState.value.materials[index].attachment = map(files, f => f.fileId)?.join(',');
}

function onSelect(arr) {
  let selectOne = arr[0] || {};
  formState.value.level = selectOne?.value;
}
function handleShowSelect() {
  // const index = props.options?.find(one => one.value == newValue) || {};
  const _index = options.value?.findIndex(one => one.value == formState.value.level);
  defaultValue.value = [_index >= 0 ? _index : 0];
  showSelect.value = true;
}

function handleConfirm(e) {
  const { year, month, day, hour, minute } = e || {};
  const newDay = dayjs()
    .set('year', year)
    .set('month', month - 1)
    .set('date', day)
    .set('hour', hour)
    .set('minute', minute)
    .set('second', 0)
    .startOf('minute');
  const newDayStr = newDay?.format('YYYY-MM-DD HH:mm:ss');
  defaultTime.value = newDayStr;
  formState.value.materials[currentClickIndex.value].deadline = newDay;
}

function handleShowPicker(val, index) {
  showPicker.value = true;
  currentClickIndex.value = index;
  defaultTime.value = dayjs().startOf('hour').format('YYYY-MM-DD HH:mm:ss');
  if (val) {
    defaultTime.value = val?.format?.('YYYY-MM-DD HH:mm:ss');
  }
}

//获取详情
const getDetail = async (_id: any) => {
  if (_id != '') {
    //查询
    const res: any = await detail(_id);
    batchDetail.value = cloneDeep(res);
    //回显数据
    formState.value = res;
    formState.value._attachmentList = map(res.attachmentList, f => ({
      fileId: f.fileId,
      name: f.fileName,
      url: f.fileUrl,
    }));

    formState.value.materials = map(res.materials, f => {
      return {
        ...f,
        deadline: dayjs(f.deadline).startOf('minute'),
        attachmentList: map(f.attachmentList, v => ({
          fileId: v.fileId,
          name: v.fileName,
          url: v.fileUrl,
        })),
      };
    });
  }
};

//新增时，模板材料处理
const getMaterialConfig = async () => {
  const data = await findByLocationId(id);
  formState.value.materials[0].attachmentList = map(data.declareTopicFiles, f => ({
    fileId: f.fileId,
    name: f.fileName,
    url: f.fileUrl,
  }));
  formState.value.materials[0].attachment = data.declareTopic;

  formState.value.materials[1].attachmentList = map(data.argumentFiles, f => ({
    fileId: f.fileId,
    name: f.fileName,
    url: f.fileUrl,
  }));
  formState.value.materials[1].attachment = data.argument;

  formState.value.materials[2].attachmentList = map(data.termCheckFiles, f => ({
    fileId: f.fileId,
    name: f.fileName,
    url: f.fileUrl,
  }));
  formState.value.materials[2].attachment = data.termCheck;

  formState.value.materials[3].attachmentList = map(data.authenticateFiles, f => ({
    fileId: f.fileId,
    name: f.fileName,
    url: f.fileUrl,
  }));
  formState.value.materials[3].attachment = data.authenticate;
  console.log('...... > getMaterialConfig > formState:', formState);
  // formState.value._material1 = map(data.declareTopicFiles, f => ({
  //   fileId: f.fileId,
  //   name: f.fileName,
  //   url: f.fileUrl,
  // }));
  // formState.value.material1 = data.declareTopic;

  // formState.value._material2 = map(data.argumentFiles, f => ({
  //   fileId: f.fileId,
  //   name: f.fileName,
  //   url: f.fileUrl,
  // }));
  // formState.value.material2 = data.argument;

  // formState.value._material3 = map(data.termCheckFiles, f => ({
  //   fileId: f.fileId,
  //   name: f.fileName,
  //   url: f.fileUrl,
  // }));
  // formState.value.material3 = data.termCheck;

  // formState.value._material4 = map(data.authenticateFiles, f => ({
  //   fileId: f.fileId,
  //   name: f.fileName,
  //   url: f.fileUrl,
  // }));
  // formState.value.material4 = data.authenticate;
};

onLoad(options => {
  if (options.id) {
    id.value = options.id;
    getDetail(options.id);
  } else {
    if (!edu) {
      formState.value.level = 5;
    }
    //新增时，获取配置材料
    getMaterialConfig();
  }
  uni.setNavigationBarTitle({
    title: !options.id ? '新建批次' : '编辑批次',
  });
});
</script>

<style scoped lang="scss">
.topic-manage-edit-wrap {
  padding: px2rpx(12px) px2rpx(16px);

  .section-tip {
    margin: px2rpx(18) 0 px2rpx(8);
    color: rgba($color-text-base, 0.65);
    @include footnote-regular;
  }
  .white-block {
    background-color: #fff;
    border-radius: px2rpx(8px);
    box-shadow: 0 1px 2px 0 #0000000a;
    padding: 0 px2rpx(16px);
    /* padding: px2rpx(12px) px2rpx(16px); */
    .head-title1 {
      @include subheadline-regular;
      margin-bottom: px2rpx(8px);
      &.bold {
        font-weight: 500;
      }
    }
    &.top {
      margin-top: 24rpx;
    }
    &.padding {
      padding: px2rpx(12px) px2rpx(16px);
    }
    .red-dot {
      color: #ff4d4f;
      margin-left: px2rpx(4px);
    }
    .section {
      padding: px2rpx(16) 0;
      border-bottom: 1rpx solid #0000000f;
      &:last-child {
        border-bottom: none;
      }
      &.small {
        padding: px2rpx(12) 0;
      }
      .limit-desc {
        @include caption-1-regular;
        color: rgba($color-text-base, 0.45);
        margin-top: px2rpx(6);
      }
    }
    .level {
      .level-text {
        @include body-regular;
        color: rgba($color-text-base, 0.45);
      }
    }
    .tip {
      margin-top: px2rpx(8);
      @include caption-1-regular;
      color: rgba($color-text-base, 0.45);
    }
    .time-item {
      height: px2rpx(48);
      margin-bottom: px2rpx(12);
      .time {
        color: rgba($color-text-base, 0.65);
        margin-right: 8rpx;
      }
      &.disabled {
        opacity: 0.45;
      }
    }
  }
}
.topic-manage-edit-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
  .btn {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
  }
}
</style>
