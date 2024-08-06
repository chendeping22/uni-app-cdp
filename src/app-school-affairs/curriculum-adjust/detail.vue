<template>
  <page class="h100" custom-overflow="hidden">
    <view v-if="!errorText" class="h100 flex-column-plain">
      <view v-if="detail" class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="plr-l ptb-b">
            <view class="bg-white radius-default plr-l ptb-b">
              <view class="flex-between">
                <view class="card-title">调课内容</view>
                <template v-if="(detail.failureType || 0) > 0">
                  <view class="status-t flex-center bg-cancel">已失效</view>
                </template>
                <template v-else>
                  <view v-if="detail.status === 0" class="status-t flex-center bg-primary">
                    待处理
                  </view>
                  <view v-if="detail.status === 1" class="status-t flex-center bg-success">
                    已同意
                  </view>
                  <view v-if="detail.status === 2" class="status-t flex-center bg-error">
                    已拒绝
                  </view>
                  <view v-if="detail.status === 3" class="status-t flex-center bg-cancel">
                    已撤销
                  </view>
                </template>
              </view>
              <view class="info-wrapper flex-center">
                <view class="info-label">原有课表</view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-text text-ellipse">
                    <text>第{{ detail.sourceSectionNo }}节</text>
                    <!-- 非本班级老师调课，只换老师，不换课程 -->
                    <text v-if="detail.sourceClazzId === detail.newClazzId">
                      -{{ detail.sourceSubjectName }}
                    </text>
                  </view>
                  <view class="time-text text-ellipse">{{ detail.sourceTeacherName }}</view>
                </view>
                <view class="ml-b text-right no-shrink">
                  <view class="class-text">{{ detail.sourceClazzName }}</view>
                  <view class="time-text">
                    {{
                      detail.sourceClazzDate
                        ? dayjs(detail.sourceClazzDate).format('YYYY-MM-DD')
                        : '/'
                    }}
                  </view>
                </view>
              </view>
              <view class="info-wrapper flex-center">
                <view class="info-label target">调整课表</view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-text text-ellipse">
                    <text>第{{ detail.newSectionNo }}节</text>
                    <!-- 非本班级老师调课，只换老师，不换课程 -->
                    <text v-if="detail.sourceClazzId === detail.newClazzId">
                      -{{ detail.newSubjectName }}
                    </text>
                  </view>
                  <view class="time-text text-ellipse">{{ detail.newTeacherName }}</view>
                </view>
                <view class="ml-b text-right no-shrink">
                  <view class="class-text">{{ detail.newClazzName }}</view>
                  <view class="time-text">
                    {{
                      detail.newClazzDate ? dayjs(detail.newClazzDate).format('YYYY-MM-DD') : '/'
                    }}
                  </view>
                </view>
              </view>
              <view class="detail-item mt-b">
                <view class="detail-label">申请人</view>
                <view class="detail-text">
                  {{ detail.applyUserName || '' }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">申请时间</view>
                <view class="detail-text">
                  {{ detail.applyTime ? dayjs(detail.applyTime).format('YYYY-MM-DD HH:mm') : '/' }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">申请事由</view>
                <view class="detail-text">
                  {{ detail.reason || '-' }}
                </view>
              </view>
            </view>
            <view v-if="detail.approveUserId" class="bg-white radius-default plr-l ptb-b mt-b">
              <view class="card-title">调课意见</view>
              <view class="detail-item mt-b">
                <view class="detail-label">处理人</view>
                <view class="detail-text">
                  {{ detail.approveUserName || '' }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">处理时间</view>
                <view class="detail-text">
                  {{
                    detail.approveTime ? dayjs(detail.approveTime).format('YYYY-MM-DD HH:mm') : '/'
                  }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">调课意见</view>
                <view class="detail-text">
                  {{ detail.approveRemark || '-' }}
                </view>
              </view>
            </view>
            <view
              v-if="
                detail.status === 0 &&
                (detail.failureType || 0) <= 0 &&
                !detail.approveUserId &&
                detail.receiveUserId === userInfo?.userId
              "
              class="bg-white radius-default plr-l ptb-b mt-b"
            >
              <view class="card-title">调课意见</view>
              <view class="textarea-wrap">
                <textarea
                  v-model="remark"
                  class="textarea-dom"
                  :placeholder="`请输入调课意见`"
                  :maxlength="200"
                />
              </view>
            </view>
            <view v-if="detail.revokeUser" class="bg-white radius-default plr-l ptb-b mt-b">
              <view class="card-title">撤销原因</view>
              <view class="detail-item mt-b">
                <view class="detail-label">撤销人</view>
                <view class="detail-text">
                  {{ detail.revokeUserName || '' }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">撤销时间</view>
                <view class="detail-text">
                  {{
                    detail.revokeTime ? dayjs(detail.revokeTime).format('YYYY-MM-DD HH:mm') : '/'
                  }}
                </view>
              </view>
              <view class="detail-item mt-s">
                <view class="detail-label">撤销原因</view>
                <view class="detail-text">
                  {{ detail.revokeReason || '-' }}
                </view>
              </view>
            </view>
            <view v-if="detail.failureDesc" class="bg-white radius-default plr-l ptb-b mt-b">
              <view class="card-title">失效原因</view>
              <view class="detail-item mt-b">
                <view class="detail-label">失效原因</view>
                <view class="detail-text">
                  {{ detail.failureDesc || '' }}
                </view>
              </view>
            </view>
            <view
              v-if="
                !(
                  detail &&
                  (detail.failureType || 0) <= 0 &&
                  detail.applyUserId === userInfo?.userId &&
                  (detail.status === 0 || detail.status === 1)
                ) &&
                !(
                  detail &&
                  (detail.failureType || 0) <= 0 &&
                  detail.receiveUserId === userInfo?.userId &&
                  detail.status === 0 &&
                  !detail.approveUserId
                )
              "
              class="no-shrink safe-area-inset-bottom"
            />
          </view>
        </scroll-view>
      </view>
      <view
        v-if="
          detail &&
          (detail.failureType || 0) <= 0 &&
          detail.applyUserId === userInfo?.userId &&
          (detail.status === 0 || detail.status === 1)
        "
        class="bg-white no-shrink ptb-b plr-l bottom-shadow"
      >
        <view class="button-cancel" @click="handleCancel">撤销申请</view>
        <view class="bg-white no-shrink safe-area-inset-bottom"></view>
      </view>
      <view
        v-if="
          detail &&
          (detail.failureType || 0) <= 0 &&
          detail.receiveUserId === userInfo?.userId &&
          detail.status === 0 &&
          !detail.approveUserId
        "
        class="bg-white no-shrink ptb-b plr-l bottom-shadow"
      >
        <view class="flex-center">
          <view class="button-reject" @click="handleReject">拒绝</view>
          <view class="button-agree" @click="handleAgree">同意</view>
        </view>
        <view class="bg-white no-shrink safe-area-inset-bottom"></view>
      </view>
    </view>
    <view v-else class="h100">
      <u-empty-custom mode="search" class="color-base no-shrink" :text="errorText" />
    </view>
  </page>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { getAdjustDetail, updateAdjust } from '../services/curriculum-adjust';

interface IPageParam {
  id: string;
}
const pageParam = ref({} as IPageParam);
const errorText = ref('');
const detail = ref<any>();
const remark = ref('');
const userInfo = loginStore().userInfo;

async function fetchData() {
  if (pageParam.value && pageParam.value.id) {
    try {
      const res = await getAdjustDetail(pageParam.value.id);
      detail.value = res;
    } catch (error: any) {
      console.log(error);
      errorText.value = error?.msg || error?.desc || error?.data?.message || '请求服务器失败';
    }
  } else {
    errorText.value = '请求参数异常';
  }
}

function handleUpdate() {
  fetchData();
}
onBeforeMount(() => {
  pageParam.value = getPageParams();
  fetchData();
  uni.$on('UPDATE_ADJUST_DETAIL', handleUpdate);
});

onBeforeUnmount(() => {
  uni.$off('UPDATE_ADJUST_DETAIL', handleUpdate);
});

async function handleReject() {
  try {
    await updateAdjust(pageParam.value.id, {
      remark: (remark.value || '').trim().substring(0, 200),
      status: 2,
    });
    uni.$emit('UPDATE_RECEIVE_ADJUST_LIST');
    uni.navigateBack();
  } catch (error) {
    console.log(error);
  }
}

async function handleAgree() {
  try {
    await updateAdjust(pageParam.value.id, {
      remark: (remark.value || '').trim().substring(0, 200),
      status: 1,
    });
    uni.$emit('UPDATE_RECEIVE_ADJUST_LIST');
    uni.navigateBack();
  } catch (error) {
    console.log(error);
  }
}
function handleCancel() {
  if (pageParam.value && pageParam.value.id) {
    uni.navigateTo({
      url: '/app-school-affairs/curriculum-adjust/cancel?id=' + pageParam.value.id,
    });
  }
}
</script>

<style lang="scss" scoped>
.card-title {
  font-weight: 500;
  font-size: 32rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.status-t {
  border-radius: 4px;
  height: 48rpx;
  width: 110rpx;
  font-size: 26rpx;
  color: #ffffff;
  flex-shrink: 0;
}
.bg-cancel {
  background: #d9d9d9;
  color: rgba(0, 0, 0, 0.88);
}
.info-wrapper {
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 16rpx;
  overflow: hidden;
  margin-top: 24rpx;
  position: relative;
  padding: 48rpx 32rpx 32rpx;
  .info-label {
    background-color: rgba(0, 0, 0, 0.04);
    width: 104rpx;
    height: 40rpx;
    line-height: 40rpx;
    text-align: center;
    color: rgba(0, 0, 0, 0.65);
    font-size: 22rpx;
    position: absolute;
    top: 0;
    left: 0;
    &.target {
      color: rgba(250, 173, 20, 1);
      background-color: rgba(255, 251, 230, 1);
    }
  }
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
  margin-top: 8rpx;
  color: rgba(0, 0, 0, 0.45);
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
    overflow: hidden;
    word-wrap: break-word;
    white-space: normal;
  }
}
.button-cancel {
  border-radius: 16rpx;
  height: 80rpx;
  color: #ffffff;
  text-align: center;
  line-height: 80rpx;
  font-weight: 500;
  font-size: 30rpx;
  background-color: rgba(22, 119, 255, 1);
}
.button-reject {
  border-radius: 16rpx;
  height: 80rpx;
  color: rgba(255, 77, 79, 1);
  text-align: center;
  line-height: 80rpx;
  font-weight: 500;
  font-size: 30rpx;
  border: 1px solid rgba(255, 77, 79, 1);
  flex: 1;
}
.button-agree {
  margin-left: 24rpx;
  border-radius: 16rpx;
  height: 80rpx;
  color: #ffffff;
  text-align: center;
  line-height: 80rpx;
  font-weight: 500;
  font-size: 30rpx;
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
