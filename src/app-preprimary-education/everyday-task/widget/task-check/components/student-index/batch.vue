<template>
  <mt-page
    title="批量检测"
    theme="default"
    :show-notice-bar="false"
    :show-top-gap="false"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <template v-if="allStudentList.length === 0">
      <c-empty
        :content="`今日已完成${HealthDayCheckType[pageParams.type]}`"
        style="background-color: transparent"
      />
    </template>
    <template v-else>
      <c-top>
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
            <c-dropdown-item :type="0" :title="clazzName" width="600rpx" />
          </c-dropdown>
        </view>
      </c-top>
      <view v-if="filterStudents.length > 0">
        <VirtualScrollingList :list="filterStudents">
          <template #cell="{ item, isFirst }">
            <StudentBatchItem
              :item="item"
              :is-first="isFirst"
              :is-normal="judgeIsNormal(item)"
              @click="jumpToCheck(item)"
            />
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
      <view style="height: 40px"></view>
      <c-empty-line need-safe-bottom />
      <c-bottom>
        <u-button type="primary" @click="handleBatchCommit">提交</u-button>
      </c-bottom>
    </template>

    <c-modal
      v-model:show="showModal"
      title=""
      content="暂未提交，确认直接返回吗？"
      confirm-text="确定"
      cancel-text="取消"
      @onConfirm="handleModalConfirm"
      @onCancel="handleModalCancel"
    />
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import StudentBatchItem from '@/app-preprimary-education/components/student-item/batch.vue';
import {
  IgetStudentList,
  getInspectionConfs,
  getTree,
  postInspectionTaskSaveOrUpdate,
} from '@/app-preprimary-education/services/health-day';
import {
  DEFAULT_NORMAL_TEMPERATURE,
  HealthDayCheckType,
} from '@/app-preprimary-education/utils/constant';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import { loginStore } from '@/store/modules/login';
import { isNil, map, uniq } from '@/utils/lodash-es';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, reactive, ref, watchEffect } from 'vue';
import VirtualScrollingList from '../virtual-scrolling-list.vue';

interface IPageParams {
  inspectionTaskId: string;
  type: 1 | 2 | 3;
}

export default defineComponent({
  components: { StudentBatchItem, VirtualScrollingList, mtPage },
  props: {
    curTab: { type: Number, default: 0 },
  },
  emits: [],
  setup(props) {
    const userInfo = loginStore().userInfo;

    const pageParams = ref({} as IPageParams);

    /** 筛选后的学生 */
    const filterStudents = ref([] as any[]);

    // 当前页面的所有学生，保存的时候需要
    const currentPageStudentList = ref([] as any[]);

    // 当前页面所有学生，筛选后的结果如果为空，但是allStudentList不为空，不能展示空组件
    const allStudentList = ref([] as any[]);

    // 在detail设置过的学生，最终保存的时候这部分用这个数据村，其他数据用generateData构造
    const tempStudentList = ref([]);

    // 构造成功数据需要有检查项（体温，xxx）
    const inspectionTaskList = ref([]);
    // 操作过任何一个学生的提交按钮，返回就要提示是否离开
    const showModal = ref(false);

    const uniqKey = ref(Date.now());
    const clazzName = ref('全部');
    const showClzPicker = ref(false);
    const classValue = reactive({
      array: [{ value: ' ' }] as any[],
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
            ...s,
            desc: s.clazzName ?? '/',
            photoUrl: childHeaderImg(s.photoUrl, s.gender),
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
      const data = Object.entries(second).map(arr => ({
        char: arr[0],
        dataList: arr[1],
      }));

      // 3. 转为符合组件格式的数据
      return data;
    };

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
          valueLabel: uniq(map(arrValue, item => item.label || '全部')).join('/'),
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

    const fetchInspectionTaskList = async () => {
      const { inspectionTaskId, type: _inspectionMode } = pageParams.value;
      const _inspectionTaskList = await getInspectionConfs(inspectionTaskId, _inspectionMode);
      inspectionTaskList.value = _inspectionTaskList;
    };

    watchEffect(() => {
      // 同时监听students, curTab, classValue, searchValue四个
      let studentList = [];
      try {
        studentList = JSON.parse(uni.getStorageSync('studentListForBatch'));
      } catch (error) {}
      if (!studentList?.length) return;
      const { curTab } = props;
      const filterStudentList = studentList
        // 筛选统计, 根据healthStatus字段
        .filter(tmp => {
          if (curTab === 0) return true; // 应检, 显示所有
          if (curTab === 1) return !isNil(tmp.healthStatus); // 已检
          if (curTab === 2) return isNil(tmp.healthStatus); // 未检
          return false;
        }) // 筛选名称
        .filter(tmp => tmp.name.includes(searchValue.value))
        // 筛选年级/班级
        .filter(tmp => {
          if (classValue.array.length < 2) return true;
          const _gradeId = classValue.array[0].value;
          const _clzId = classValue.array[1].value;
          if (_gradeId === '') return true;
          return tmp.gradeId === _gradeId && (_clzId === '' || tmp.clazzId === _clzId);
        });

      currentPageStudentList.value = filterStudentList;
      filterStudents.value = filterStudentList;
      allStudentList.value = studentList;
      uniqKey.value = Date.now();
    });

    const handleOpenPicker = ({ updateMenu }: any) => {
      showClzPicker.value = true;
      if (!handleUpdateMenu) {
        handleUpdateMenu = updateMenu;
      }
    };

    const listenChange = val => {
      // 已存在：替换
      if (tempStudentList.value.some(one => one.studentId === val?.studentId)) {
        const other = tempStudentList.value.filter(one => one.studentId !== val?.studentId) || [];
        tempStudentList.value = [...other, val];
      } else {
        // 不存在：插入
        tempStudentList.value = [...tempStudentList.value, val];
      }
    };

    // 生成默认的成功数据
    const generateData = ({ id: studentId, studentCode }) => {
      return {
        id: null,
        studentId,
        studentCode,
        itemDTOList: inspectionTaskList.value?.map(one => {
          return {
            detailList: [],
            id: null,
            inspectionTaskItemId: one?.id,
            inspectionTaskItemName: one?.name,
            inspectionTaskItemType: one?.type,
            inspectionTaskItemValue: '1',
            temperature: one?.type === 0 ? DEFAULT_NORMAL_TEMPERATURE : null,
          };
        }),
      };
    };

    // 批量提交
    const handleBatchCommit = async () => {
      const { inspectionTaskId, type: _inspectionMode } = pageParams.value;

      const form = {
        inspectionTaskId,
        inspectionMode: _inspectionMode,
        id: null, // 首先能进入批量页，都是没有记录的
        handler: userInfo.userName,
        handlerId: userInfo.id,
        studentList: currentPageStudentList.value
          ?.filter(c => !c.isLeave) //请假的在批量不能勾选，所以要过滤掉请假的
          ?.map(one => {
            const _temp = tempStudentList.value.find(t => t.studentId === one.id);
            if (_temp) {
              return _temp;
            }
            return generateData(one);
          }),
      };
      uni.showLoading({
        mask: true,
      });
      await postInspectionTaskSaveOrUpdate(form);
      uni.hideLoading();
      uni.$emit('Emit_Everyday_Student');
      uni.showToast({
        title: '提交成功',
        duration: 2000,
      });
      uni.navigateBack();
    };

    const dataToDetailData = _data => {
      const { comment, leaveSuggestion, id, itemDTOList } = _data;
      return {
        recordItemVOList: itemDTOList,
        comment,
        leaveSuggestion,
        id,
      };
    };

    const judgeIsNormal = _item => {
      const _temp = tempStudentList.value.find(one => one.studentId === _item?.id);
      if (_temp) {
        return _temp?.itemDTOList?.every(i => +i?.inspectionTaskItemValue === 1);
      }
      return true;
    };

    const jumpToCheck = _item => {
      // 批量的请假无法进入，外面列表的请假可以进入。
      if (_item.isLeave) {
        return;
      }
      const { inspectionTaskId, type: _inspectionMode } = pageParams.value;
      const title = HealthDayCheckType[_inspectionMode];

      const {
        age,
        birthday,
        certificateNumber: certificateNo,
        clazzId,
        clazzName,
        clazzNo,
        currentLevel,
        gender,
        gradeId,
        gradeName,
        sectionType,
        studentCode,
        id: studentId,
        name: studentName,
      } = _item;

      // 这个学生是否有设置过，有的话，把设置过的数据转换成batch detail页面需要的数据(getStudentRecord接口返回的数据，去取代接口获取)去赋值
      const hasSet = tempStudentList.value.find(one => one?.studentId === studentId);
      let toBatchDetailData = null;
      if (hasSet) {
        toBatchDetailData = dataToDetailData(hasSet);
      }

      let params = `title=${title}&inspectionTaskId=${inspectionTaskId}&type=${_inspectionMode}&studentInfo=${JSON.stringify(
        {
          age,
          birthday,
          certificateNo,
          clazzId,
          clazzName,
          clazzNo,
          currentLevel,
          gender,
          gradeId,
          gradeName,
          sectionType,
          studentCode,
          studentId,
          studentName,
        },
      )}`;
      params = params + `&toBatchDetailInspectionList=${JSON.stringify(inspectionTaskList.value)}`;

      if (toBatchDetailData) {
        params = params + `&toBatchDetailData=${JSON.stringify(toBatchDetailData)}`;
      }
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/check-detail/batch?${params}`,
      });
    };

    const handleModalConfirm = () => {
      uni.navigateBack({});
    };
    const handleModalCancel = () => {
      showModal.value = false;
    };

    const handleBack = () => {
      if (tempStudentList.value?.length > 0) {
        showModal.value = true;
        return;
      }
      uni.navigateBack({});
    };

    onBeforeMount(() => {
      const { inspectionTaskId, type, clazzList } = getPageParams();

      pageParams.value = {
        inspectionTaskId,
        type,
      };
      uni.$on('batch_detail_submit', listenChange);
      fetchClzTree();
      fetchInspectionTaskList();
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
      handleOpenPicker,
      uniqKey,
      handleBatchCommit,
      jumpToCheck,
      judgeIsNormal,
      handleBack,
      handleModalConfirm,
      handleModalCancel,
      showModal,
      currentPageStudentList,
      HealthDayCheckType,
      pageParams,
      allStudentList,
      clazzName,
    };
  },
});
</script>
<style lang="scss" scoped></style>
