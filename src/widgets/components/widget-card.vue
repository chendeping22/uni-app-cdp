<template>
  <view :class="['u-m-l-32', 'u-m-r-32', `u-m-t-${widgetMarginTop}`, 'widget']">
    <u-card
      margin="0"
      :border="false"
      :head-border-bottom="false"
      :show-head="true"
      :padding="0"
      :head-style="{ height: customHead ? '' : widgetHeaderHeight + 'rpx' }"
      @head-click="$emit('headClick')"
    >
      <template #head>
        <template v-if="customHead">
          <slot name="custom-head" />
        </template>
        <u-cell-item
          v-else
          :icon="widget.applicationLogoUrl ? widget.applicationLogoUrl : applicationIcon"
          :icon-style="{ width: '40rpx', height: '40rpx' }"
          :title="widget.title"
          :title-style="{ fontSize: '32rpx', fontWeight: 500, color: '#000000E0' }"
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
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, watch } from 'vue';
import { getWidgetConfig, widgetHeaderHeight, widgetMarginTop } from '../util/get-widget-info';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  isLoadedData: boolean; //是否已请求网络并成功获取到数据 注意：这个值要传准确 不然会导致页面高度出问题
  bodyHeight: number;
  arrow?: boolean;
  rightText: string;
  customHead?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), { arrow: true, rightText: '' });

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['headClick', 'pullDownRefresh', 'show']);

onBeforeMount(() => {
  uni.$on('workbenchShow', pageShow);
  uni.$on('workbencPullDownRefresh', pullDownRefresh);
  uni.$on('widgetCalculateHeight', calculateHeight);
});
onBeforeUnmount(() => {
  uni.$off('workbenchShow', pageShow);
  uni.$off('workbencPullDownRefresh', pullDownRefresh);
  uni.$off('widgetCalculateHeight', calculateHeight);
});
const pullDownRefresh = () => {
  emits('pullDownRefresh');
};
const pageShow = () => {
  emits('show');
};
watch(
  () => props.isLoadedData,
  newValue => {
    calculateHeight();
  },
);
const calculateHeight = () => {
  if (props.bodyHeight <= 0) {
    console.log('将获取动态高度：', props.widget.title);

    getBodyHeight();
  }
};

//动态body高度
const instance = getCurrentInstance() as any;
const getBodyHeight = async () => {
  setTimeout(() => {
    let query = uni.createSelectorQuery().in(instance);
    query.select('.widget').boundingClientRect();
    query.exec(res => {
      if (res && res[0]) {
        const height = res[0].height;
        if (height > 0) {
          // eslint-disable-next-line vue/no-mutating-props
          props.widget.adaptiveCardHeight = height;
          console.log('widget动态获取高度：', props.widget.title, height);
          uni.setStorage({
            key: getWidgetConfig(props.widget).widget,
            data: height,
          });
          uni.$emit('widgetHeightUpdate');
        }
      }
    });
  }, 1000);
};
</script>

<style scoped lang="scss">
.body {
  overflow: hidden;
}
</style>
