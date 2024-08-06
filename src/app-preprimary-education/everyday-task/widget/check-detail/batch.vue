<template>
  <mt-page
    :title="`${pageParams.title || ''}详情`"
    theme="default"
    class-name="plr-l"
    :show-notice-bar="false"
  >
    <StudentProfile :student-info="pageParams.studentInfo" />
    <c-header class-name="mt-b">
      <view class="flex">
        <text class="font-title bold">检查事项</text>
        <text class="color-error ml-xxs">*</text>
      </view>
    </c-header>
    <InspectItem
      v-for="(item, inx) in inspectionConfs"
      :key="`item_${item.id}`"
      v-model:temperature="item.temperature"
      :item="item"
      :index="inx + 1"
      :student-id="pageParams.studentInfo.studentId"
    />
    <Suggest
      v-show="inspectionConfs?.some(one => +one?.inspectionTaskItemValue !== 1)"
      v-model:leaveSuggestion="suggestObj.leaveSuggestion"
      v-model:comment="suggestObj.comment"
    />
    <c-empty-line need-safe-bottom class-name="mtb-b" />
  </mt-page>
  <c-bottom>
    <u-button type="primary" @click="handleCommit">提交</u-button>
  </c-bottom>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  IInspectionConf,
  IInspectionTaskSaveOrUpdate,
  IStudentDTO,
} from '@/app-preprimary-education/services/health-day';
import { DEFAULT_NORMAL_TEMPERATURE } from '@/app-preprimary-education/utils/constant';
import { isNil } from '@/utils/lodash-es';
import { getPageParams, showInfo } from '@/utils/tools';
import { defineComponent, onBeforeMount, ref, toRaw } from 'vue';
import InspectItem from './components/inspect-item/index.vue';
import StudentProfile from './components/student-profile/index.vue';
import Suggest from './components/suggest/index.vue';

interface IPageParams {
  title: string;
  inspectionTaskId: string;
  type: 1 | 2 | 3;
  studentInfo: IStudentDTO;
}
export default defineComponent({
  components: { StudentProfile, InspectItem, Suggest, mtPage },
  setup() {
    const pageParams = ref({} as IPageParams);
    const inspectionConfs = ref([] as IInspectionConf[]);
    const suggestObj = ref({ comment: '', leaveSuggestion: 1 });
    const todayRecord = ref({} as IInspectionTaskSaveOrUpdate);

    const init = async () => {
      const { toBatchDetailData, toBatchDetailInspectionList } = pageParams.value;

      const confs = toBatchDetailInspectionList || [];

      todayRecord.value = toBatchDetailData || null;

      // 拼接confs与todayRecord, 生成表单的初始值（inspectionConfs和suggestObj）
      if (!todayRecord.value) {
        // 当天检查没有检测记录
        inspectionConfs.value = confs.map(tmp => ({
          ...tmp,
          inspectionTaskItemValue: '1',
          // 后续提交代码会进行过滤，处理体温项，其余项会设置成null
          temperature: DEFAULT_NORMAL_TEMPERATURE,
        }));
      } else {
        // 当天有检查记录
        const { comment, leaveSuggestion, recordItemVOList: confRecords } = todayRecord.value;
        inspectionConfs.value = confs.map(tmp => {
          const rcd = confRecords.find(t => t.inspectionTaskItemId === tmp.id);
          return {
            ...tmp,
            asRcdId: rcd?.id || null, // 检测项id与纪录id冲突, 先用这个代替, 提交的时候再取
            inspectionTaskItemValue: String(rcd?.inspectionTaskItemValue) || '1', // radio组件目前只支持string类型
            selected: rcd?.detailList.map(t => {
              return {
                id: t.inspectionItemValueId,
                sicknessCategoryId: t.sicknessCategoryId,
                sicknessSymptomId: t.sicknessSymptomId,
                abnormalValue: t.abnormalValue,
              };
            }),
            temperature: tmp.type === 0 ? rcd?.temperature : undefined,
          };
        });

        suggestObj.value = { comment, leaveSuggestion };
      }
    };

    onBeforeMount(() => {
      const {
        title,
        inspectionTaskId,
        type,
        studentInfo,
        toBatchDetailData,
        toBatchDetailInspectionList,
      } = getPageParams();
      pageParams.value = {
        title,
        inspectionTaskId,
        type,
        studentInfo: JSON.parse(studentInfo || '{}'),
        toBatchDetailData: JSON.parse(toBatchDetailData || 'null'),
        toBatchDetailInspectionList: JSON.parse(toBatchDetailInspectionList || '[]'),
      };
      init();
    });

    const validate = () => {
      // 1. 若有异常, 选项是必填
      const emptyItem = inspectionConfs.value.find(tmp => {
        if (tmp.inspectionTaskItemValue === '2') {
          // 体温
          if (tmp.type === 0 && isNil(tmp.temperature)) return true;
          // 其它
          if (tmp.type === 1 && !tmp.selected?.length) return true;
          return false;
        }
        return false;
      });
      if (emptyItem) {
        showInfo(`${emptyItem?.name}异常是必填项`);
        return false;
      }

      // 检验体温值的格式
      const validateTemp = inspectionConfs.value.find(tmp => {
        if (tmp.inspectionTaskItemValue === '2') {
          // 体温
          if (tmp.type === 0 && !/^[\d]+(.[\d]+)?$/.test(tmp.temperature || '0')) return true;
          return false;
        }
        return false;
      });
      if (validateTemp) {
        showInfo(`请输入小数`);
        return false;
      }
      return true;
    };

    const onCCModalClose = () => {
      uni.navigateBack();
    };

    const handleCommit = async () => {
      const { studentInfo } = pageParams.value;
      if (!validate()) {
        return false;
      }

      const confs = inspectionConfs.value.map(item => {
        const {
          id: inspectionTaskItemId,
          type: inspectionTaskItemType,
          name: inspectionTaskItemName,
          inspectionTaskItemValue,
          temperature,
          selected,
        } = item;
        return {
          id: item.asRcdId || null,
          inspectionTaskItemId,
          inspectionTaskItemType,
          inspectionTaskItemName,
          inspectionTaskItemValue,
          temperature: inspectionTaskItemType === 0 && temperature ? temperature : null,
          detailList:
            inspectionTaskItemValue === '2'
              ? selected?.map(({ id, abnormalValue, sicknessCategoryId, sicknessSymptomId }) => ({
                  inspectionItemValueId: id,
                  abnormalValue: abnormalValue,
                  sicknessCategoryId,
                  sicknessSymptomId,
                })) || []
              : [],
        };
      });

      try {
        uni.$emit('batch_detail_submit', {
          id: todayRecord.value?.id || null,
          ...toRaw(studentInfo),
          ...toRaw(suggestObj.value),
          itemDTOList: confs,
        });
        uni.navigateBack();
      } catch (e: any) {}
    };
    return { inspectionConfs, pageParams, suggestObj, handleCommit, onCCModalClose };
  },
});
</script>
