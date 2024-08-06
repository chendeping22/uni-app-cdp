<template>
  <view
    class="u-empty"
    :style="{
      marginTop: marginTop + 'rpx',
    }"
  >
    <u-icon
      :name="option.src"
      :size="option.iconSize"
      :custom-style="{
        marginBottom: option.iconGap + 'rpx',
        overflow: 'hidden',
      }"
    ></u-icon>
    <template v-if="Array.isArray(option.text)">
      <text v-for="(t, index) in option.text" :key="t" :class="'label label-' + index">
        {{ t }}
      </text>
    </template>
    <text v-else class="label" :style="{ fontSize: option.fontSize + 'rpx' }">
      {{ option.text || '' }}
    </text>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import iconEmpty from '/static/icon_empty.svg';
import iconNoPage from '/static/icon_no_page.svg';
import iconNoPermission from '/static/icon_no_permission.svg';
import iconSearch from '/static/icon_search_empty.svg';

const options = {
  data: {
    icon: iconEmpty,
    text: '暂无数据',
  },
  list: {
    icon: iconEmpty,
    text: '暂无数据',
  },
  page: {
    icon: iconNoPage,
    text: '链接失效',
  },
  permission: {
    icon: iconNoPermission,
    text: '暂无权限',
  },
  search: {
    icon: iconSearch,
    text: ['没搜到相关结果', '换个搜索词试试吧'],
  },
};

interface Props {
  mode?: keyof typeof options;
  src?: string;
  text?: string | string[];
  color?: string;
  iconSize?: number;
  iconGap?: number;
  fontSize?: number;
  /** 卡片内显示 */
  card?: boolean;
  marginTop?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'data',
});

const option = computed(() => {
  const currentOption = options[props.mode] || options['data'];
  return {
    src: props.src || currentOption.icon,
    text: props.text || currentOption.text,
    iconSize: props.iconSize || (props.card ? 144 : 216),
    iconGap: props.iconGap || (props.card ? 28 : 32),
    fontSize: props.fontSize || (props.card ? 28 : 32),
  };
});
</script>
<style scoped lang="scss">
.u-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.label {
  margin: 0 32rpx 16rpx;
  color: #00000073;
  text-align: center;
  line-height: 1.375;
  font-size: 32rpx;
  font-weight: 400;
}
.label-0 {
  margin-bottom: 16rpx;
  color: #000000e0;
  line-height: 1.3;
  font-size: 40rpx;
  font-weight: 500;
}
</style>
