<template>
  <page class="h100" custom-overflow="hidden">
    <view class="h100 flex-column-plain">
      <view class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="plr-l ptb-b">
            <view class="bg-white radius-default plr-l ptb-b">
              <view class="flex-between">
                <view class="card-title">调课内容</view>
                <view class="change-button flex-center" @click="handleAdjust">去调整</view>
              </view>
              <view class="mt-b flex-center">
                <view class="origin-icon no-shrink">原</view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-text text-ellipse">
                    第{{ origin.sortNo }}节-{{ origin.subjectName }}
                  </view>
                  <view class="time-text text-ellipse">{{ origin.teacherDesc }}</view>
                </view>
                <view class="ml-b text-right no-shrink">
                  <view class="class-text">{{ origin.clazzName }}</view>
                  <view class="time-text">
                    {{ origin.clazzDate ? dayjs(origin.clazzDate).format('YYYY-MM-DD') : '/' }}
                  </view>
                </view>
              </view>
              <view class="mt-b flex-center">
                <view class="target-icon no-shrink">调</view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-text text-ellipse">
                    第{{ target.sortNo }}节-{{ target.subjectName }}
                  </view>
                  <view class="time-text text-ellipse">{{ target.teacherDesc }}</view>
                </view>
                <view class="ml-b text-right no-shrink">
                  <view class="class-text">{{ target.clazzName }}</view>
                  <view class="time-text">
                    {{ target.clazzDate ? dayjs(target.clazzDate).format('YYYY-MM-DD') : '/' }}
                  </view>
                </view>
              </view>
            </view>
            <view class="bg-white radius-default plr-l ptb-b mt-b">
              <view class="card-title">申请事由</view>
              <view class="textarea-wrap">
                <textarea
                  v-model="remark"
                  class="textarea-dom"
                  placeholder="请输入申请事由"
                  :maxlength="200"
                />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="bg-white no-shrink ptb-b plr-l bottom-shadow">
        <view class="flex-center">
          <view class="button-cancel flex-center" @click="handleCancel">取消</view>
          <view class="button-agree flex-center" @click="handleSubmit">提交</view>
        </view>
        <view class="bg-white no-shrink safe-area-inset-bottom"></view>
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { applyAdjust } from '../services/curriculum-adjust';

const remark = ref('');
const origin = ref<any>({});
const target = ref<any>({});
const successTipTimeoutRef = ref();

function handleAdjust() {
  // 回到步骤一页面 缓存数据
  uni.navigateBack({
    delta: 3,
  });
}
function handleCancel() {
  // 回到入口页面
  uni.navigateBack({
    delta: 4,
  });
}
async function handleSubmit() {
  // 回到入口页面
  if (!target.value.id || !origin.value.id) {
    return;
  }
  try {
    showLoading('提交中');
    await applyAdjust({
      newCourseDate: target.value.clazzDate,
      newCourseSubjectId: target.value.id,
      newSectionNo: target.value.sortNo,
      newTeacherId: (target.value.teacherIdList || [])[0] || '',
      reason: (remark.value || '').trim().substring(0, 200),
      sourceCourseDate: origin.value.clazzDate,
      sourceCourseSubjectId: origin.value.id,
      sourceSectionNo: origin.value.sortNo,
      sourceTeacherId: (origin.value.teacherIdList || [])[0] || '',
    });
    hideLoading();
    showInfo('提交成功', true, 2000);
    successTipTimeoutRef.value = setTimeout(() => {
      successTipTimeoutRef.value = null;
      uni.navigateBack({
        delta: 4,
      });
    }, 2200);
    uni.$emit('ADJUST_APPLY_SUCCESS');
    uni.$emit('UPDATE_MINE_ADJUST_LIST');
  } catch (error) {
    console.log(error);
    hideLoading();
  }
}

onMounted(() => {
  const instance: any = getCurrentInstance()?.proxy;
  if (instance) {
    const eventChannel = instance.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data: any) {
      origin.value = data.sourceCourse;
      target.value = data.newCourse;
      console.log('acceptDataFromOpenerPage', data);
    });
  }
});

onBeforeUnmount(() => {
  if (successTipTimeoutRef.value) {
    clearTimeout(successTipTimeoutRef.value);
    successTipTimeoutRef.value = null;
  }
});
</script>

<style lang="scss" scoped>
.card-title {
  font-weight: 500;
  font-size: 32rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.change-button {
  border: 1px solid rgba(22, 119, 255, 1);
  border-radius: 16rpx;
  height: 64rpx;
  line-height: 40rpx;
  width: 110rpx;
  color: rgba(22, 119, 255, 1);
  font-size: 26rpx;
  font-weight: 500;
}

.origin-icon,
.target-icon {
  height: 72rpx;
  width: 72rpx;
  line-height: 72rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 50%;
  margin-right: 24rpx;
}
.origin-icon {
  color: rgba(0, 0, 0, 0.65);
  background-color: rgba(0, 0, 0, 0.06);
}
.target-icon {
  color: rgba(250, 173, 20, 1);
  background-color: rgba(255, 251, 230, 1);
}
.course-text {
  line-height: 40rpx;
  font-size: 30rpx;
  color: rgba(0, 0, 0, 0.88);
}
.class-text {
  line-height: 36rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.65);
}
.time-text {
  line-height: 36rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.45);
}
.button-cancel {
  border-radius: 16rpx;
  height: 80rpx;
  color: rgba(22, 119, 255, 1);
  text-align: center;
  line-height: 40rpx;
  font-weight: 500;
  font-size: 30rpx;
  border: 1px solid rgba(22, 119, 255, 1);
  flex: 1;
}
.button-agree {
  margin-left: 24rpx;
  border-radius: 16rpx;
  height: 80rpx;
  color: #ffffff;
  text-align: center;
  line-height: 40rpx;
  font-weight: 500;
  font-size: 30rpx;
  border: 1px solid rgba(22, 119, 255, 1);
  background-color: rgba(22, 119, 255, 1);
  flex: 1;
}
.bottom-shadow {
  z-index: 2;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.08);
}
.textarea-wrap {
  margin-top: 24rpx;
  .textarea-dom {
    color: $ui-color-base;
    font-size: $ui-font-size-content;
    height: 424rpx;
    line-height: 40rpx;
    padding-top: 24rpx;
    width: 100%;
  }
}
</style>
