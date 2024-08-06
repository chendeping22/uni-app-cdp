<template>
  <view class="page-wrapper">
    <view v-if="detail && isCancel === 0" class="score-card">
      <view class="score-name">
        {{ detail?.name || '' }}
      </view>
      <view class="info-item mt-s">
        <view class="info-label">成绩类型</view>
        <view class="info-value">
          {{ detail?.scoreTypeName || '' }}
        </view>
      </view>
      <view class="info-item mt-xxs">
        <view class="info-label">发布时间</view>
        <view class="info-value">
          {{ detail?.publishTime ? dayjs(detail.publishTime).format('YYYY-MM-DD HH:mm') : '' }}
        </view>
      </view>
    </view>
    <view v-if="data && isCancel === 0" class="score-card" style="padding-top: 0">
      <view class="score-name table-name">
        <text>{{ data.clazzName }}</text>
        <text class="ml-s">{{ data.studentName }}</text>
      </view>
      <view class="subject-list">
        <view
          v-for="(item, index) in data.subjectScores"
          :key="item.subjectName + index"
          class="subject-item"
        >
          <view class="subject-name-column">
            {{ item.subjectName }}
          </view>
          <view class="subject-value-column">
            {{ item.missFlag !== 1 && showType === 1 ? item.score || 0 : '' }}
            {{ item.missFlag !== 1 && showType === 2 ? item.scoreLevel || '' : '' }}
            {{ item.missFlag === 1 ? '缺考' : '' }}
          </view>
          <view v-if="showRankColumn" class="subject-value-column rank-column">
            <view v-if="showSubjectClazzRank" class="rank-value">
              班级名次：{{
                item.missFlag !== 1 && typeof item.clazzRank === 'number' ? item.clazzRank : '-'
              }}
            </view>
            <view v-if="showSubjectGradeRank" class="rank-value">
              年级名次：{{
                item.missFlag !== 1 && typeof item.gradeRank === 'number' ? item.gradeRank : '-'
              }}
            </view>
          </view>
        </view>
        <view v-if="showType === 1 && showTotal" class="subject-item">
          <view class="subject-name-column">{{ data.totalScore.subjectName || '总分' }}</view>
          <view class="subject-value-column">
            {{ data.totalScore?.missFlag !== 1 ? data.totalScore.score || 0 : '' }}
            {{ data.totalScore?.missFlag === 1 ? '缺考' : '' }}
          </view>
          <view v-if="showRankColumn" class="subject-value-column rank-column">
            <view v-if="showTotalClazzRank" class="rank-value">
              班级名次：{{
                data.totalScore?.missFlag !== 1 && typeof data.totalScore?.clazzRank === 'number'
                  ? data.totalScore?.clazzRank
                  : '-'
              }}
            </view>
            <view v-if="showTotalGradeRank" class="rank-value">
              年级名次：{{
                data.totalScore?.missFlag !== 1 && typeof data.totalScore?.gradeRank === 'number'
                  ? data.totalScore?.gradeRank
                  : '-'
              }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="isCancel === 0" class="safe-area-inset-bottom"></view>
    <view
      v-if="isCancel === 1"
      :style="{
        height: emptyHeight + 'px',
      }"
    >
      <u-empty-custom mode="data" class="color-base no-shrink" text="成绩暂未发布" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import useStudentId from '@/hooks/use-student-id';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { getScoreInfoById, getStudentPublishScore } from '../services/score-management';

defineProps<{
  scoreTaskId: string;
}>();

const studentId = useStudentId();
const scoreTaskId = ref('');
const detail = ref<any>(null);
const isCancel = ref(-1); // -1 还未初始化，0 正常发布， 1 取消发布
const data = ref<any>(null);
const showType = ref(1); // 1 按分数，2 按等级
const showSubjectClazzRank = ref(false);
const showSubjectGradeRank = ref(false);
const showTotal = ref(false);
const showTotalClazzRank = ref(false);
const showTotalGradeRank = ref(false);
const showRankColumn = ref(false);

const emptyHeight = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const safeAreaInsetBottom = systemInfo?.safeAreaInsets?.bottom || 0;
  return windowHeight - safeAreaInsetBottom;
});

function initConfig(config: any) {
  showType.value = config.type || 1;
  showSubjectClazzRank.value = false;
  showSubjectGradeRank.value = false;
  showTotal.value = false;
  showTotalClazzRank.value = false;
  showTotalGradeRank.value = false;
  showRankColumn.value = false;

  if (showType.value === 2) {
    return;
  }

  const subjectScoreType = config.subjectScoreType || '';
  const totalScoreType = config.totalScoreType || '';
  if (subjectScoreType.indexOf('2') > -1) {
    showSubjectClazzRank.value = true;
  }
  if (subjectScoreType.indexOf('3') > -1) {
    showSubjectGradeRank.value = true;
  }

  if (totalScoreType.indexOf('1') > -1) {
    showTotal.value = true;
    if (totalScoreType.indexOf('2') > -1) {
      showTotalClazzRank.value = true;
    }
    if (totalScoreType.indexOf('3') > -1) {
      showTotalGradeRank.value = true;
    }
  }

  showRankColumn.value =
    showSubjectClazzRank.value ||
    showSubjectGradeRank.value ||
    showTotalClazzRank.value ||
    showTotalGradeRank.value;
}

async function fetchDetail(scoreTaskId: string) {
  const res = await getScoreInfoById(scoreTaskId);
  detail.value = res || null;
}

async function fetchData(scoreTaskId: string, studentId: string) {
  const res: any = await getStudentPublishScore({
    scoreTaskId,
    studentId,
  });
  data.value = res || null;
  initConfig(res?.publishConfig || {});
}

async function initData() {
  if (scoreTaskId.value && studentId.value) {
    showLoading();
    try {
      await fetchDetail(scoreTaskId.value);
      isCancel.value = 0;
    } catch (error: any) {
      hideLoading();
      if (error.code === 691013) {
        isCancel.value = 1;
      } else {
        isCancel.value = 0;
        showInfo(error?.msg || error?.desc || '请求数据出错');
      }

      return;
    }
    try {
      if (!detail.value) {
        hideLoading();
        return;
      }
      await fetchData(scoreTaskId.value, studentId.value);
      isCancel.value = 0;
    } catch (error: any) {
      showInfo(error?.msg || error?.desc || '请求数据出错');
    } finally {
      hideLoading();
    }
  } else {
    showInfo('请求数据出错');
  }
}

onLoad(async (option: any) => {
  if (option.scoreTaskId) {
    scoreTaskId.value = option.scoreTaskId;
  }
  initData();
});
</script>
<style lang="scss" scoped>
.page-wrapper {
  padding: 24rpx 32rpx;
}
.score-card {
  margin-bottom: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  .score-name {
    font-size: 32rpx;
    font-weight: 500;
    line-height: 44rpx;
    color: rgba(0, 0, 0, 0.88);
    word-wrap: break-word;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    font-size: 30rpx;
    line-height: 40rpx;
  }
  .info-label {
    flex-shrink: 0;
    color: rgba(0, 0, 0, 0.65);
    margin-right: 24rpx;
  }
  .info-value {
    flex: 1;
    color: rgba(0, 0, 0, 0.88);
  }
}
.table-name {
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.subject-list {
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 16rpx;
  overflow: hidden;
  .subject-item {
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    &:last-child {
      border-bottom: none;
    }
  }
  .subject-name-column {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 192rpx;
    flex-shrink: 0;
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-all;
    padding: 16rpx 24rpx;
    font-size: 30rpx;
    line-height: 40rpx;
    background-color: #f5f5f5;
  }
  .subject-value-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(0, 0, 0, 0.15);
    padding: 16rpx 24rpx;
    font-size: 26rpx;
    line-height: 36rpx;
    color: rgba(0, 0, 0, 0.65);
  }
  .rank-column {
    flex: none;
    flex-shrink: 0;
    width: 236rpx;
    align-items: flex-start;
  }
  .rank-value {
    white-space: nowrap;
  }
}
</style>
