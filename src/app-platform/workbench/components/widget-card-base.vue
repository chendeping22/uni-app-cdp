<template>
  <view :class="['u-m-l-32', 'u-m-r-32', `u-m-t-24`, 'widget']">
    <u-card
      margin="0"
      :border="false"
      :head-border-bottom="false"
      :show-head="true"
      :padding="0"
      @head-click="$emit('headClick')"
    >
      <template #head>
        <u-cell-item
          :icon="widget.applicationLogoUrl ? widget.applicationLogoUrl : applicationIcon"
          :title="widget.title"
          :title-style="{ fontSize: '30rpx', fontWeight: 600 }"
          :border-bottom="false"
          :arrow="arrow"
          :hover-class="'none'"
          :value="rightText"
        >
          <template #right-icon>
            <slot name="right-icon" />
          </template>
        </u-cell-item>
      </template>
      <template #body>
        <view
          v-if="bodyHeight > 0"
          class="u-p-l-24 u-p-r-24 body"
          :style="{ height: bodyHeight + 'rpx' }"
        >
          <slot v-if="isLoadedData"></slot>
        </view>
        <view v-else class="u-p-l-24 u-p-r-24">
          <slot v-if="isLoadedData"></slot>
        </view>
      </template>
    </u-card>
  </view>
</template>

<script lang="ts" setup>
import applicationIcon from '@/static/application.png';
import { IWidget } from '@/store/modules/workbench';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  isLoadedData: boolean; //是否已请求网络并成功获取到数据 注意：这个值要传准确 不然会导致页面高度出问题
  bodyHeight: number;
  arrow?: boolean;
  rightText?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), { arrow: true, rightText: '' });

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['headClick']);
</script>

<style scoped lang="scss">
.body {
  overflow: hidden;
}
</style>
