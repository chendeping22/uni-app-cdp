<template>
  <page custom-overflow="visible">
    <view class="custom-page">
      <view class="custom-page-content">
        <view class="custom-page-card">
          <view class="custom-page-item custom-page-item-content">
            <view class="custom-page-item-header">评价内容<view class="item-note">*</view></view>
            <u-input
              v-model="formState.content"
              type="textarea"
              placeholder="请输入评价内容"
              :maxlength="100"
              clearable
              :trim="false"
              :border="false"
              :auto-height="false"
              :custom-style="{ fontSize: '32rpx', height: '132rpx', overflow: 'auto' }"
              @blur="handleContentBlur"
              @input="changeContent"
            />
            <view class="content-count">{{ formState.content?.length ?? 0 }}/100</view>
          </view>
          <view class="custom-page-item">
            <view class="custom-page-item-header">评分<view class="item-note">*</view></view>
            <view class="custom-page-item-score">
              <view
                v-for="item in scoreLabel"
                class="score-item"
                :class="
                  item.value === state.scoreType ? 'score-item-selected' : 'score-item-normal'
                "
                @click="handleChangeType(item.value)"
                >{{ item.label }}</view
              >
              <u-input
                v-model="formState.score"
                placeholder="请输入评分"
                :trim="true"
                :border="true"
                type="digit"
                clearable
                @blur="handleScoreBlur"
              />
            </view>
          </view>
        </view>
        <view class="custom-page-card">
          <form-item
            title="关联学生"
            className="form-item-auto form-item-student"
            @click="onSelectStudent"
          >
            <template #content>
              <view v-if="_associatedStudentName" class="student-value">{{
                _associatedStudentName
              }}</view>
              <view v-else class="student-value" style="color: rgba(0, 0, 0, 0.45)">请选择</view>
            </template>
            <template #right>
              <u-icon
                class="form-item-right"
                name="arrow-right"
                size="36rpx"
                color="#00000073"
              ></u-icon
            ></template>
          </form-item>
          <upload-media hide-line v-model:value="formState.fileInfo"></upload-media>
          <view class="form-item-line" v-if="formState.fileInfo.length"></view>
          <form-item v-if="formState.fileInfo.length" class-name="hide-line overflow-visible">
            <template #title>
              <view class="u-flex u-relative" @click="state.showPrivacy = true">
                <text>隐私设置</text>
                <u-icon
                  style="margin-top: 1px; margin-left: 4px"
                  name="info-circle"
                  size="36rpx"
                  color="#00000073"
                ></u-icon>
                <view
                  v-if="state.showPrivacy"
                  class="privacy-settings-tip-mask"
                  @click.stop="state.showPrivacy = false"
                ></view>
                <view v-if="state.showPrivacy" class="privacy-settings-tip footnote-regular"
                  >在隐私设置开启的状态下，仅有德育主任、班主任及该评价人可以查阅照片和视频</view
                >
              </view>
            </template>
            <template #content>
              <view class="u-flex u-row-right">
                <u-switch
                  v-model="formState.privacySettings"
                  :active-value="1"
                  :inactive-value="0"
                ></u-switch>
              </view>
            </template>
          </form-item>
          <view class="form-item-line"></view>
          <form-item className="form-item-auto edit-comment-textarea hide-line" title="备注">
            <template #content>
              <u-input
                v-model="formState.remark"
                type="textarea"
                input-align="right"
                placeholder="请输入"
                maxlength="200"
                clearable
                :trim="false"
                :border="false"
                :auto-height="false"
                :custom-style="{ fontSize: '32rpx', height: '160rpx' }"
                @blur="handleRemarkBlur"
                @input="changeRemark"
              />
              <view class="content-count">{{ formState.remark?.length || 0 }}/200</view>
            </template>
          </form-item>
        </view>
        <view class="custom-page-card">
          <form-item
            class-name="hide-line"
            title="评价日期"
            :content="formState.evaluationDate"
            @click="state.showTime = true"
          >
            <template #right>
              <u-icon
                class="form-item-right"
                name="arrow-right"
                size="36rpx"
                color="#00000073"
              ></u-icon
            ></template>
          </form-item>
        </view>
      </view>
      <view class="custom-page-bottom">
        <u-button type="primary" @click="handleSubmit">确定</u-button>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
    </view>
  </page>
  <u-picker
    v-model="state.showTime"
    mode="time"
    :default-time="formState.evaluationDate"
    :start-year="state.startYear"
    :end-year="state.endYear"
    :params="{
      year: true,
      month: true,
      day: true,
      hour: false,
      minute: false,
      second: false,
      timestamp: true,
    }"
    @confirm="handleDateConfirm"
  ></u-picker>
</template>

<script setup lang="ts">
import FormItem from '@/app-class-evaluation/components/form-item.vue';
import UploadMedia from '@/app-class-evaluation/components/upload-media.vue';
import { addEvaluation, getSchemeDateInfo } from '@/app-class-evaluation/services/evaluation';
import { useStudentSelectorStore } from '@/app-class-evaluation/store/student-selector';
import { getPageParams, showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { isNil, omit } from 'lodash-es';
import { computed, reactive, ref } from 'vue';
import { selectStudent } from '../student-selector/show-selector';

const store = useStudentSelectorStore();

const scoreLabel = [
  { label: '减分', value: 0 },
  { label: '加分', value: 1 },
];

const scoreRange = {
  min: 0.5,
  max: 20,
};

const formState = ref<{
  associatedStudent: any[];
  privacySettings: number;
  fileInfo: any[];
  content?: string;
  evaluationDate?: string;
  score?: number | string;
  remark?: string;
}>({
  associatedStudent: [],
  privacySettings: 0,
  fileInfo: [],
  content: '',
  evaluationDate: dayjs().format('YYYY-MM-DD'),
});

const state = reactive<{
  isSelectedAllStudent: boolean;
  scoreType: number;
  showTime: boolean;
  pageParams?: Record<string, any>;
  startRange: string;
  endRange: string;
  startYear: string;
  endYear: string;
  showPrivacy: boolean;
}>({
  isSelectedAllStudent: false,
  scoreType: 0,
  showTime: false,
  pageParams: {},
  showPrivacy: false,
  startRange: dayjs().format('YYYY-MM-DD'),
  endRange: dayjs().format('YYYY-MM-DD'),
  startYear: dayjs().format('YYYY'),
  endYear: dayjs().format('YYYY'),
});

const _associatedStudentName = computed(() => {
  if (!formState.value.associatedStudent?.length) {
    return '';
  }

  const len = formState.value.associatedStudent.length;

  if (len < 3) {
    return formState.value.associatedStudent.map(i => i.studentName).join('、');
  }

  if (state.isSelectedAllStudent) {
    return '所有学生';
  }

  if (store.selectedClassIds.length === 1) {
    return `${formState.value.associatedStudent
      .slice(0, 2)
      .map(i => i.studentName)
      .join('、')}共${len}人`;
  }

  return `已关联${len}人`;
});

const changeContent = (val?: string) => {
  formState.value.content = val && val?.length > 100 ? val?.slice(0, 100) : val;
};

const changeRemark = (val?: string) => {
  formState.value.remark = val && val?.length > 200 ? val?.slice(0, 200) : val;
};

const handleContentBlur = (val?: string) => {
  formState.value.content = val?.trim();
};

const handleRemarkBlur = (val?: string) => {
  formState.value.remark = val?.trim();
};

const onSelectStudent = () => {
  selectStudent({
    value: formState.value.associatedStudent,
    callback: data => {
      state.isSelectedAllStudent = data.isSelectedAll;
      formState.value.associatedStudent = data.value;
    },
  });
};

const fetchSchemeDateInfo = async () => {
  const res: any = await getSchemeDateInfo({ schemeId: state.pageParams?.schemeId || '' });
  if (res.startDate) {
    state.startRange = res.startDate;
    state.startYear = res.startDate?.split('-')?.[0];
  }
};

const handleDateConfirm = (val: any) => {
  const selectedDay = dayjs(val.timestamp * 1000).format('YYYY-MM-DD');
  const start = dayjs(selectedDay).isBefore(state.startRange);
  const end = dayjs(selectedDay).isAfter(state.endRange);
  if (start) {
    showInfo('不可超出当前方案的日期');
    return;
  }
  if (end) {
    showInfo('不可超出当前日期');
    return;
  }
  formState.value.evaluationDate = selectedDay;
};

const handleScoreBlur = (val: any) => {
  if (val && (+val < scoreRange.min || +val > scoreRange.max)) {
    showInfo(`请输入${scoreRange.min}~${scoreRange.max}的分数`);
    return;
  }
  if (val.indexOf('.') > -1) {
    formState.value.score = (+val).toFixed(1);
    return;
  }
  formState.value.score = +val;
};

const handleSubmit = async () => {
  if (!formState.value.content) {
    showInfo('请输入评价内容');
    return;
  }
  if (isNil(formState.value.score)) {
    showInfo('请输入评分');
    return;
  }
  if (+formState.value.score < scoreRange.min || +formState.value.score > scoreRange.max) {
    showInfo(`请输入${scoreRange.min}~${scoreRange.max}的分数`);
    return;
  }

  const params = {
    clazzIdList: store.selectedClassIds,
    evaluationSchemeId: state.pageParams?.schemeId,
    initialSchemeId: state.pageParams?.initialSchemeId,
    recordDetailDTOS: [
      {
        ...omit(formState.value, ['associatedStudent', 'score']),
        privacySettings: formState.value.privacySettings ? 1 : 0,
        associatedStudentIds: formState.value.associatedStudent?.map(v => v.studentId),
        score: state.scoreType ? formState.value.score : +formState.value.score * -1,
      },
    ],
  };
  try {
    const res: any = await addEvaluation(params);
    showInfo('点评成功');

    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  } catch (e: any) {
    showInfo(e?.desc || '点评成功');
  }
};

const handleChangeType = (val: number) => {
  state.scoreType = val;
};

onLoad(() => {
  state.pageParams = getPageParams();
  fetchSchemeDateInfo();
});
</script>

<style lang="scss" scoped>
:deep(.custom-page-card .form-item) {
  padding-right: 0;
}
.custom-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  &-bottom {
    position: sticky;
    bottom: 0;
    padding: 24rpx 32rpx;
    z-index: 2;
    box-shadow: $shadow-light-up-md;
    background: $color-background-base;
    width: 100%;
  }
  &-content {
    padding: 24rpx 32rpx;
    flex: 1;
  }
  &-card {
    background-color: $color-background-base;
    box-shadow: 0 1px 2px 0 $control-item-bg-hover;
    border-radius: 16rpx;
    padding: 0 32rpx;
    margin-bottom: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-item {
    border-bottom: 1px solid $color-split;
    padding-bottom: 24rpx;
    margin-bottom: 32rpx;
    &-content {
      padding-top: 24rpx;
    }
    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    &-header {
      display: flex;
      color: $color-text;
      margin-bottom: 16rpx;
    }
    &-score {
      display: flex;
      align-items: center;
    }
  }
  .item-note {
    color: $color-error;
    padding: 0 8rpx;
  }
  .content-count {
    display: flex;
    justify-content: flex-end;
    color: $color-text-description;
  }
  .score-item {
    width: 166rpx;
    height: 80rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    &-normal {
      color: $color-text-label;
      background: $color-bg-container-disabled;
    }
    &-selected {
      color: $color-primary;
      background: $primary-bg;
    }
  }
}
.form-item-line {
  height: 1rpx;
  width: 100%;
  background: $color-split;
}
.privacy-settings-tip {
  position: absolute;
  left: 0;
  bottom: 68rpx;
  width: 550rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: $radius-base;
  box-shadow: $shadow-light-down-lg;
  z-index: 10;
  &::after {
    content: '';
    width: 20rpx;
    height: 20rpx;
    background-color: #fff;
    position: absolute;
    left: 68rpx;
    bottom: -8rpx;
    transform: rotate(45deg);
  }
  &-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: transform 0.3s;
    z-index: 9;
  }
}

:deep(.form-item-auto.form-item-student) {
  padding-top: 24rpx;
  align-items: center;
}

:deep(.form-item-auto.form-item-student .form-item-title) {
  align-self: baseline;
}

.student-value {
  white-space: normal;
}
</style>
