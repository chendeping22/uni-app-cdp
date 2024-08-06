<template>
  <scroll-view
    :class="className"
    :style="{ height: '50vh' }"
    scroll-y
    :refresher-enabled="false"
    :refresher-threshold="0"
    refresher-default-style="none"
    :refresher-triggered="refresherTriggered"
    @scrolltolower="refresherTriggered = true"
  >
    <view v-if="faceSearchResps?.length" class="face-item-wrap">
      <view
        v-for="item in faceSearchResps"
        :key="item.id"
        class="face-item"
        @click="goDetail(item.id, item.libraryType)"
      >
        <face-item
          :key="item.id"
          :capture-img-url="item.captureImgUrl"
          :capture-time="item.captureTime"
          :person-type="item.personType"
          :library-type="item.libraryType"
        />
      </view>
    </view>
    <c-empty v-else content="暂无数据" bg-type="gray" />
  </scroll-view>
</template>

<script lang="ts" setup>
import { isNumber } from '@/utils/lodash-es';
import { ref, toRefs } from 'vue';
import useCaptureRecords from '../../hooks/useCaptureRecords';
import FaceItem from '../face-item/index.vue';

interface IProps {
  className?: string | string[];
  uuid?: string;
  dateType?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
  uuid: '',
  dateType: 0,
});

const { uuid, dateType } = toRefs(props);

const refresherTriggered = ref(false);

const { faceSearchResps } = useCaptureRecords({
  deviceId: uuid,
  dateType,
  loadMore: refresherTriggered,
  loadComplete: () => {
    refresherTriggered.value = false;
  },
});

const goDetail = (id: string, libraryType: number) => {
  const pagePath = `/app-school-safe/monitoring/detail?id=${id}`;

  uni.navigateTo({
    url: isNumber(libraryType) ? `${pagePath}&libraryType=${libraryType}` : pagePath,
  });
};
</script>

<style scoped lang="scss">
.face-item-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 8rpx;
  grid-column-gap: 8px;
  margin-top: $ui-gap-default;
}
.face-item {
  padding: $ui-gap-default;
  background-color: $ui-color-white;
  border-radius: $ui-radius-xl;
  height: 346rpx;
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
  box-sizing: border-box;
}
</style>
