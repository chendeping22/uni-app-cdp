<template>
  <c-picker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    type="multi-auto"
    :title="title"
    title-type="text"
    :list="clazzList"
  />
</template>

<script lang="ts" setup>
import {
  getClazzWithSectionByTeacherId2,
  getPositionInfoByUserId,
  SchoolRosterTreeNode,
} from '@/app-preprimary-education/services/home-school-communication';
import { isHigherMastorOrTeacher } from '@/app-preprimary-education/utils/constant';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { showInfo } from '@/utils/tools';
import { onBeforeMount, ref, toRaw, watchEffect } from 'vue';

export interface IPicker {
  label: string;
  value: any;
  children: IPicker[];
}

interface IProps {
  title?: string;
  className?: string | string[];
  show: boolean;
  value: { value: any }[];
  /** 若为[],则显示全部,默认为[0]. 0:幼儿园, 1:小学, 2:初中, 3:高中, 4:大学, 5:中高职, 98:社团, 99:兴趣班 */
  nodeCode?: number[];
  hasGradeAll?: boolean; // 年级是否有全部选项
  hasClazzAll?: boolean; // 班级是否有全部选项
  autoClazzAll?: boolean; // 是否自动根据权限显示班级的全部
  col?: number; // 显示几列，最多三列
  skipRole?: string;
  customRequest?: (teacherId: string, skipRole?: string) => Promise<any[]>;
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
  title: '选择班级',
  show: false,
  hasGradeAll: false,
  hasClazzAll: false,
  autoClazzAll: true,
  value: () => [],
  nodeCode: () => [0], // 默认幼儿园
  col: 3, // 年段/年级/班级
  skipRole: '',
});

const emits = defineEmits(['update:show', 'update:value', 'onLoadPicker']);

const userInfo = loginStore().userInfo;

const showPicker = ref(false);
const clazzList = ref([] as any[]);
const curSelectClazz = ref([] as any[]);
const showClazzAll = ref(false);

/** 构造数据, 当前仅处理幼儿园的逻辑 */
const madeData = (dataList: SchoolRosterTreeNode[]) => {
  const { col } = props;
  const hasClazzAll = props.hasClazzAll;
  const hasGradeAll = props.hasGradeAll;
  return dataList.map(t => {
    const gradeList = t.childNodeList.map(k => {
      const clazzList = k.childNodeList.map(j => {
        return {
          label: j.nodeName,
          value: j.nodeId,
        };
      });
      return {
        label: k.nodeName,
        value: k.nodeId,
        children:
          col > 2
            ? hasClazzAll || showClazzAll.value // 是否显示班级选项的全部
              ? [
                  {
                    label: '全部',
                    value: '',
                  },
                  ...clazzList,
                ]
              : clazzList
            : [],
      };
    });
    return {
      label: t.nodeName,
      value: t.nodeId,
      children:
        col > 1
          ? hasGradeAll
            ? [
                {
                  label: '全部',
                  value: '',
                  children: [
                    {
                      label: '全部',
                      value: '',
                    },
                  ],
                },
                ...gradeList,
              ]
            : gradeList
          : [],
    };
  });
};

const fetchClzTree = async () => {
  const userId = loginStore().currentUserType !== EUserType.teacher ? userInfo.userId : userInfo.id;
  const res = await (props.customRequest ? props.customRequest : getClazzWithSectionByTeacherId2)(
    userId,
    props.skipRole,
  );
  // props.nodeCode 若为[]则显示全部
  const filterNode =
    props.nodeCode.length === 0 ? res : res.filter(t => props.nodeCode.includes(t.nodeCode ?? -1));
  const newdata = madeData(filterNode);
  clazzList.value = newdata;
  emits('onLoadPicker', newdata);
};

/** 获取用户职位信息 */
const fetchPosition = async () => {
  const res = await getPositionInfoByUserId();
  const roles = res.map(t => t.code);
  showClazzAll.value = isHigherMastorOrTeacher(roles);
};

const init = async () => {
  if (!props.hasClazzAll && props.autoClazzAll) await fetchPosition();
  await fetchClzTree();
};

watchEffect(() => {
  if (props.show) {
    if (!clazzList.value.length) {
      showInfo('暂无数据');
      emits('update:show', false);
      return;
    }
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

onBeforeMount(() => {
  init();
});
</script>
