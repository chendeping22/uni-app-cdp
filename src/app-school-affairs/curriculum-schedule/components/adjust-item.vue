<template>
  <view class="plr-l">
    <view class="bg-white radius-default plr-l ptb-b" @click="handleDetail">
      <view class="h-48 flex-between">
        <view class="apply-user flex-stretch text-ellipse">
          {{ data.applyUserName }}的{{ data.type === 1 ? '调' : '代' }}课申请
        </view>
        <template v-if="(data.failureType || 0) > 0">
          <view class="status-tag flex-center bg-cancel">已失效</view>
        </template>
        <template v-else>
          <view v-if="data.status === 0" class="status-tag flex-center bg-primary">待处理</view>
          <view v-if="data.status === 1" class="status-tag flex-center bg-success">已同意</view>
          <view v-if="data.status === 2" class="status-tag flex-center bg-error">已拒绝</view>
          <view v-if="data.status === 3" class="status-tag flex-center bg-cancel">已撤销</view>
        </template>
      </view>
      <template v-if="data.type === 1">
        <view class="mt-b flex-center">
          <view class="origin-icon no-shrink">原</view>
          <view class="flex-stretch scroll-hidden">
            <view class="course-text text-ellipse">
              <text>第{{ data.sourceSectionNo }}节</text>
              <!-- 非本班级老师调课，只换老师，不换课程 -->
              <text v-if="data.sourceClazzId === data.newClazzId">
                -{{ data.sourceSubjectName }}
              </text>
            </view>
            <view class="time-text text-ellipse">{{ data.sourceTeacherName }}</view>
          </view>
          <view class="ml-b text-right no-shrink">
            <view class="class-text">{{ data.sourceClazzName }}</view>
            <view class="time-text">
              {{ data.sourceClazzDate ? dayjs(data.sourceClazzDate).format('YYYY-MM-DD') : '/' }}
            </view>
          </view>
        </view>
        <view class="mt-b flex-center">
          <view class="target-icon no-shrink">调</view>
          <view class="flex-stretch scroll-hidden">
            <view class="course-text text-ellipse">
              <text>第{{ data.newSectionNo }}节</text>
              <!-- 非本班级老师调课，只换老师，不换课程 -->
              <text v-if="data.sourceClazzId === data.newClazzId">
                -{{ data.newSubjectName }}
              </text>
            </view>
            <view class="time-text text-ellipse">{{ data.newTeacherName }}</view>
          </view>
          <view class="ml-b text-right no-shrink">
            <view class="class-text">{{ data.newClazzName }}</view>
            <view class="time-text">
              {{ data.newClazzDate ? dayjs(data.newClazzDate).format('YYYY-MM-DD') : '/' }}
            </view>
          </view>
        </view>
      </template>
      <template v-if="data.type === 2">
        <view class="mt-b flex-plain flex-top">
          <view class="alternative-icon no-shrink">代</view>
          <view class="flex-stretch scroll-hidden">
            <view class="flex-plain flex-top">
              <view class="apply-user no-shrink mr-b">代课老师</view>
              <view class="course-text flex-stretch text-ellipse">{{ data.receiveUserName }}</view>
            </view>
            <view class="flex-plain flex-top mt-s">
              <view class="apply-user no-shrink mr-b">代课节数</view>
              <view>
                <view class="course-text">{{ data.agentInfoList.length }}节</view>
                <view class="class-text">
                  {{ data.agentStartDate }} -
                  {{ data.agentEndDate }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
      <view class="mt-b reason-wrapper">
        <view class="reason-label no-shrink">申请事由</view>
        <view class="reason-text text-ellipse">{{ data.reason || '-' }}</view>
      </view>
      <view class="mt-b flex-center scroll-hidden">
        <image
          class="icon-36 radius-round mr-b no-shrink"
          :src="data.createUserHeadImgUrl || avatar"
        />
        <view class="create-text text-ellipse">
          {{ data.createUserName }}({{ data.type === 1 ? '调' : '代' }})
        </view>
        <view class="time-text no-shrink">
          {{ data.applyTime ? dayjs(data.applyTime).format('YYYY-MM-DD HH:mm') : '/' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import avatar from '/static/avatar.png';

const props = defineProps<{
  data: any;
}>();

function handleDetail() {
  if (props.data && props.data.id) {
    if (props.data.type === 1) {
      uni.navigateTo({
        url: '/app-school-affairs/curriculum-adjust/detail?id=' + props.data.id,
      });
    } else {
      uni.navigateTo({
        url: '/app-school-affairs/curriculum-supply/detail?id=' + props.data.id,
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.apply-user {
  font-size: 30rpx;
  line-height: 40rpx;
  color: rgba(0, 0, 0, 0.65);
}
.status-tag {
  border-radius: 4px;
  height: 48rpx;
  width: 110rpx;
  margin-left: 32rpx;
  font-size: 26rpx;
  color: #ffffff;
  flex-shrink: 0;
}
.bg-cancel {
  background: #d9d9d9;
  color: rgba(0, 0, 0, 0.88);
}
.origin-icon,
.target-icon,
.alternative-icon {
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
.alternative-icon {
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
.time-text {
  line-height: 36rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.45);
}
.reason-wrapper {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  display: flex;
  font-size: 24rpx;
  line-height: 32rpx;
  align-items: flex-start;
  overflow: hidden;
}
.reason-label {
  color: rgba(0, 0, 0, 0.45);
}
.reason-text {
  flex: 1;
  margin-left: 8rpx;
  color: rgba(0, 0, 0, 0.65);
}
.create-text {
  line-height: 36rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.88);
  flex: 1;
  margin-right: 24rpx;
}
</style>
