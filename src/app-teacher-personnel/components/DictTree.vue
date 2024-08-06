<template>
  <view style="display: flex">
    <u-input
      v-model="showName"
      type="select"
      input-align="right"
      placeholder="请选择内容"
      :disabled="disabled"
      :class="{ dictDisabled: disabled }"
      :clearable="false"
      :select-open="show"
      @click="!disabled && (show = true)"
    />
    <u-icon
      v-if="canClear"
      name="close-circle-fill"
      :size="32"
      style="margin-left: 10rpx"
      color="rgb(192, 196, 204)"
      @click="toClear"
    ></u-icon>
  </view>
  <u-popup v-model="show" mode="bottom" width="100%" safe-area-inset-bottom height="auto">
    <view class="u-select">
      <view class="u-select__header" @touchmove.stop.prevent="">
        <view
          class="u-select__header__cancel u-select__header__btn"
          hover-class="u-hover-class"
          :hover-stay-time="150"
          @tap="handleClose"
        >
          取消
        </view>
        <view class="u-select__header__title"> </view>
        <view
          class="u-select__header__confirm u-select__header__btn"
          hover-class="u-hover-class"
          style="color: #2979ff"
          :hover-stay-time="150"
          @touchmove.stop=""
          @tap.stop="handleConfirm"
        >
          确认
        </view>
      </view>
      <view class="u-select__body">
        <scroll-view
          scroll-y="true"
          style="height: 100%"
          :scroll-top="scrollTop"
          scroll-with-animation
        >
          <view style="padding: 0 40rpx">
            <Tree :list="treeData" :inner-list="innerList" @handleSelect="handleSelect" />
          </view>
        </scroll-view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { castArray } from 'lodash-es';
import { PropType, computed, getCurrentInstance, ref, watch } from 'vue';
import Tree from './Tree.vue';

interface IOptionItems {
  label: string;
  value: string;
}

const props = defineProps({
  modelValue: {},
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  field: { type: Object as PropType<any> },
  treeData: {
    type: Array as PropType<any>,
  },
});

const emits = defineEmits(['change', 'update:modelValue']);
const show = ref(false);
const treeData = ref([]);
const innerList = ref<string[]>([]);
const scrollTop = ref();

function handleSelect(item: IOptionItems) {
  if (props.multiple) {
    if (innerList.value?.some(one => one == item.value)) {
      innerList.value = innerList.value?.filter(one => one != item.value);
    } else {
      innerList.value = [...innerList.value, item.value];
    }
  } else {
    innerList.value = [item.value];
  }
}
function handleClose() {
  show.value = false;
  if (props.modelValue) {
    innerList.value = castArray(props.modelValue);
  }
}

function toClear() {
  emits('update:modelValue', props.multiple ? [] : '');
  emits('change', props.multiple ? [] : '');
  innerList.value = [];
}

function handleConfirm() {
  emits('change', props.multiple ? innerList.value : innerList.value[0]);
  emits('update:modelValue', props.multiple ? innerList.value : innerList.value[0]);
  show.value = false;
}

function recursion(target, list, matchArr) {
  list?.forEach(one => {
    if (matchArr?.some(item => item == one.value)) {
      target.push(one.label);
    }
    if (one?.children?.length > 0) {
      recursion(target, one.children, matchArr);
    }
  });
}

const showName = computed(() => {
  const arr: string[] = [];
  recursion(arr, props.treeData, castArray(props.modelValue));
  return arr?.join(',');
});
const canClear = computed(() => {
  return !!showName.value;
  // if (props.multiple) {
  //   return props.clearable && props.modelValue?.length > 0;
  // }
  // return props.clearable && props.modelValue;
});

const instance = getCurrentInstance();
const query = uni.createSelectorQuery().in(instance.proxy);

function recursion1(result, tree, targetValue) {
  for (const one of tree) {
    result.count++;
    if (one.value === targetValue) {
      return true;
    }
    if (one.children?.length > 0) {
      const r = recursion1(result, one.children, targetValue);
      if (r) {
        return;
      }
    }
  }
}

function scrollToTarget() {
  if (innerList.value?.length > 0) {
    const result = { count: 1 };
    recursion1(result, treeData.value, innerList.value?.[0]);
    scrollTop.value = (result.count - 3) * 52;
  }
}

function scrollToTarget1() {
  // px
  const screenHeight = uni.getSystemInfoSync().windowHeight;
  const modalHeight = 245;
  const p1 = screenHeight - modalHeight;

  query
    .select('.item1-active')
    .boundingClientRect(data => {
      // console.log('ccc得到布局位置信息11' + JSON.stringify(data));
      // console.log(' ccc节点离页面顶部的距离为' + data.top);
      // console.log(' ccc节点离页面顶部的距离为offsetTop' + data.offsetTop);
      const offsetTop = data.top / 2 - p1 + 80;

      scrollTop.value = offsetTop;
    })
    .exec();

  // h5可以
  // const target = query.select('.item1-active');
  // console.log('🚀ccc ~ scrollToTarget ~ target:', target);
  // if (target) {
  //   const { offsetTop } = target || {};
  //   scrollTop.value = offsetTop;
  // }
}

// 打开后滚动到选择的位置
watch(
  () => show.value,
  newValue => {
    if (newValue) {
      setTimeout(() => {
        scrollToTarget();
      }, 200);
    }
  },
);

// 点击灰色蒙层的时候要清除已选的
watch(
  () => show.value,
  newValue => {
    if (!newValue) {
      scrollTop.value = 0;
      if (props.modelValue) {
        innerList.value = castArray(props.modelValue);
      } else {
        innerList.value = [];
      }
    }
  },
);

watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      innerList.value = castArray(newValue);
    }
  },
  { immediate: true },
);
watch(
  () => props.treeData,
  newValue => {
    if (newValue) {
      treeData.value = newValue;
    }
    // current.value = props.options?.find(one => one.value == newValue) || {};
    // const _index = props.options?.findIndex(one => one.value == newValue);
    // defaultValue.value = [_index >= 0 ? _index : 0];
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.u-select {
  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    padding: 0 40rpx;
  }

  &__body {
    width: 100%;
    height: 500rpx;
    overflow: hidden;
    background-color: #fff;
  }
}
</style>
