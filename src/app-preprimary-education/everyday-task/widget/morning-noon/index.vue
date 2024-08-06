<template>
  <mt-page title="一日三检" theme="default" :show-notice-bar="false" :show-top-gap="false">
    <template v-if="list.length">
      <c-top>
        <u-tabs
          v-model="current"
          :list="tabList"
          @change="onChange"
          :active-color="primaryColor"
          :is-scroll="false"
        >
        </u-tabs>
      </c-top>

      <template v-if="hasInspectionItem">
        <template v-if="dailyHealth?.students?.length > 0">
          <StudentIndex :cur-tab="0" :student-list="dailyHealth?.students" />
        </template>
        <c-empty v-else bg-type="fill-default" content="暂无待检查的学生" />
      </template>
      <c-empty v-else bg-type="fill-default" content="暂无检查任务" />
    </template>
    <c-empty v-else bg-type="fill-default" content="暂无检查任务" />
  </mt-page>
  <HistoryRcd />
</template>
<script lang="ts">
import {
  IGetHealthDayTasks,
  IgetStudentList,
  getHealthDayTasks,
  getStudentList,
} from '@/app-preprimary-education/services/health-day';
import { HealthDayCheckType } from '@/app-preprimary-education/utils/constant';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import { defineComponent, onBeforeMount, onBeforeUnmount, provide, reactive, ref } from 'vue';
import StudentIndex from '../task-check/components/student-index/index.vue';

import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { loginStore } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import HistoryRcd from './components/history-rcd/index.vue';
export default defineComponent({
  components: { StudentIndex, HistoryRcd, mtPage },
  onShow() {
    uni.$emit('Emit_Everyday_Task');
  },
  setup() {
    const list = ref([] as IGetHealthDayTasks[]);
    const inspectionTaskId = ref('');
    const hasInspectionItem = ref(false);
    // 获取主题色
    const primaryColor = getPrimaryColor();
    // tab onchange给的是索引
    const current = ref(0);
    const tabList = ref([]);
    const curClickStudent = ref({} as IgetStudentList);
    const dailyHealth = reactive({ students: [] });

    const userInfo = loginStore().userInfo;

    const fetchStudentList = async () => {
      dailyHealth.students = [];
      uni.setStorageSync('studentListForBatch', '[]');
      showLoading();
      try {
        const students = await getStudentList(
          tabList.value[current.value]?.value,
          inspectionTaskId.value,
        );
        const fixHeaderImgStudents = students?.map(one => {
          return {
            ...one,
            photoUrl: childHeaderImg(one.photoUrl, one.gender),
          };
        });

        dailyHealth.students = fixHeaderImgStudents;
        uni.setStorageSync('studentListForBatch', JSON.stringify(fixHeaderImgStudents));
      } catch (error) {}
      hideLoading();
    };

    /**tab切换*/
    const onChange = (val: number) => {
      current.value = val;
      hasInspectionItem.value = !!list.value?.[current.value]?.hasInspectionItem;
      // 放在fetchStudentList去清空
      // dailyHealth.students = [];
      fetchStudentList();
    };

    const init = async () => {
      const res = await getHealthDayTasks(userInfo.id);
      if (!res) return;
      list.value = res.inspectionDeatil;
      // 1-晨检, 2-午检, 3-晚检
      tabList.value = res.inspectionDeatil?.map(one => {
        return {
          name: `${HealthDayCheckType[one.inspectionMode]}（${one.unInspectedNum ?? 0}）`,
          value: one.inspectionMode,
        };
      });
      inspectionTaskId.value = res.inspectionTaskId;
      hasInspectionItem.value = !!list.value?.[current.value]?.hasInspectionItem;
    };
    onBeforeMount(() => {
      init().then(fetchStudentList);
      uni.$on('Emit_Everyday_Task', init);
      uni.$on('Emit_Everyday_Student', fetchStudentList);
    });

    onBeforeUnmount(() => {
      uni.$off('Emit_Everyday_Task', init);
      uni.$off('Emit_Everyday_Student', fetchStudentList);
    });

    const jumpToCheck = () => {
      const _inspectionMode = tabList.value[current.value]?.value;
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
      } = curClickStudent.value;
      const params = `title=${title}&inspectionTaskId=${
        inspectionTaskId.value
      }&type=${_inspectionMode}&studentInfo=${JSON.stringify({
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
      })}`;
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/check-detail/index?${params}`,
      });
    };

    const injectCurSelectStudent = (item: IgetStudentList) => {
      curClickStudent.value = item;

      jumpToCheck();
    };

    const goBatchPage = () => {
      const _inspectionMode = tabList.value[current.value]?.value;
      const { clazzList } = getPageParams();
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/morning-noon/batch?type=${_inspectionMode}&inspectionTaskId=${inspectionTaskId.value}&clazzList=${clazzList}`,
      });
    };

    const injectGoBatchPage = () => {
      goBatchPage();
    };

    provide('injectCurSelectStudent', {
      injectCurSelectStudent,
    });

    provide('injectGoBatchPage', {
      injectGoBatchPage,
    });

    return {
      list,
      inspectionTaskId,
      onChange,
      tabList,
      current,
      dailyHealth,
      hasInspectionItem,
      primaryColor,
    };
  },
});
</script>
