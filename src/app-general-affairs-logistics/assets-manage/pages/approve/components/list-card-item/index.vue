<template>
  <view class="list-card-item">
    <view class="list-card-label">{{ itemData?.label }}</view>
    <view
      class="list-card-data"
      :class="`item${index} ${isCollapse ? 'list-card-value item-text' : ''} `"
      >{{ itemData?.value }}

      <view class="btn" v-if="isCollapse && showContentEllipsis" @click.stop="handleMore">
        <view class="more-txt">更多</view></view
      >
      <text class="more-btn" v-if="!isCollapse && showContentEllipsis" @click.stop="handleClose"
        >收起</text
      ></view
    >
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';

const props = defineProps({
  itemData: {
    type: Object,
    default: () => {},
  },
  index: {
    type: String,
    default: '',
  },
});
const instance = getCurrentInstance() as any;
const showContentEllipsis = ref(false);
const isCollapse = ref(false);

const handleMore = () => {
  isCollapse.value = false;
};

const handleClose = () => {
  isCollapse.value = true;
};

const ellipsisMultiLineText = () => {
  uni
    .createSelectorQuery()
    .in(instance)
    .select(`.item${props?.index}`)
    .boundingClientRect()
    .exec((res: any) => {
      const val = res?.[0]?.height > 45;
      // 两行内容的高度，超过两行显示省略号
      isCollapse.value = val;
      showContentEllipsis.value = val;
    });
};

onMounted(() => {
  ellipsisMultiLineText();
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.list-card {
  &-item {
    margin-bottom: 16rpx;
    display: flex;
    font-size: 30rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-label {
    min-width: 120rpx;
    color: $textLabelColor;
    margin-right: 24rpx;
    word-break: keep-all;
  }
  &-value {
    color: $textDefaultColor;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  &-data {
    word-break: break-all;
    line-height: 40rpx;
    position: relative;
  }
}

.more-btn {
  color: $colorPrimaryBase;
}
.btn {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8), #fff);
  padding-left: 24rpx;
}
.more-txt {
  background-color: #fff;
  color: $colorPrimaryBase;
  padding-left: 8rpx;
}
</style>
