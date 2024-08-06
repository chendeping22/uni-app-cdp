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
    <c-dropdown show-arrow @onChange="handleOpenPicker">
      <c-dropdown-item v-if="dropdownText" :type="0" :title="dropdownText" width="300rpx" />
    </c-dropdown>
  </view>
  <CustomIndexList v-if="filterStudents.length > 0" :key="uniqKey" :list="filterStudents">
    <template #cell="{ item, isFirst }">
      <StudentItem :item="item" :is-first="isFirst" @click="handleSelectStudent" />
    </template>
  </CustomIndexList>
  <!-- <c-index-list v-if="filterStudents.length > 0" :list="filterStudents" :minus-height="80">
    <template #cell="{ item, isFirst }">
      <StudentItem :item="item" :is-first="isFirst" @click="handleSelectStudent" />
    </template>
  </c-index-list> -->
  <c-empty v-if="filterStudents.length === 0" bg-type="fill-default" content="暂无待检查的学生" />

  <ClazzPicker
    v-model:show="showClzPicker"
    v-model:value="classValue.array"
    title="年级/班级选择"
    :has-grade-all="true"
    :node-code="[0]"
    @onLoadPicker="handleLoadPicker"
  />
</template>
<script lang="ts">
import { IgetStudentList } from '@/app-preprimary-education/services/health-day';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import { useStore } from '@/store/old';
import { isNil, uniqBy } from '@/utils/lodash-es';
import { computed, defineComponent, reactive, ref, toRaw, watchEffect } from 'vue';
import StudentItem from '../student-item/index.vue';

import CustomIndexList from '@/app-preprimary-education/components/c-index-list/c-index-list.vue';
import { showInfo } from '@/utils/tools';
import ClazzPicker, { IPicker } from '../clazz-picker/index.vue';

export default defineComponent({
  components: { StudentItem, ClazzPicker, CustomIndexList },
  props: {
    curTab: { type: Number, default: 0 },
    extra: {
      type: Object,
      default() {
        return {} as { selectDate: string; classValue: Array<string> };
      },
    },
  },
  emits: [],
  setup(props) {
    const {
      state: { dailyHealth },
    } = useStore();

    /** 筛选后的学生 */
    const filterStudents = ref([] as any[]);
    const isLoadClazzTree = ref(false);
    const clazzTreeData = ref<IPicker[]>([]);

    const showClzPicker = ref(false);

    const uniqKey = ref(Date.now());

    const dropdownText = ref('');
    const classValue = reactive({
      array: [] as any[],
    });
    const clzTree = reactive({
      array: [] as any[],
    });

    const searchValue = ref('');
    let handleUpdateMenu: (...args: any) => void;

    // 拼接学生列表
    const makeStudentOptions = (studentResps: IgetStudentList[]) => {
      // 1. 生成以首字母为key的对象, 并排序
      const first = studentResps
        .map(s => ({
          firstLetter: (s.firstLetter || '#').substring(0, 1).toUpperCase(),
          data: {
            desc: s.clazzName ?? '/',
            ...s,
            photoUrl: childHeaderImg(s.photoUrl || '', s.gender),
          },
        }))
        ?.sort((left, right) => (left.firstLetter < right.firstLetter ? -1 : 1));

      // 2. 按首字母分类
      const second = {} as { [k: string]: any[] };
      first.forEach(t => {
        if (!second[t.firstLetter]) {
          second[t.firstLetter] = [t.data];
        } else {
          second[t.firstLetter].push(t.data);
        }
      });

      // 3. 转为符合组件格式的数据
      return Object.entries(second).map(arr => ({
        char: arr[0],
        dataList: arr[1],
      }));
    };

    /** 班级列表 */
    const clazzList = computed(() => {
      const arr = [{ label: '全部', value: '' }];
      arr.push(
        ...uniqBy(
          dailyHealth.students.map(tmp => ({ label: tmp.clazzName, value: tmp.clazzId })),
          'label',
        ),
      );
      return arr;
    });

    watchEffect(() => {
      if (showClzPicker.value || !handleUpdateMenu) return;
      const arrValue = toRaw(classValue.array).slice(1);
      if (arrValue.length < 2) {
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
          title: '全部',
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

    watchEffect(() => {
      // 同时监听students, curTab, classValue, searchValue四个
      if (!dailyHealth.students.length || !isLoadClazzTree.value || showClzPicker.value) return;
      const { curTab } = props;

      const tmp = dailyHealth.students

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
          const _gradeId = classValue.array[1].value;
          const _clzId = classValue.array[2].value;
          // 年级为全部
          if (_gradeId === '') {
            let curClazzList: string[] = [];
            clazzTreeData.value[0].children.some(t => {
              curClazzList.push(...t.children.filter(t => t.value !== '').map(t => t.value));
            });
            return curClazzList.includes(tmp.clazzId);
          } else if (_clzId === '') {
            // 年级相同, 班级为全部
            let curClazzList: string[] = [];
            clazzTreeData.value[0].children.some(t => {
              if (t.value === _gradeId) {
                curClazzList = t.children.map(t => t.value).slice(1);
                return true;
              }
              return false;
            });
            return tmp.gradeId === _gradeId && curClazzList.includes(tmp.clazzId);
          }
          // 班级相同
          return tmp.gradeId === _gradeId && tmp.clazzId === _clzId;
        });
      filterStudents.value = makeStudentOptions(tmp);
      uniqKey.value = Date.now();
    });

    const handleSelectStudent = (item: any) => {
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/common/healthday-detail/index?id=${item.id}${
          !isNil(props.extra.selectDate) ? `&selectDate=${props.extra.selectDate}` : ''
        }`,
      });
    };

    const handleOpenPicker = ({ updateMenu }: any) => {
      showClzPicker.value = true;
      if (!handleUpdateMenu) {
        handleUpdateMenu = updateMenu;
      }
    };

    /** 初始化默认班级 */
    const handleLoadPicker = async (data: IPicker[]) => {
      if (!data.length) {
        showInfo('暂无数据');
        return;
      }
      clazzTreeData.value = toRaw(data);
      const col_1 = data[0];
      const col_2 = col_1.children[0];
      const col_3 = col_2.children[0];
      isLoadClazzTree.value = true;
      if (!isNil(props.extra.classValue)) {
        classValue.array = props.extra.classValue;
      } else {
        classValue.array = [
          { value: col_1.value, label: col_1.label },
          { value: col_2.value, label: col_2.label },
          { value: col_3.value, label: col_3.label },
        ];
      }
      const arrValue = toRaw(classValue.array).slice(1);
      const title =
        arrValue[1].value === ''
          ? arrValue[0].value === ''
            ? data[0].label
            : arrValue[0].label
          : arrValue[1].label;
      dropdownText.value = title || '全部';
    };

    return {
      clzTree,
      searchValue,
      clazzList,
      filterStudents,
      showClzPicker,
      classValue,
      dropdownText,
      handleSelectStudent,
      handleOpenPicker,
      handleLoadPicker,
      uniqKey,
      childHeaderImg,
    };
  },
});
</script>
