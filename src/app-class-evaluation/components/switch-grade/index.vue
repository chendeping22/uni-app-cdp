<template>
  <slot name="trigger" :open="open">
    <view class="evaluation-grade" @click="open">
      <text class="evaluation-grade-text headline-regular">{{ state.label }}</text>
      <u-icon name="arrow-down-fill" size="22" color="rgba(0, 0, 0, 0.45)" />
    </view>
  </slot>
  <u-popup
    v-model="show"
    mode="bottom"
    safe-area-inset-bottom
    @close="close"
    :closeable="!multiple"
    :border-radius="24"
  >
    <view class="u-flex" style="position: relative">
      <view v-if="multiple" class="grade-popup-reset" @click="reset">清空</view>
      <view class="grade-popup-title headline-regular">切换年级</view>
      <view v-if="multiple" class="grade-popup-submit" @click="close">确定</view>
    </view>
    <view class="grade-popup-content">
      <scroll-view scroll-y="true" class="grade-popup-scroll">
        <grade-list
          :list="state.data"
          :selected="state.selected"
          :multiple="multiple"
          :is-class="isClass"
          @selected="onSelect"
        ></grade-list>
        <view style="padding-bottom: 32rpx"></view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { isArray, unionBy } from 'lodash-es';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { getEvaluationClassTree } from '../../services/evaluation';
import { getOnSchemeClassTree } from '../../services/report';

import GradeList from './grade-list.vue';
import { GradeTypeEnum, IGradeItem, getTreeItemMap } from './utils';
const props = defineProps<{
  value?: IGradeItem | IGradeItem[];
  multiple: boolean;
  isClass?: boolean;
  startDate?: string | number;
  endDate?: string | number;
  type?: string; // 报表的班级详情班级切换
}>();

const emit = defineEmits<{
  (e: 'update:value', value: IGradeItem | IGradeItem[]): void;
}>();

const show = ref<boolean>(false);

const state = reactive<{
  data: IGradeItem[];
  keysMap: Record<number, IGradeItem & { parent: IGradeItem }>;
  selected: IGradeItem[];
  loading: boolean;
  label: string;
}>({
  data: [],
  keysMap: {},
  selected: [],
  loading: false,
  label: '所有年级',
});

const selectedIds = computed(() => state.selected.map(i => i.id));

const _updateValue = (val: IGradeItem[]) => {
  if (
    val
      .map(i => i.id)
      .sort()
      .toString() !==
    (props.value as IGradeItem[])
      .map(i => i.id)
      .sort()
      .toString()
  ) {
    emit('update:value', val);
  }
};

const updateValue = () => {
  if (state.selected.length) {
    let _excludeIds: string[] = [];
    const _val = state.selected
      .sort((a, b) => a.type - b.type)
      .filter(item => {
        const _parent = state.keysMap[item.id].parent;
        const _child = state.keysMap[item.id].children;
        if (_child?.length) {
          _excludeIds = _excludeIds.concat(_child.map(i => i.id));
        }

        if (_excludeIds.includes(item.id)) {
          return false;
        }

        if (_parent) {
          const _parents = getParentIds(item.id, []);
          if (state.selected.find(i => _parents.includes(i.id))) {
            return false;
          }
        }

        return true;
      });

    if (_val.length === 1) {
      state.label = _val[0].name;
    } else {
      const _class = state.selected.filter(i => i.type === GradeTypeEnum.Class);
      state.label = `已选${_class.length}班级`;
    }

    _updateValue(_val);
  } else {
    _updateValue([]);
    state.label = '所有年级';
  }
};

const fetchData = async () => {
  try {
    state.loading = true;

    const response: any =
      props.type === 'report'
        ? await getOnSchemeClassTree({})
        : await getEvaluationClassTree({
            startDate: props.startDate || '',
            endDate: props.endDate || '',
          });
    if (response?.length) {
      state.data = response;
      state.keysMap = getTreeItemMap(response, {});
      if (state.selected.length) {
        // 判断选中的是否在列表里
        const _selected = state.selected.filter(i => !!state.keysMap[i.id]);
        if (_selected.length !== state.selected.length) {
          // 单选
          if (!props.multiple) {
            const _first = response[0].children?.[0];
            if (_first) {
              emit('update:value', _first);
              state.selected = [_first];
            }
          } else {
            state.selected = _selected;
            updateValue();
          }
        }
      }
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
  }
};

const getParentIds = (id: string, result: string[]) => {
  const _parent = state.keysMap[id]?.parent;
  if (_parent) {
    result.push(_parent.id);
    getParentIds(_parent.id, result);
  }

  return result;
};

const getChildItems = (data: IGradeItem, result: IGradeItem[]) => {
  const _child = state.keysMap[data.id]?.children;
  if (_child?.length) {
    _child.forEach((item: IGradeItem) => {
      result.push(item);
      if (state.keysMap[item.id].children) {
        getChildItems(item, result);
      }
    });
  }

  return result;
};

const checkParentItems = (data: IGradeItem, checked: boolean) => {
  const _parent = state.keysMap[data.id]?.parent;
  if (!_parent) {
    return;
  }

  const isCheckedParent = selectedIds.value.includes(_parent.id);

  if (checked && !isCheckedParent) {
    let isFullCheck = true;
    const _child = state.keysMap[_parent.id].children || [];

    for (let i = 0; i < _child.length; i++) {
      if (!selectedIds.value.includes(_child[i].id)) {
        isFullCheck = false;
        break;
      }
    }

    if (isFullCheck) {
      state.selected = state.selected.concat(_parent);

      checkParentItems(_parent, checked);
    }
  } else if (!checked && isCheckedParent) {
    state.selected = state.selected.filter(i => _parent.id !== i.id);
    checkParentItems(_parent, checked);
  }
};

const onSelect = (checked: boolean, data: IGradeItem) => {
  // 单选
  if (!props.multiple) {
    if (data.id !== state.selected[0]?.id) {
      emit('update:value', data);
      state.selected = [data];
    }
    show.value = false;
    return;
  }
  const { children, ...rest } = data;
  let _child = [rest];

  if (children?.length) {
    _child = getChildItems(rest, _child);
  }

  if (checked) {
    state.selected = unionBy(state.selected.concat(_child), 'id');
  } else {
    state.selected = state.selected.filter(i => _child.findIndex(j => j.id === i.id) === -1);
  }

  checkParentItems(rest, checked);
};

const reset = () => {
  state.selected = [];
};

const close = () => {
  show.value = false;
};

const open = () => {
  show.value = true;
};

watch(show, (n, o) => {
  if (!props.multiple) {
    return;
  }
  // 关闭时更新
  if (!n && o) {
    updateValue();
  }
});

watch(
  () => props.value,
  newVal => {
    if (!props.multiple && !isArray(newVal)) {
      if (newVal?.id !== state.selected[0]?.id) {
        state.selected = newVal ? [newVal] : [];
      }
    }
  },
  { immediate: true },
);

const _date = computed(() => `${props.startDate}${props.endDate}`);

watch(_date, (n, o) => {
  if (n !== o) {
    fetchData();
  }
});

onBeforeMount(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.evaluation-grade {
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-right: 40rpx;
  &-text {
    padding-right: 24rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.grade-popup-reset,
.grade-popup-submit {
  position: absolute;
  top: 0;
  margin: 0 12rpx;
  width: 96rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
}

.grade-popup-reset {
  left: 0;
  color: rgb(96, 98, 102);
}

.grade-popup-submit {
  right: 0;
  color: $color-primary;
}

.grade-popup-title {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  padding-left: 96rpx;
  padding-right: 96rpx;
  color: $color-text-heading;
}
.grade-popup-content {
  color: $color-text-heading;
  height: 70vh;
  padding-left: 32rpx;
  overflow: hidden;
}
.grade-popup-scroll {
  height: 100%;
}
</style>
