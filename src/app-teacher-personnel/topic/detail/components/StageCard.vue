<template>
  <view :class="['stage-card', { 'is-first': isFirst }]">
    <view
      :class="[
        'stage-title',
        {
          current: topic.stage === stageInfo.stage,
          over: topic.stage > stageInfo.stage,
        },
      ]"
    >
      <view class="stage-icon">
        <u-icon v-if="stageInfo.stage < topic?.stage" name="checkmark" size="24"></u-icon>
        <text v-else>{{ stageInfo.stage }}</text>
      </view>
      <text class="stage-name">{{ getStageName(stageInfo.stage) }}</text>
      <Tag
        v-if="!isHideStatus(stageInfo) && getStatusItem(stageInfo.status, stageInfo.stage)"
        class="status-tag"
        :color="`status_${getStatusItem(stageInfo.status, stageInfo.stage)?.color}`"
        :text="getStatusItem(stageInfo.status, stageInfo.stage)?.label"
      ></Tag>
    </view>
    <view class="stage-deadline">
      <text>{{ formatDate(stageInfo.deadline, 'YYYY-MM-DD hh:mm:ss') }}</text>
    </view>
    <view
      v-for="(item, index) in stageInfo.files"
      :key="item.templateFile.fileId"
      class="stage-file"
    >
      <view class="file-title">
        <text class="file-name"
          >{{ index + 1 }}. {{ getFileNameWithoutExt(item.templateFile.fileName) }}</text
        >
        <text v-if="!item.materialFile && !isUploadDisabled" class="file-name-tip">未提交</text>
      </view>
      <text v-if="isUploadDisabled && !item?.fileList?.length" class="tip-text">{{
        uploadTipText
      }}</text>
      <view v-else class="file-uploader">
        <UploadFile
          :max-count="1"
          :max-size="50"
          :default-file-list="item?.fileList"
          :disabled="isUploadDisabled"
          @after-upload="afterUpload($event, item)"
        ></UploadFile>
      </view>
    </view>
    <view
      v-if="
        stageInfo.stage === topic.stage &&
        topic.isManager == 1 &&
        !isHideStatus(stageInfo) &&
        isAdminRoleView
      "
      class="buttons"
    >
      <!-- 课题申报阶段 -->
      <template v-if="stageInfo.stage === 1">
        <!-- 校级待审核状态 -->
        <template v-if="stageInfo.status === 1 && !isBureau && topic.level != 5">
          <view class="link" @click="rejectHandle"><text>驳回申请</text></view>
          <view class="link" @click="approveHandle(stageInfo.status)"><text>通过申请</text></view>
        </template>

        <template v-if="stageInfo.status === 1 && !isBureau && topic.level == 5">
          <view class="link" @click="rejectHandle"><text>驳回申请</text></view>
          <view class="link" @click="approveHandle(stageInfo.status, 1)"
            ><text>确认立项</text></view
          >
        </template>

        <!-- 县级待审核状态 -->
        <template v-else-if="stageInfo.status === 2 && isBureau">
          <view class="link" @click="rejectHandle"><text>驳回申请</text></view>
          <view class="link" @click="approveHandle(stageInfo.status, 1)"
            ><text>确认立项</text></view
          >
        </template>
        <!-- 已立项状态 -->
        <template v-else-if="stageInfo.status === 3 && approvalAuth">
          <view class="link" @click="revokeHandle"><text>撤销立项</text></view>
        </template>
      </template>
      <!-- 中期检查阶段 -->
      <template v-else-if="stageInfo.stage === 3 && approvalAuth">
        <!-- 待评定状态 -->
        <template v-if="stageInfo.status === 0">
          <view
            class="link"
            @click="
              evaluateHandle({
                title: '评定成绩',
                score: 2,
                stage: stageInfo.stage,
                tip: `“${topic.name}”的中期检查成绩评定为`,
              })
            "
            ><text>成绩评定</text></view
          >
        </template>
        <!-- 合格、不合格状态 -->
        <template v-else-if="!!stageInfo.status">
          <view
            class="link"
            @click="
              evaluateHandle({
                title: '重新评定成绩',
                score: stageInfo.status,
                stage: stageInfo.stage,
                tip: `“${topic.name}”的中期检查成绩重新评定为`,
              })
            "
            ><text>重新评定</text></view
          >
        </template>
      </template>
      <!-- 结题鉴定阶段 -->
      <template v-else-if="stageInfo.stage === 4 && approvalAuth">
        <!-- 待评定状态 -->
        <template v-if="stageInfo.status === 0">
          <view
            class="link"
            @click="
              evaluateHandle({
                title: '评定成绩',
                score: 2,
                stage: stageInfo.stage,
                tip: `“${topic.name}”的结题鉴定成绩评定为`,
              })
            "
            ><text>成绩评定</text></view
          >
        </template>
        <!-- 其他状态 -->
        <template v-else-if="!!stageInfo.status">
          <view
            class="link"
            @click="
              evaluateHandle({
                title: '重新评定成绩',
                score: stageInfo.status,
                stage: stageInfo.stage,
                tip: `“${topic.name}”的结题鉴定成绩重新评定为`,
              })
            "
            ><text>重新评定</text></view
          >
        </template>
      </template>
    </view>
  </view>
  <Confirm ref="confirmRef"></Confirm>
  <EvaluateModal ref="evaluateModalRef"></EvaluateModal>
</template>
<script setup lang="ts">
import {
  addMaterialsFile,
  approve,
  authenticateEvaluate,
  deleteMaterialsFile,
  reject,
  revoke,
  termEvaluate,
} from '@/app-teacher-personnel/topic/api/topicInfo';
import { loginStore } from '@/store/modules/login';
import { formatDate, isEdu } from '@/utils/tools';
import dayjs from 'dayjs';
import { find, noop } from 'lodash-es';
import { PropType, computed, ref } from 'vue';
import Tag from '../../components/Tag/index.vue';
import Confirm from '../../components/confirm/index.vue';
import UploadFile from '../../components/upload/UploadFile.vue';
import { getFileNameWithoutExt, getStageName, getStatusItem } from '../../helper/utils';
import EvaluateModal, { ConfirmParams } from './EvaluateModal.vue';

const props = defineProps({
  topic: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  stageInfo: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isAdminRoleView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'reload'): void;
}>();

const confirmRef = ref<InstanceType<typeof Confirm>>();
const evaluateModalRef = ref<InstanceType<typeof EvaluateModal>>();

const store = loginStore();
const { userInfo } = store;

const isBureau = isEdu();
const isHost = computed(() => userInfo?.id === props.topic?.compere?.userId);
const isMember = computed(() => {
  return !!find(props.topic?.members, m => m.userId === userInfo?.id);
});

const approvalAuth = computed(() => {
  return (props.topic.level == 5 && !isBureau) || (props.topic.level != 5 && isBureau);
});

const uploadTipText = computed(() => {
  if (props.isAdminRoleView) {
    return '未提交';
  } else if (props.stageInfo?.stage > props.topic?.stage) {
    return '进入该阶段后上传材料';
  } else if (
    [2, 3, 4].includes(props.stageInfo.stage) &&
    [4, 5].includes(find(props.topic?.stageInfoList, s => s?.stage === 1)?.status)
  ) {
    return '课题申报不通过，无法上传材料';
  } else if (
    props.stageInfo.stage === 4 &&
    find(props.topic?.stageInfoList, s => s?.stage === 3)?.status === 1
  ) {
    return '中期检查不合格，无法上传材料';
  } else if (!dayjs(props.stageInfo.deadline).isAfter(dayjs())) {
    return '已超过阶段截止时间，无法上传材料';
  } else if (props.stageInfo.stage < props.topic?.stage) {
    return '该阶段已结束，无法上传材料';
  } else if (props.stageInfo.stage === 1) {
    return '该阶段无法上传材料';
  } else if (
    (props.stageInfo.stage === 3 || props.stageInfo.stage === 4) &&
    props.stageInfo.status !== 0
  ) {
    return '成绩已评定，无法上传材料';
  } else if (!(isHost.value || isMember.value)) {
    return '未提交';
  }
  return '';
});

const isUploadDisabled = computed(() => {
  return !!uploadTipText.value;
});

/**
 * 不显示阶段状态/成绩标签的情况
 * 2.
 * 3. 中期检查不合格时，结题鉴定状态显示 "/"
 */
const isHideStatus = (record: any) => {
  // 未进行到当前阶段
  if (record.stage > props.topic?.stage) {
    return true;
  }
  // 县级不通过和校级不通过时，中期检查和结题鉴定状态显示 "/"
  if (
    [3, 4].includes(record.stage) &&
    [4, 5].includes(find(props.topic?.stageInfoList, s => s?.stage === 1)?.status)
  ) {
    return true;
  }
  // 中期检查不合格时，结题鉴定状态显示 "/"
  if (record.stage === 4 && find(props.topic?.stageInfoList, s => s?.stage === 3)?.status === 1) {
    return true;
  }
  return false;
};

const approveHandle = async (status: number, type = 0) => {
  const showTip = status === 1 && props.topic.level !== 5;
  const content = `确认通过课题“${props.topic.name}”的审核？`;
  const title = type !== 0 ? '确认立项' : '通过申请';
  const params = showTip
    ? {
        title,
        content: content + '通过之后将上报给县级审核',
      }
    : {
        title,
        content,
      };
  const confirmText = type !== 0 ? '确认立项' : '确认';
  if (
    !(await confirmRef?.value?.confirm({
      ...params,
      confirmText,
    }))
  ) {
    return;
  }
  await approve(props.topic.id);
  emit('reload');
};

const rejectHandle = async () => {
  if (
    !(await confirmRef?.value?.confirm({
      title: '驳回申请',
      content: `确认驳回课题“${props.topic.name}”的审核？`,
      confirmText: '确认',
    }))
  ) {
    return;
  }
  await reject(props.topic.id);
  emit('reload');
};

const revokeHandle = async () => {
  if (
    !(await confirmRef.value?.confirm({
      title: '撤销立项',
      content: `确认撤销课题“${props.topic.name}”的立项？`,
      confirmText: '确认',
    }))
  ) {
    return;
  }
  await revoke(props.topic.id);
  emit('reload');
};

const evaluateHandle = async (params: ConfirmParams) => {
  const { confirm, data } = (await evaluateModalRef.value?.confirm(params)) || {};
  if (!confirm) {
    return;
  }
  const api = params.stage === 3 ? termEvaluate : params.stage === 4 ? authenticateEvaluate : noop;
  await api(props.topic.id, data?.score);
  emit('reload');
};

const afterUpload = async (event: any[], source: any) => {
  const file = event?.[0];
  if (file) {
    // 新增
    await addMaterialsFile(props.stageInfo?.id, {
      materialFileId: file.fileId,
      templateFileId: source.templateFile.fileId,
    });
    emit('reload');
  } else {
    // 删除
    if (source.materialFile) {
      await deleteMaterialsFile(props.stageInfo?.id, {
        templateFileId: source.materialFile.templateFileId,
        materialFileId: source.materialFile.fileId,
      });
      emit('reload');
    }
  }
};
</script>
<style lang="scss" scoped>
.stage-card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 24rpx 32rpx;
  margin-top: 24rpx;
  &.is-first {
    margin-top: 0;
  }
  .stage-title {
    display: flex;
    align-items: center;

    .stage-icon {
      width: 36rpx;
      height: 36rpx;
      background-color: #0000000f;
      border-radius: 50%;
      font-size: 24rpx;
      font-weight: normal;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8rpx;
      color: #00000073;
    }
    .stage-name {
      font-size: 32rpx;
      font-weight: bold;
      line-height: 44rpx;
      margin-right: 8rpx;
    }
    &.current {
      .stage-icon {
        color: #fff;
        background-color: #1677ff;
      }
    }
    &.over {
      .stage-icon {
        color: #1677ff;
        background-color: #e6f4ff;
      }
    }
  }
  .stage-deadline {
    font-size: 26rpx;
    line-height: 36rpx;
    color: #00000073;
    margin-top: 8rpx;
  }
  .status-tag {
    margin-left: 8rpx;
  }
  .file-title {
    margin-top: 24rpx;
    display: flex;
    justify-content: space-between;
    .file-name {
      font-size: 30rpx;
      line-height: 40rpx;
      color: #000000a6;
      flex: auto;
      width: 1rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &-tip {
        font-size: 26rpx;
        line-height: 36rpx;
        color: #ff4d4f;
        flex: none;
        margin-left: 8rpx;
      }
    }
  }
  .file-uploader {
    margin-top: 24rpx;
  }
  .tip-text {
    font-size: 26rpx;
    line-height: 36rpx;
    color: #00000073;
    margin-top: 8rpx;
  }
  .buttons {
    display: flex;
    align-items: center;
    justify-content: stretch;
    border-top: 1rpx solid #0000000f;
    margin: 32rpx -32rpx -24rpx -32rpx;
    .link {
      flex: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      font-weight: bold;
      line-height: 44rpx;
      text-align: center;
      color: #1677ff;
      padding: 30rpx;
    }
  }
}
</style>
