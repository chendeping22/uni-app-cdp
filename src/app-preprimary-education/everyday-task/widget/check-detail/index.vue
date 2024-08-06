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
    <c-empty-line need-safe-bottom class-name="mtb-b" height="170rpx" />
  </mt-page>
  <c-bottom>
    <u-button type="primary" @click="handleCommit">提交</u-button>
  </c-bottom>
  <c-modal
    v-model:show="showCCModal"
    :has-cancel="false"
    confirm-text="知道了"
    class="cc-confirm-modal"
    @onConfirm="onCCModalClose"
  >
    <view> 该学生当天已有请假记录，不再额外生成离园异常请假</view>
  </c-modal>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  IInspectionConf,
  IInspectionTaskSaveOrUpdate,
  IStudentDTO,
  getInspectionConfs,
  getInspectionStudentRecord,
  postInspectionTaskSaveOrUpdate,
} from '@/app-preprimary-education/services/health-day';
import { loginStore } from '@/store/modules/login';
import { isNil } from '@/utils/lodash-es';
import { defaultFailText } from '@/utils/request';
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
    const userInfo = loginStore().userInfo;
    const pageParams = ref({} as IPageParams);
    const inspectionConfs = ref([] as IInspectionConf[]);
    const suggestObj = ref({ comment: '', leaveSuggestion: 1 });
    const todayRecord = ref({} as IInspectionTaskSaveOrUpdate);
    const showCCModal = ref<boolean>(false); // 弹窗显示

    const init = async () => {
      const { inspectionTaskId, type: inspectionMode, studentInfo } = pageParams.value;
      const confs = await getInspectionConfs(inspectionTaskId, inspectionMode);
      todayRecord.value = await getInspectionStudentRecord(
        studentInfo.studentId,
        inspectionTaskId,
        inspectionMode,
      );

      // 拼接confs与todayRecord, 生成表单的初始值（inspectionConfs和suggestObj）
      if (!todayRecord.value) {
        // 当天检查没有检测记录
        inspectionConfs.value = confs.map(tmp => ({
          ...tmp,
          inspectionTaskItemValue: '1',
          temperature: '37.0',
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
      const { title, inspectionTaskId, type, studentInfo } = getPageParams();
      pageParams.value = {
        title,
        inspectionTaskId,
        type,
        studentInfo: JSON.parse(studentInfo || '{}'),
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
      const { studentInfo, inspectionTaskId, type: inspectionMode } = pageParams.value;
      if (!validate()) {
        return false;
      }
      const formBase = {
        inspectionTaskId,
        inspectionMode,
        id: todayRecord.value?.id || null,
        handler: userInfo.userName,
        handlerId: userInfo.id,
      } as IInspectionTaskSaveOrUpdate;

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

      const newForm = {
        ...formBase,
        studentList: [
          {
            id: todayRecord.value?.id || null,
            ...toRaw(studentInfo),
            ...toRaw(suggestObj.value),
            itemDTOList: confs,
          },
        ],
      };

      try {
        // throw { code: 880001 };
        await postInspectionTaskSaveOrUpdate(newForm);
        uni.$emit('Emit_Everyday_Student');

        uni.navigateBack();
      } catch (e: any) {
        const { code } = e;
        if (code === 880001) {
          showCCModal.value = true;
        } else {
          showInfo(defaultFailText(e));
        }
      }
    };
    return { inspectionConfs, pageParams, suggestObj, showCCModal, handleCommit, onCCModalClose };
  },
});
</script>
