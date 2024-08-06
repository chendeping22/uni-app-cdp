<template>
  <view class="bg-white">
    <view class="plr-l ptb-s bg-white">
      <c-search
        v-model:value="searchValue"
        placeholder="请输入学生名称"
        bg-type="fill-default"
        border-color-type="fill-default"
      />
    </view>
    <view class="task-check1">
      <c-dropdown show-arrow @onChange="handleOpenPicker">
        <c-dropdown-item :type="0" :title="clazzName" width="360rpx" />
      </c-dropdown>
      <view class="task-check1-batch" @click="goBatchPage">批量检测</view>
    </view>
  </view>
  <view v-if="filterStudents.length > 0">
    <VirtualScrollingList :list="filterStudents">
      <template #cell="{ item, isFirst }">
        <StudentItem :item="item" :is-first="isFirst" @click="handleSelectStudent" />
      </template>
    </VirtualScrollingList>
  </view>
  <c-empty v-else bg-type="default" />

  <c-picker
    v-model:show="showClzPicker"
    v-model:value="classValue.array"
    type="multi-auto"
    title="年级/班级选择"
    title-type="text"
    :list="clzTree.array"
  />
</template>
<script lang="ts">
import StudentItem from '@/app-preprimary-education/components/student-item/index.vue';
import { getTree } from '@/app-preprimary-education/services/health-day';
import { isNil } from '@/utils/lodash-es';
import { getPageParams } from '@/utils/tools';
import { defineComponent, inject, onBeforeMount, reactive, ref, watchEffect } from 'vue';
import VirtualScrollingList from '../virtual-scrolling-list.vue';

export default defineComponent({
  components: { StudentItem, VirtualScrollingList },
  props: {
    curTab: { type: Number, default: 0 },
    studentList: { type: Array, default: [] },
  },
  emits: [],
  setup(props) {
    /** 筛选后的学生 */
    const filterStudents = ref([] as any[]);

    const uniqKey = ref(Date.now());

    const showClzPicker = ref(false);
    const classValue = reactive({
      array: [{ value: ' ' }] as any[],
    });
    const clzTree = reactive({
      array: [] as any[],
    });

    const searchValue = ref('');
    const clazzName = ref('全部');
    const { injectCurSelectStudent } = inject<any>('injectCurSelectStudent');
    const { injectGoBatchPage } = inject<any>('injectGoBatchPage');
    let handleUpdateMenu: (...args: any) => void;

    watchEffect(() => {
      if (showClzPicker.value || !handleUpdateMenu) return;
      const arrValue = classValue.array;
      if (arrValue.length < 1) {
        handleUpdateMenu(
          0,
          {
            title: '全部',
            valueLabel: '全部',
            type: 0,
          },
          { repeatStatus: 2 },
        );
        return;
      }

      handleUpdateMenu(
        0,
        {
          title: arrValue[0]?.label || '',
          valueLabel:
            arrValue[1].value === ''
              ? arrValue[0].value === ''
                ? classValue.array[0].label
                : arrValue[0].label
              : arrValue[1].label,
          type: 0,
        },
        { repeatStatus: 2 },
      );
    });

    const madeData = (dataList: any[]) => {
      const data: { label: any; value: any; children: any[] }[] = [
        {
          label: '全部',
          value: '',
          children: [
            {
              label: '全部',
              value: '',
              children: [],
            },
          ],
        },
      ];
      for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].children.length === 0) {
          data.push({
            label: dataList[i].name,
            value: dataList[i].id,
            children: [
              {
                label: '全部',
                value: '',
                children: [],
              },
            ],
          });
        } else {
          let data2 = [
            {
              label: '全部',
              value: '',
              children: [],
            },
          ];
          for (var j = 0; j < dataList[i].children.length; j++) {
            data2.push({
              label: dataList[i].children[j].name,
              value: dataList[i].children[j].id,
              children: [],
            });
          }
          data.push({
            label: dataList[i].name,
            value: dataList[i].id,
            children: data2,
          });
        }
      }
      return data;
    };

    const fetchClzTree = async () => {
      const res = await getTree();
      const newdata = madeData(res);
      clzTree.array = newdata;
    };

    watchEffect(() => {
      // 同时监听students, curTab, classValue, searchValue四个
      const { studentList } = props;
      if (studentList.length === 0) {
        return;
      }

      const { curTab } = props;
      const _tmp = studentList
        // 筛选统计, 根据healthStatus字段
        .filter(tmp => {
          if (curTab === 0) return true; // 应检, 显示所有
          if (curTab === 1) return !isNil(tmp.healthStatus); // 已检
          if (curTab === 2) return isNil(tmp.healthStatus); // 未检
          return false;
        })
        // 筛选名称
        .filter(tmp => tmp.name.includes(searchValue.value))
        // 筛选年级/班级
        .filter(tmp => {
          if (classValue.array.length < 2) return true;
          const _gradeId = classValue.array[0].value;
          const _clzId = classValue.array[1].value;
          if (_gradeId === '') return true;
          return tmp.gradeId === _gradeId && (_clzId === '' || tmp.clazzId === _clzId);
        });

      filterStudents.value = _tmp;
      uniqKey.value = Date.now();
    });

    const handleSelectStudent = (item: any) => {
      injectCurSelectStudent(item);
    };
    const goBatchPage = () => {
      injectGoBatchPage();
    };

    const handleOpenPicker = ({ updateMenu }: any) => {
      showClzPicker.value = true;
      if (!handleUpdateMenu) {
        handleUpdateMenu = updateMenu;
      }
    };

    onBeforeMount(() => {
      fetchClzTree();
      const { clazzList } = getPageParams();
      if (!isNil(clazzList)) {
        const list = JSON.parse(clazzList);
        if (!isNil(list) && list[1].value !== '') {
          classValue.array = [list[1], list[2]];
          if (list[2].value === '') {
            clazzName.value = classValue.array[0]?.label || '全部';
          } else {
            clazzName.value = `${classValue.array[1]?.label}`;
          }
        }
      }
    });

    return {
      clzTree,
      searchValue,
      filterStudents,
      showClzPicker,
      classValue,
      handleSelectStudent,
      handleOpenPicker,
      uniqKey,
      goBatchPage,
      clazzName,
    };
  },
});
</script>
<style lang="scss" scoped>
.task-check1 {
  position: relative;
  .task-check1-batch {
    position: absolute;
    right: 32rpx;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    color: #176bfb;
  }
}
</style>
