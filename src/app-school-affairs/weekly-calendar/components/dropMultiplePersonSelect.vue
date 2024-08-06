<template>
  <u-popup v-model="show" mode="bottom" :border-radius="16" @close="onClose">
    <view class="weekly-drop-btn-contain">
      <text class="btn-close btn-text" @click="onClose">取消</text>
      <text class="btn-confirm btn-text" @click="onConfirm">确定</text>
    </view>
    <view class="weekly-drop-drop-select-content">
      <scroll-view scroll-y="true" style="max-height: 600rpx">
        <u-checkbox-group v-model="chooseList" :wrap="true" @change="checkboxGroupChange">
          <view v-for="(item, index) in listOptions" :key="index" class="checkbox-item">
            <u-checkbox
              :key="index"
              v-model="item.checked"
              style="width: 100%"
              :size="48"
              :name="item.id"
              shape="circle"
              @change="checkboxChange"
              >{{ item.name }}</u-checkbox
            >
          </view>
        </u-checkbox-group>
      </scroll-view>
    </view>
  </u-popup>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch, type PropType } from 'vue';

interface CheckedData {
  value: string[];
  list: any[];
}
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  list: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  value: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});
const show = computed(() => props.isShow);
const listOptions = ref();
const emit = defineEmits<{
  (e: 'closeEvent'): void;
  (e: 'confirmEvent', data: CheckedData): void;
}>();
const chooseList = ref<string[]>(['-1']);

const onClose = () => {
  initListOption();
  emit('closeEvent');
};
const onConfirm = () => {
  const list: any = [];
  if (chooseList.value.length > 0) {
    chooseList.value.forEach((num: string) => {
      const item = listOptions.value.find(item => {
        return item.id === num;
      });
      if (item) {
        list.push(item);
      }
      console.log('===item', item);
    });

    emit('confirmEvent', { value: chooseList.value, list: list });
    emit('closeEvent');
  }
};
const checkboxChange = (e: any) => {
  if (e.name === '-1') {
    cancelAll();
  } else {
    checkedSinger();
  }
};
const checkboxGroupChange = (e: any) => {
  // console.log('==group', e, chooseList.value);
};
const cancelAll = () => {
  listOptions.value.map(val => {
    if (val.id === '-1') {
      val.checked = true;
    } else {
      val.checked = false;
    }
  });
};
const checkedSinger = () => {
  listOptions.value.map(val => {
    if (val.id === '-1') {
      val.checked = false;
    }
  });
};
const getInitList = () => {
  if (props.value && props.value.length > 0) {
    const options = props.list.map(item => {
      const index = props.value.findIndex((ele: any) => {
        return item.id === ele;
      });
      if (index >= 0) {
        item.checked = true;
      } else {
        item.checked = false;
      }
      return item;
    });
    return options;
  } else {
    return props.list;
  }
};
// 初始化多选下拉框状态
const initListOption = () => {
  listOptions.value = getInitList();
};
watch(
  () => props.list,
  () => {
    initListOption();
  },
);
watch(
  () => props.value,
  () => {
    initListOption();
  },
);
onMounted(() => {
  initListOption();
});
</script>
<style lang="scss" scoped>
.weekly-drop-drop-select-content {
  padding: 10rpx 32rpx 68rpx;
  :deep(.u-checkbox-group) {
    width: 100%;
  }
  .checkbox-item {
    display: flex;
    width: 100%;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #0000000f;
    :deep(.u-checkbox) {
      width: 100%;
    }
    :deep(.u-checkbox__label) {
      width: 100%;
    }
  }
}
.weekly-drop-btn-contain {
  display: flex;
  padding: 0 32rpx;
  height: 96rpx;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #0000000f;
  .btn-text {
    font-size: 32rpx;
    &.btn-close {
      color: #000000a6;
    }
    &.btn-confirm {
      color: #1677ff;
    }
  }
}
</style>
