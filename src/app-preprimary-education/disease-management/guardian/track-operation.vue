<template>
  <mt-page title="疾病跟踪" :show-top-gap="false">
    <view class="padding">
      <!-- 康复信息 -->
      <view>
        <view class="font-content color-placeholder">康复信息</view>
        <c-card class="mt-xs">
          <view class="font-title">
            <view class="flex flex-between">
              <text>是否康复</text>
              <view
                class="label-name color-placeholder flex flex-end-center flex-center"
                @click="isSelectorShow.health = true"
              >
                <view class="over-ellipsis">{{ findItemWithCheckedInList(healthSelectList) }}</view>
                <c-icon name="icon_arrow_right" :size="48"></c-icon>
              </view>
            </view>
          </view>
          <view
            v-show="findItemWithCheckedInList(healthSelectList) === '是'"
            class="font-title mt-b"
          >
            <view class="flex flex-between">
              <text>复园日期</text>
              <view
                class="label-name color-placeholder flex flex-end-center flex-center"
                @click="isSelectorShow.calendar = true"
              >
                <view class="over-ellipsis">{{ calendarValue }}</view>
                <c-icon name="icon_arrow_right" :size="48"></c-icon>
              </view>
            </view>
          </view>
        </c-card>
      </view>
      <!-- 复园诊断书 -->
      <view v-if="findItemWithCheckedInList(healthSelectList) === '是'" class="mt-b">
        <c-card>
          <view>
            <view class="">
              <view class="font-title">复园诊断书</view>
              <c-images
                v-model:list="diagnoseImages"
                :max-count="5"
                :extension="extension"
                class-name="ptb-b"
                @onChooseImage="handleChooseDiagnoseImage"
              />
            </view>
          </view>
        </c-card>
      </view>
      <!-- 疾病信息 -->
      <view class="mt-l">
        <view class="font-content color-placeholder">疾病信息</view>
        <c-card class="mt-xs">
          <!-- 患病详情 -->
          <view class="font-title">
            <view class="flex flex-between">
              <text>疾病症状<text class="color-red">*</text></text>
              <view
                class="label-name color-placeholder flex flex-end-center flex-center"
                @click="handleEditSymptom"
              >
                <view class="over-ellipsis">{{ symptomListInText }}</view>
                <c-icon name="icon_arrow_right" :size="48"></c-icon>
              </view>
            </view>
          </view>
          <view class="font-title mt-b">
            <view class="flex flex-between">
              <text>是否就诊</text>
              <view
                class="label-name color-placeholder flex flex-end-center flex-center"
                @click="isSelectorShow.treatment = true"
              >
                <view class="over-ellipsis">{{
                  findItemWithCheckedInList(treatmentSelectList)
                }}</view>
                <c-icon name="icon_arrow_right" :size="48"></c-icon>
              </view>
            </view>
          </view>
          <view class="font-title mt-b">
            <view
              v-show="findItemWithCheckedInList(treatmentSelectList) === '是'"
              class="flex flex-between"
            >
              <text>就诊医院<text class="color-red">*</text></text>
              <view class="label-name color-placeholder flex flex-end-center flex-center">
                <c-input
                  v-model:value="hosipital"
                  height-size="cell-mini"
                  align="right"
                  :maxlength="20"
                  @blur="handleCheckHosipitalName"
                ></c-input>
              </view>
            </view>
          </view>
          <view class="font-title mt-b">
            <view
              v-show="findItemWithCheckedInList(treatmentSelectList) === '是'"
              class="flex flex-between"
            >
              <text>诊断疾病名称<text class="color-red">*</text></text>
              <view
                class="color-placeholder flex flex-end-center flex-center"
                @click="handleBeforeSicknessSelect"
              >
                <view class="">{{ findItemWithCheckedInList(sicknessLabels) }}</view>
                <c-icon name="icon_arrow_right" :size="48"></c-icon>
              </view>
            </view>
            <view
              v-show="
                findItemWithCheckedInList(treatmentSelectList) === '是' &&
                findItemWithCheckedInList(sicknessLabels) === '自定义'
              "
              class="mt-xs"
            >
              <c-input
                v-model:value="sicknessLabelName"
                height-size="cell-mini"
                align="right"
                :maxlength="20"
                @focus="isValidate = false"
                @blur="handleCheckLabel"
              ></c-input>
            </view>
          </view>
        </c-card>
      </view>
      <!-- 病例报告 -->
      <view v-if="findItemWithCheckedInList(treatmentSelectList) === '是'" class="mt-b">
        <c-card>
          <view>
            <view>
              <view class="font-title">病例报告</view>
              <c-images
                v-model:list="reportImages"
                :max-count="5"
                :extension="extension"
                class-name="ptb-b"
                @onChooseImage="handleChooseReportImage"
              />
            </view>
          </view>
        </c-card>
      </view>
    </view>
    <c-empty-line height="150rpx" />
    <c-bottom>
      <u-button type="primary" @click="handleSubmit">保存</u-button>
    </c-bottom>
    <!-- 是否康复 -->
    <c-select
      v-model:show="isSelectorShow.health"
      v-model:list="healthSelectList"
      :auto-close-after-select="true"
      :show-check-icon="true"
      title-type="icon"
      title="是否康复"
    ></c-select>
    <!-- 复园日期 -->
    <c-calendar
      v-model:open="isSelectorShow.calendar"
      v-model="calendarValue"
      mode="date"
      max-date="9999-12-31"
      z-index="10000000"
    />
    <!-- 是否就诊 -->
    <c-select
      v-model:show="isSelectorShow.treatment"
      v-model:list="treatmentSelectList"
      :auto-close-after-select="true"
      :show-check-icon="true"
      title-type="icon"
      title="是否就诊"
    ></c-select>
    <!-- 诊断疾病名称 -->
    <c-select
      v-model:show="isSelectorShow.sickness"
      v-model:list="sicknessLabels"
      :auto-close-after-select="true"
      :show-check-icon="true"
      title-type="icon"
      title="疾病名称"
    ></c-select>
  </mt-page>
</template>

<script lang="ts" setup>
import { Disease_Management, useStore } from '@/store/old';
import { batchUploadChoosedImages } from '@/utils/upload-medias';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, reactive, ref, watch } from 'vue';
import mtPage from '../../components/mt-page/mt-page.vue';
import {
  SaveSicknessTraceRecordParam,
  checkSicknessLabelName,
  fetchSicknessLabels,
  fetchStudentDiseaseTrackingDetail,
  saveSicknessTraceRecords,
  updateSicknessTraceRecords,
} from '../../services/disease-management';
import { SymptomItem } from '../types/record';
// import { batchUploadChoosedImages } from '@/utils/upload-oss';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { cloneDeep } from 'lodash-es';

dayjs.extend(isSameOrAfter);

const extension = ['jpeg', 'jpg', 'png'];

const store = useStore();

const recordId = ref('');

const traceRecordId = ref('');

const sicknessLabelName = ref('');

const isValidate = ref(false);

const sickenDate = ref('');

const symptomList = computed(() => {
  return store.state.diseaseManagement.symptomList;
});

const symptomListInText = computed(() => {
  return symptomList.value.map(item => item.symptomName).join(',');
});
const handleEditSymptom = () => {
  // store.commit(Disease_Management.saveSymptomInfo, []);
  uni.navigateTo({
    url: `/app-preprimary-education/disease-management/guardian/disease-selector`,
  });
};

const isSelectorShow = reactive({
  health: false,
  calendar: false,
  treatment: false,
  sickness: false,
});

const healthSelectList = ref([
  {
    text: '是',
    checked: false,
  },
  {
    text: '否',
    checked: false,
  },
]);

const calendarValue = ref(dayjs().format('YYYY-MM-DD'));

const treatmentSelectList = ref([
  {
    text: '是',
    checked: false,
  },
  {
    text: '否',
    checked: false,
  },
]);

const hosipital = ref('');

const findItemWithCheckedInList = (list: any[]) => {
  if (!list?.length) return '';
  return list.find(item => item.checked)?.text;
};

const sicknessLabels = ref<
  {
    text: string;
    checked: boolean;
  }[]
>([]);

const handleBeforeSicknessSelect = () => {
  if (!symptomList.value?.length)
    uni.showToast({
      title: '请先选择疾病症状',
      icon: 'none',
      duration: 1000,
    });
  else isSelectorShow.sickness = true;
};

/* 编辑时的扳机 */
const sicknessLabelTrigger = ref<string | boolean>(true);

const setSicknessLabels = async (newSymptomList: SymptomItem[]) => {
  const res = await fetchSicknessLabels({
    symptomIds: newSymptomList.map(item => item.symptomId),
  });
  const newArr = [
    ...res.map(item => {
      return {
        text: item.name,
        checked: false,
      };
    }),
    {
      text: '自定义',
      checked: false,
    },
  ];
  if (sicknessLabelTrigger.value && !!traceRecordId.value) {
    if (!!sicknessLabelName.value) {
      //有自定义的标签名
      const index = newArr.findIndex(item => item.text === '自定义');
      if (index >= 0) newArr[index].checked = true;
    } else {
      const index = newArr.findIndex(item => item.text === sicknessLabelTrigger.value);
      if (index >= 0) newArr[index].checked = true;
    }
    sicknessLabelTrigger.value = false; //确保只在编辑态且只触发一次
  }
  sicknessLabels.value = newArr;
};

watch(
  () => symptomList.value,
  newSymptomList => {
    if (!newSymptomList?.length) return;
    else {
      setSicknessLabels(newSymptomList);
    }
  },
);
/* 复园诊断书 */
const diagnoseImages = ref<any[]>([]);

const handleChooseDiagnoseImage = async (files: any[]) => {
  const res: any[] = await batchUploadChoosedImages(files);
  const arr = cloneDeep(diagnoseImages.value);
  arr.push(...res);
  diagnoseImages.value = arr;
};

const reportImages = ref<any[]>([]);

const handleChooseReportImage = async (files: any[]) => {
  const res: any[] = await batchUploadChoosedImages(files);
  const arr = cloneDeep(reportImages.value);
  arr.push(...res);
  reportImages.value = arr;
};

const reg = /^(?!.*\s{2})(?!\s*$)[\u4e00-\u9fa5a-zA-Z0-9\s]+$/;

const isHosipitalNameValidate = ref(false);

const handleCheckHosipitalName = async (val: string) => {
  if (!reg.test(val)) {
    isHosipitalNameValidate.value = false;
    uni.showToast({
      title: '就诊医院只支持输入中/英文、数字',
      icon: 'none',
      duration: 3000,
    });
  } else {
    isHosipitalNameValidate.value = true;
  }
};

const isDiseaseNameValidate = ref(false);

const handleCheckLabel = async (val: string) => {
  if (!reg.test(val)) {
    isDiseaseNameValidate.value = false;
    uni.showToast({
      title: '诊断疾病名称只支持输入中/英文、数字',
      icon: 'none',
      duration: 3000,
    });
  } else {
    isDiseaseNameValidate.value = true;
  }
  if (!!sicknessLabelName.value) {
    const res = await checkSicknessLabelName({
      name: sicknessLabelName.value,
    });
    if (!res) isValidate.value = true;
    else {
      uni.showToast({
        title: '疾病名称已存在',
        icon: 'none',
        duration: 1500,
      });
    }
  }
};

const validateBeforeSubmit = () => {
  if (findItemWithCheckedInList(healthSelectList.value) === '是') {
    if (!dayjs(calendarValue.value).isSameOrAfter(Number(sickenDate.value))) {
      uni.showToast({
        title: '复园日期需要大于等于患病日期',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  }

  if (!symptomList.value?.length) {
    uni.showToast({
      title: '请选择疾病症状',
      icon: 'none',
      duration: 1500,
    });
    return false;
  }

  if (findItemWithCheckedInList(treatmentSelectList.value) === '是') {
    if (!isHosipitalNameValidate.value) {
      uni.showToast({
        title: '就诊医院只支持输入中/英文、数字',
        icon: 'none',
        duration: 3000,
      });
      return false;
    }
    if (!symptomList.value) {
      uni.showToast({
        title: '请选择疾病症状',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    if (!hosipital.value) {
      uni.showToast({
        title: '请输入就诊医院名',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    if (findItemWithCheckedInList(sicknessLabels.value) === '自定义') {
      if (!isDiseaseNameValidate.value) {
        uni.showToast({
          title: '诊断疾病名称只支持输入中/英文、数字',
          icon: 'none',
          duration: 3000,
        });
        return false;
      }
      if (!isValidate.value) {
        uni.showToast({
          title: '自定义就诊疾病名称未通过验证',
          icon: 'none',
          duration: 1500,
        });
        return false;
      }
      if (!sicknessLabelName.value) {
        uni.showToast({
          title: '请输入自定义就诊疾病名称',
          icon: 'none',
          duration: 1500,
        });
        return false;
      }
    } else if (!findItemWithCheckedInList(sicknessLabels.value)) {
      uni.showToast({
        title: '请选择就诊疾病名称',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateBeforeSubmit()) return;
  const fileList = [];
  if (diagnoseImages.value?.length)
    fileList.push(
      ...diagnoseImages.value.map(item => {
        return {
          fileUrl: item.url,
          fileId: item.fileId,
          type: 1,
        };
      }),
    );
  if (reportImages.value?.length)
    fileList.push(
      ...reportImages.value.map(item => {
        return {
          fileUrl: item.url,
          fileId: item.fileId,
          type: 2,
        };
      }),
    );
  const params: SaveSicknessTraceRecordParam = {
    recordId: recordId.value,
    customFlag: findItemWithCheckedInList(sicknessLabels.value) === '自定义' ? 1 : 0,
    fileList: fileList,
    healthDate: calendarValue.value,
    healthFlag: findItemWithCheckedInList(healthSelectList.value) === '是' ? 1 : 0,
    hospital: hosipital.value,
    outpatientFlag: findItemWithCheckedInList(treatmentSelectList.value) === '是' ? 1 : 0,
    sicknessLabelName:
      findItemWithCheckedInList(sicknessLabels.value) === '自定义'
        ? sicknessLabelName.value
        : findItemWithCheckedInList(sicknessLabels.value),
    symptomList: symptomList.value?.length
      ? symptomList.value.map(item => {
          return {
            id: item.symptomId,
            name: item.symptomName,
            categoryId: item.categoryId,
          };
        })
      : [],
    userSource: 1,
  };

  if (!!traceRecordId.value) {
    params.id = traceRecordId.value;
    await updateSicknessTraceRecords(params);
  } else {
    await saveSicknessTraceRecords(params);
  }
  uni.showToast({
    title: '保存成功',
    icon: 'none',
    duration: 4000,
  });
  uni.$emit('disease-management:modify');
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};

const initData = () => {
  healthSelectList.value[0].checked = true;
  treatmentSelectList.value[0].checked = true;
};

const initDataWithTraceRecordId = async (id: string) => {
  const res = await fetchStudentDiseaseTrackingDetail(id);
  isHosipitalNameValidate.value = true;
  isDiseaseNameValidate.value = true;

  /* 注入疾病症状列表 */
  store.commit(Disease_Management.saveSymptomInfo, res?.symptomList ?? []);

  diagnoseImages.value = res.fileList?.length
    ? res.fileList
        .filter(item => item.type === 1)
        .map(item => {
          return {
            fileId: item.fileId,
            type: 1,
            url: item.fileUrl,
          };
        })
    : [];

  reportImages.value = res.fileList?.length
    ? res.fileList
        .filter(item => item.type === 2)
        .map(item => {
          return {
            fileId: item.fileId,
            type: 1,
            url: item.fileUrl,
          };
        })
    : [];
  if (res?.healthDate) calendarValue.value = res.healthDate;
  healthSelectList.value[res.healthFlag === 1 ? 0 : 1].checked = true;
  hosipital.value = res.hospital;
  treatmentSelectList.value[res.outpatientFlag === 1 ? 0 : 1].checked = true;
  if (res.customFlag === 1) {
    sicknessLabelName.value = res.sicknessLabelName;
    isValidate.value = true;
  } else {
    sicknessLabelTrigger.value = res.sicknessLabelName;
  }
};

onLoad((option: any) => {
  recordId.value = option.recordId;
  traceRecordId.value = option.traceRecordId;
  sickenDate.value = option.sickenDate;
  if (!option.traceRecordId) initData();
  else initDataWithTraceRecordId(option.traceRecordId);
});

onUnload(() => {
  store.commit(Disease_Management.clearSymptomInfo);
});
</script>

<style lang="scss" scoped>
.padding {
  padding: 33rpx;
}
.over-ellipsis {
  text-align: right;
  width: 450rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.color-red {
  color: red;
}
</style>
