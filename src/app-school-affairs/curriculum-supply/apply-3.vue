<template>
  <page class="h100" custom-overflow="hidden">
    <view class="h100 flex-column-plain">
      <view class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="plr-l ptb-b">
            <view class="bg-white radius-default plr-l ptb-b">
              <view class="flex-between">
                <view class="card-title">代课内容</view>
                <view class="change-button flex-center" @click="handleAdjust">去调整</view>
              </view>
              <view class="supply-wrapper mt-b">
                <view class="detail-item">
                  <view class="detail-label">代课老师</view>
                  <view class="detail-text">
                    {{ newTeacher.username || '' }}
                  </view>
                </view>
                <template v-for="(item, index) in courses" :key="item.id">
                  <u-gap height="24" />
                  <view class="flex-center">
                    <view class="alternative-index no-shrink mr-b">{{ index + 1 }}</view>
                    <view class="flex-stretch scroll-hidden">
                      <view class="course-text">
                        第{{ item.sortNo }}节-{{ item.subjectName }}
                      </view>
                      <view class="mt-xxs flex-between scroll-hidden">
                        <view class="class-text">
                          {{ item.clazzDate }}({{ weekText[item.dayOfWeek] }})
                        </view>
                        <view class="class-text class2-text text-ellipse">
                          {{ item.clazzName }}
                        </view>
                      </view>
                    </view>
                  </view>
                </template>
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
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { applySupply } from '../services/curriculum-adjust';

const weekText = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const remark = ref('');
const courses = ref<any[]>([]);
const newTeacher = ref<any>({});
const successTipTimeoutRef = ref();

function handleAdjust() {
  // 回到步骤一页面 缓存数据
  uni.navigateBack({
    delta: 2,
  });
}
function handleCancel() {
  // 回到入口页面
  uni.navigateBack({
    delta: 3,
  });
}
async function handleSubmit() {
  // 回到入口页面
  if (!newTeacher.value.userId || !courses.value.length) {
    return;
  }
  try {
    showLoading('提交中');
    await applySupply({
      sourceTeacherId: (courses.value[0].teacherIdList || [])[0] || '',
      agentTeacherId: newTeacher.value.userId,
      reason: (remark.value || '').trim().substring(0, 200),
      agentInfoList: courses.value.map((i: any) => {
        return {
          sourceCourseDate: i.clazzDate,
          sourceCourseSubjectId: i.id,
          sourceSectionNo: i.sortNo,
        };
      }),
    });
    hideLoading();
    showInfo('提交成功', true, 2000);
    successTipTimeoutRef.value = setTimeout(() => {
      successTipTimeoutRef.value = null;
      uni.navigateBack({
        delta: 3,
      });
    }, 2200);
    uni.$emit('ADJUST_APPLY_SUCCESS');
    uni.$emit('UPDATE_MINE_ADJUST_LIST');
  } catch (error) {
    console.log(error);
    hideLoading();
  }
}

function getCourseList(list: any[]) {
  const res: any[] = [];
  list.forEach(i => {
    i.courseCells.forEach(j => {
      res.push(j);
    });
  });

  return res;
}

onMounted(() => {
  const instance: any = getCurrentInstance()?.proxy;
  if (instance) {
    const eventChannel = instance.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data: any) {
      courses.value = getCourseList(data.sourceCourse);
      newTeacher.value = data.newTeacher;
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
.supply-wrapper {
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 16rpx;
  padding: 32rpx;
}
.alternative-index {
  height: 72rpx;
  width: 72rpx;
  line-height: 72rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 50%;
  margin-right: 24rpx;
  color: rgba(82, 196, 26, 1);
  background-color: rgba(246, 255, 237, 1);
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
.class2-text {
  flex: 1;
  text-align: right;
  color: rgba(0, 0, 0, 0.45);
  margin-left: 32rpx;
}
.detail-item {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  .detail-label {
    width: 144rpx;
    font-size: 30rpx;
    line-height: 40rpx;
    color: rgba(0, 0, 0, 0.65);
  }
  .detail-text {
    flex: 1;
    font-size: 30rpx;
    line-height: 40rpx;
    color: rgba(0, 0, 0, 0.88);
  }
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
