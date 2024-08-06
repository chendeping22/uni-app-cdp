<template>
  <view class="plr-s">
    <view class="mt-b flex-wrap">
      <!-- <c-row :row-gutter="16" :gutter="16"> -->
      <!-- <c-col v-for="(pic, inx) in listData" :key="`time_${inx}`" :span="6"> -->
      <view class="mr-s pt-s" v-for="(pic, inx) in listData" :key="`time_${inx}`">
        <view class="relative flex-center icon-168">
          <!-- <view
              v-if="!pic.thumbnailUrl && pic.resourceType === 2"
              class="icon-168 flex-center radius-default bg-deep"
              @click="handleClickDetail(pic)"
            ></view> -->
          <img
            v-if="pic.resourceType === 2"
            class="icon-168 flex-center radius-default bg-deep"
            :src="pic.videoSnapshotURL"
            @click="handleClickDetail(pic)"
          />
          <c-image
            v-else
            :src="pic.fileUrl || pic.thumbnailUrl"
            width="168rpx"
            height="168rpx"
            @click="handlePreview(pic.id)"
          />
          <view
            style="z-index: 1"
            v-if="pic.resourceType === 2"
            class="absolute icon-168 flex-center radius-default"
            @click="handleClickDetail(pic)"
          >
            <view
              class="icon-48 radius-round flex-center"
              :style="{
                background: 'rgba(0, 0, 0, 0.64)',
              }"
            >
              <c-image :src="icon_play_white" width="36rpx" height="36rpx" />
            </view>
          </view>
        </view>
      </view>
      <!-- </c-col> -->
      <!-- </c-row> -->
    </view>
    <c-empty v-if="listData.length === 0" content="暂无数据" bg-type="fill-default" />
  </view>
  <view v-if="isPreview" class="mask">
    <view class="swiper-wrap">
      <swiper
        :current="currentPreview.index"
        :autoplay="false"
        :style="{ height: '100%' }"
        @click="handleClosePreview"
      >
        <swiper-item class="swiper-item" v-for="(item, index) in imageResource" :key="index">
          <view class="list-image-wrap">
            <image class="swiper-image" :src="item.fileUrl || item.thumbnailUrl" mode="aspectFit" />
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { icon_play_white } from '@/app-preprimary-education/observation-record/utils/icon-play-white';
import { computed, onBeforeMount, ref } from 'vue';
import { useTimeImpression } from '../../utils/use-time-impression';

interface IProps {
  list: any[];
  isPreview: boolean;
}
const emits = defineEmits(['videoDatas', 'changePreview']);
const store = useTimeImpression();
const lists = ref<any>([]);
const currentPreview = ref({ index: -1, id: '' });

const props = withDefaults(defineProps<IProps>(), {
  list: () => [],
  isPreview: false,
});

const isPreview = computed(() => props.isPreview);

const handleClickDetail = (data: any) => {
  emits('videoDatas', data);
};
const listData = computed(() => {
  console.log('🚀 ~ file: index.vue:66 ~ listData ~ props.list:', props.list);

  return props.list;
});

const imageResource = computed(() => {
  const imageList: any[] = [];
  props.list.forEach(item => {
    const data = {
      id: item.id,
      fileId: item.fileId,
      thumbnailUrl: item.thumbnailUrl,
      fileUrl: item.fileUrl,
      resourceType: item.resourceType,
    };

    if (item.resourceType === 1) imageList.push(data);
  });
  return imageList;
});

/** 点击图片 - 预览 */
const handlePreview = id => {
  imageResource.value.forEach((item, index) => {
    if (item.resourceType === 1 && item.id === id) {
      currentPreview.value = { index, id };
    }
  });
  emits('changePreview', true);
};

/** 关闭预览 */
const handleClosePreview = () => {
  emits('changePreview', false);
};

onBeforeMount(() => {
  // console.log('🚀 ~ file: index.vue:64 ~ onBeforeMount ~ props.list:', props.list);
  // lists.value = props.list;
  // console.log('🚀 ~ file: index.vue:56 ~ onBeforeMount ~  list.value:', lists.value);
});
</script>
<style lang="scss" scoped>
.mask {
  position: fixed;
  z-index: 9999;
  top: 20px;
  right: 0;
  left: 0;
  bottom: 0;
  background: #000;
  transition: all 0.3s ease;
  .swiper-wrap {
    height: 100%;
    padding: 150rpx 0 50rpx 0;
  }
  .swiper-item {
    align-items: center;
    .list-image-wrap {
      width: 100%;
      height: 100%;
      flex: 1;
      transition: all 0.5s;
      overflow: hidden;
      box-sizing: content-box;
      position: relative;
      .swiper-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
