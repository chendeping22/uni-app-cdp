<template>
  <view v-if="trackingRecords?.length > 0" class="mt-l">
    <c-time-line>
      <c-time-line-item v-for="item in trackingRecords" :key="item.id">
        <template #node>
          <view class="circle-point"></view>
        </template>
        <template #content>
          <!-- 记录详情 -->
          <view class="flex-between color-placeholder">
            <view class="color-base font-content content">{{ item.content }}</view>
            <view> {{ date2str(item.createTime, 'Date&Minutes') }} </view>
          </view>
          <view v-show="!!item.cancelRemark" class="bg-gray plr-b ptb-b">
            {{ item.cancelRemark }}
          </view>
        </template>
      </c-time-line-item>
    </c-time-line>
  </view>
  <card v-else bg-type="empty">
    <imp-empty-data title="无操作记录" />
  </card>
</template>

<script lang="ts" setup>
import { onLoad, onUnload } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { ref, watchEffect } from 'vue';
import { fetchStudentOperationTracking } from '../../../services/disease-management';

interface Props {
  recordId: string;
}

const props = defineProps<Props>();

const date2str = (date: number, mode: string) => {
  switch (mode) {
    case 'Date&Minutes': {
      return dayjs(date).format('YYYY-MM-DD HH:mm');
    }
    case 'Date': {
      return dayjs(date).format('YYYY-MM-DD');
    }
  }
};

const trackingRecords = ref();

watchEffect(() => {
  if (!!props.recordId)
    fetchStudentOperationTracking(props.recordId).then(res => {
      trackingRecords.value = res;
    });
});

const refresh = () => {
  fetchStudentOperationTracking(props.recordId).then(res => {
    trackingRecords.value = res;
  });
};

onLoad(() => {
  uni.$on('disease-management:modify', refresh);
  uni.$on('disease-management:modify:operation', refresh);
});

onUnload(() => {
  uni.$off('disease-management:modify', refresh);
  uni.$off('disease-management:modify:operation', refresh);
});
</script>

<style lang="scss" scoped>
.sports-clockin__list {
  max-width: 680rpx;
}
.sports-clockin__list--with-tag {
  max-width: 464rpx;
}
.sports-clockin__list__tag {
  padding-top: 2rpx;
  padding-bottom: 2rpx;
}
.student-photo {
  width: 88rpx;
  height: 88rpx;
}
.text-line-2 {
  /* 设置文本只显示三行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  /* 设置文本超出部分省略 */
  text-overflow: ellipsis;
}
.label-name {
  min-width: 130rpx;
}
.circle-point {
  width: 16rpx;
  height: 16rpx;
  background-color: #176bfb;
  border-radius: 16rpx;
}
.content {
  width: 308rpx;
}
.bg-gray {
  background-color: gainsboro;
  color: gray;
  border-radius: 6rpx;
}
</style>
