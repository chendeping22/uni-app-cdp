<template>
  <u-popup
    v-model="showDetail"
    mode="bottom"
    closeable
    :close-icon="'arrow-left'"
    close-icon-pos="top-left"
    close-icon-color="#000000"
    safe-area-inset-bottom
    class="curriculum-popup-content"
    @close="handleClose"
  >
    <view class="h-96 flex flex-center detail-title border-bottom border-line-default">
      课堂详情
    </view>
    <view class="p-all-l">
      <view class="detail-top mb-b">
        <view class="flex-stretch scroll-hidden">
          <view class="text-ellipse class-name">{{ detail?.clazzName || '' }}</view>
          <view class="week-text">
            {{ detail?.week || '' }} 第{{ detail?.courseIndex || '' }}节
          </view>
        </view>
        <view
          v-if="detail?.courseType === 1"
          class="ml-s color-white radius-small flex-center h-48 w-60"
          style="background-color: #faad14"
        >
          调
        </view>
        <view
          v-if="detail?.courseType === 2"
          class="ml-s color-white radius-small flex flex-center h-48 w-60"
          style="background-color: #52c41a"
        >
          代
        </view>
      </view>
      <view class="detail-item">
        <view class="detail-label">时间</view>
        <view class="detail-text">{{ detail?.startTime || '' }}-{{ detail?.endTime || '' }}</view>
      </view>
      <view class="detail-item mt-s">
        <view class="detail-label">地点</view>
        <view class="detail-text">
          {{ detail?.spaceDesc || '' }}
        </view>
      </view>
      <view class="detail-item mt-s">
        <view class="detail-label">课程</view>
        <view class="detail-text">
          {{ detail?.subjectName || '' }}
        </view>
      </view>
      <view class="detail-item mt-s">
        <view class="detail-label">老师</view>
        <view class="detail-text">
          {{ detail?.teacherDesc || '' }}
        </view>
      </view>
      <view v-if="detail?.cellAdjust" class="border-top border-line-default mt-b pt-b">
        <view
          v-if="
            detail?.cellAdjust?.sourceSubjectName &&
            detail?.cellAdjust?.sourceSubjectName !== detail?.subjectName
          "
          class="detail-item mb-s"
        >
          <view class="detail-label">原课程</view>
          <view class="detail-text">
            {{ detail?.cellAdjust?.sourceSubjectName || '' }}
          </view>
        </view>
        <view class="detail-item">
          <view class="detail-label">原老师</view>
          <view class="detail-text">
            {{ detail?.cellAdjust?.sourceTeacherName || '' }}
          </view>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  showTargetType: string;
  detail: any;
}>();
const emits = defineEmits(['closeCell']);
const showDetail = ref(!!props.show);

watch(
  () => props.show,
  v => {
    showDetail.value = v;
  },
);
function handleClose() {
  showDetail.value = false;
  emits('closeCell');
}
</script>
<style lang="scss">
.curriculum-popup-content {
  :deep(.u-drawer-content) {
    border-radius: 16rpx 16rpx 0 0 !important;
    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>
.detail-title {
  font-size: 34rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}
.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.class-name {
  font-size: 32rpx;
  font-weight: 500;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.week-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(0, 0, 0, 0.45);
}
.detail-item {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  .detail-label {
    width: 144rpx;
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.65);
  }
  .detail-text {
    flex: 1;
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.88);
  }
}
</style>
