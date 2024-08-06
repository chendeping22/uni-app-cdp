<template>
  <view class="text-collapse" :class="`item${index} ${isCollapse ? 'text-collapse-value' : ''} `"
    >{{ data }}
    <view class="btn" v-if="isCollapse && showContentEllipsis" @click.stop="handleMore">
      <view class="more-txt">更多</view></view
    >
    <text class="more-btn" v-if="!isCollapse && showContentEllipsis" @click.stop="handleClose"
      >收起</text
    ></view
  >
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';

const props = defineProps({
  data: {
    type: String,
    default: '',
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
      console.log('🚀 ~ .exec ~ res:', res);
      const val = res?.[0]?.height > 45;
      console.log('🚀 ~ .exec ~ val:', val);
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
.text-collapse {
  word-break: break-all;
  line-height: 40rpx;
  width: 100%;
  position: relative;
  &-value {
    color: rgba(0, 0, 0, 0.88);
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.more-btn {
  color: #1677ff;
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
  color: #1677ff;
  padding-left: 8rpx;
}
</style>
