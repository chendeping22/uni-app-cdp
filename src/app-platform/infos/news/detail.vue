<template>
  <page custom-overflow="scroll">
    <view v-if="record.title !== '此信息不存在'" class="detail">
      <view class="title u-line-20">{{ record.title }}</view>
      <view class="desc">
        <text class="name">
          {{ record.createName }}
        </text>
        <text class="time"> {{ record.publishTime }}</text>
      </view>
      <view class="content">
        <Dafter v-model="record.content" readonly />
      </view>
    </view>
    <u-empty-custom v-else :text="[record.title, '发布人已变更此信息']" />
  </page>
</template>

<script setup lang="ts">
import Dafter from '@/app-platform/infos/components/dafter/index.vue';
import { querySchoolPublishInfosDetail } from '@/app-platform/services/infos';
import { formatDate } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { LOG_STATUS } from '../util';

const record = reactive({
  title: '',
  createName: '',
  publishTime: '',
  content: '',
});

onLoad(async option => {
  if (option?.id) {
    const data: any = await querySchoolPublishInfosDetail(option.id);

    if (data) {
      let pTime = data.publishTime ? formatDate(data.publishTime, 'YYYY-MM-DD hh:mm') : '审核中';
      pTime = data.status === LOG_STATUS.reviewing ? '审核中' : pTime;
      pTime = data.status === LOG_STATUS.verify_fail ? '校验失败' : pTime;
      pTime = data.status === LOG_STATUS.verifying ? '校验中' : pTime;

      Object.assign(record, data, {
        createName: data.createName || data.auditorName || data.updateName,
        publishTime: pTime,
      });
      return;
    }

    record.title = '此信息不存在';
  }
});
</script>

<style lang="scss" scoped>
.detail {
  padding: $space-size-md;
  background: $color-background-base;

  .title {
    color: rgba($color-text-base, 0.85);
    @include title-3-medium;
  }

  .desc {
    @include footnote-regular;
    color: rgba($color-text-base, 0.45);
    padding: $space-size-s 0;
    .name {
      padding-right: $space-size-s;
    }
  }
}

:deep(.page) {
  background-color: $color-background-base;
}
</style>
