<template>
  <c-picker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    type="multi-auto"
    title="选择班级"
    title-type="text"
    :list="clazzList"
  />
</template>

<script lang="ts" setup>
import {
  getClazzWithSectionByTeacherId2,
  SchoolRosterTreeNode,
} from '@/app-preprimary-education/electronic-medal/utils/service';
import { loginStore } from '@/store/modules/login';
import { onBeforeMount, ref, toRaw, watchEffect } from 'vue';

export interface IPicker {
  label: string;
  value: any;
  children: IPicker[];
}

interface IProps {
  className?: string | string[];
  show: boolean;
  value: { value: any }[];
  /** 当前仅支持幼儿园 0-幼儿园, 1-小学, 2-初中, 3-高中 */
  nodeCode?: number[];
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
  show: false,
  value: () => [],
  nodeCode: () => [0],
});

const emits = defineEmits(['update:show', 'update:value', 'onLoadPicker']);

const showPicker = ref(false);
const clazzList = ref([] as any[]);
const curSelectClazz = ref([] as any[]);

const store = loginStore();

/** 构造数据, 当前仅处理幼儿园的逻辑 */
const madeData = (dataList: SchoolRosterTreeNode[]) => {
  return dataList.map(t => {
    return {
      label: t.nodeName,
      value: t.nodeId,
      children: t.childNodeList.map(k => {
        return {
          label: k.nodeName,
          value: k.nodeId,
          children: k.childNodeList.map(j => {
            return {
              label: j.nodeName,
              value: j.nodeId,
            };
          }),
        };
      }),
    };
  });
};

const fetchClzTree = async () => {
  const userId = store.userInfo?.userId ?? '';
  const res = await getClazzWithSectionByTeacherId2(userId);
  const filterNode = res.filter(t => props.nodeCode.includes(t.nodeCode ?? -1));
  const newdata = madeData(filterNode);
  clazzList.value = newdata;
  emits('onLoadPicker', newdata);
};

const init = async () => {
  await fetchClzTree();
};

watchEffect(() => {
  if (props.show) {
    setTimeout(() => {
      showPicker.value = true;
    }, 80);
  } else {
    showPicker.value = false;
  }
});

watchEffect(() => {
  if (showPicker.value === false) {
    emits('update:show', false);
  }
});

watchEffect(() => {
  if (curSelectClazz.value.length === 0) return;
  emits('update:value', toRaw(curSelectClazz.value));
});

const stop = watchEffect(() => {
  if (!props.value.length) return;
  curSelectClazz.value = props.value;
  stop();
});

onBeforeMount(async () => {
  init();
});
</script>
