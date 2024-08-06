<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :auto-show-left-icon="false">
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <view class="page-padding">
      <view class="setting" @click="openWeekPickerEvent">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text class="mr-s" style="color: red">*</text>
            <text>选择周次</text>
          </view>
          <view class="setting-item-btn flex">
            <text>
              {{ timeListOpts.find(item => item.checked === true)?.text }}
            </text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="setting" @click="openClassPickerEvent">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text class="mr-s" style="color: red">*</text>
            <text>发布班级</text>
          </view>
          <view class="setting-item-btn flex">
            <text> {{ curClazz.title || '请选择' }}</text>

            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="setting" @click="openTypePickerEvent">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text>发布格式</text>
          </view>
          <view class="setting-item-btn flex">
            <text> {{ publishTypeListOpts[publishType].text }}</text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="pic mtb-under" v-if="!publishType">
        <view class="flex-between">
          <view class="pic-title">
            <text>图片</text>
          </view>
          <view class="flex">
            <c-image
              class="mr-l"
              :src="iconPunchCamera"
              width="46"
              height="46"
              @click="cameraEvent"
            />
            <c-image
              class="pr-l"
              :src="iconPunchPhoto"
              width="46"
              height="46"
              @click="pictureEvent"
            />
          </view>
        </view>
        <view class="mt-l">
          <Midias :model="''" :medias="imageList.array" @delete="handleDeleteImage" />
        </view>
      </view>
      <view v-else>
        <view class="flex color-placeholder font-secondary mt-b ml-s">
          <c-icon name="icon_state_warn" :size="34" color-type="placeholder" />
          <text class="ml-xxs">教学计划模版信息可在网页端的模版设置中编辑</text>
        </view>
        <view class="setting" @click="openTemplatePickerEvent">
          <view class="setting-item">
            <view class="setting-item-prefix">
              <text>教学计划模板</text>
            </view>
            <view class="setting-item-btn flex">
              <text class="template-name"> {{ templateListOpts[templateNo]?.text || '' }}</text>
              <c-icon name="icon_arrow_right" size="48"></c-icon>
            </view>
          </view>
        </view>
        <view class="des" v-for="project in planWeeklyDetailDtos" :key="project.id">
          <view class="des-title">{{ project.name }}</view>
          <c-input
            v-model:value="project.content"
            placeholder="请输入"
            type="textarea"
            height="240rpx"
            maxlength="1000"
            class-name="des-textarea"
            :show-clear="false"
          ></c-input>
          <view class="des-number mr-">
            <text class="color-placeholder"> {{ project.content?.length || 0 }}/1000 </text>
          </view>
        </view>
      </view>
    </view>
    <c-bottom>
      <view class="flex-around">
        <c-button
          v-if="isEdit"
          :width="'320rpx'"
          :custom-style="{ border: '1rpx solid #176BFB' }"
          type="plain"
          height-size="button-s"
          @click="openDeleteEvent"
        >
          <u-image
            :src="iconDelete"
            :width="36"
            :height="36"
            class="lh-0 pr-xs"
            :show-loading="false"
          />
          <text class="font-title">删除</text>
        </c-button>

        <c-button
          :width="isEdit ? '320rpx' : '680rpx'"
          height-size="button-s"
          @click="handleSubmit"
        >
          <u-image
            :src="iconSubmit"
            :width="36"
            :height="36"
            class="lh-0 pr-xs"
            :show-loading="false"
          />
          <text class="font-title">保存</text>
        </c-button>
      </view>
    </c-bottom>
  </mt-page>
  <ClazzPicker
    v-model:show="isOpenClass"
    v-model:value="curSelectClazz"
    @onLoadPicker="handleLoadPicker"
  />
  <c-select
    v-model:show="isOpenWeek"
    v-model:list="timeListOpts"
    :auto-close-after-select="true"
    :show-check-icon="true"
    title="请选择"
    title-type="icon"
    @onSelect="handleTimeRangeChange"
  />
  <c-select
    v-model:show="isOpenType"
    v-model:list="publishTypeListOpts"
    :auto-close-after-select="true"
    :show-check-icon="true"
    title="请选择"
    title-type="icon"
    @onSelect="handleTypeSelect"
  />
  <c-select
    v-model:show="isOpenTemplate"
    v-model:list="templateListOpts"
    :auto-close-after-select="true"
    :show-check-icon="true"
    title="请选择"
    title-type="icon"
    @onSelect="handleTemplateSelect"
  />
  <c-modal v-model:show="showDeleteModal" @onConfirm="handleDeletePlan">
    <view class="text-center font-title"> 是否删除此教学计划 </view>
  </c-modal>
  <c-modal v-model:show="showBackModal" @onConfirm="modalConfirm.event">
    <view class="text-center font-title"> 确定要返回吗 </view>
  </c-modal>
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import Midias from '@/app-preprimary-education/observation-record/components/task-detail-card/medias.vue';
import iconDelete from '@/app-preprimary-education/static/image/delete_line_icon.png';
import iconSubmit from '@/app-preprimary-education/static/image/submit_icon.png';
import iconPunchCamera from '@/app-preprimary-education/static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';

import { getPageParams, showInfo } from '@/utils/tools';
import { chooseAndUploadImage } from '@/utils/upload-medias';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { computed, onBeforeMount, reactive, ref, watchEffect } from 'vue';
import ClazzPicker, { IPicker } from './components/clazz-picker/index.vue';
import { UPLOAD_IMAGE_DEFAULT_SIZE_TYPE, UPLOAD_IMAGE_MAX_SIZE } from './utils/constants';
import {
  deletePlanWeekly,
  findAllTemplate,
  findTemplateConfig,
  getPlanWeeklyInfo,
  savePlanWeekly,
  updatePlanWeekly,
} from './utils/service';
interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
interface IClazz {
  title: string;
  clazzId: string;
}

dayjs.extend(weekOfYear);
dayjs.locale('zh-cn');
const TOTAL_WEEK = 13;

const title = computed(() => (isEdit.value === 1 ? '编辑教学计划' : '新建教学计划'));

const staticWeekNum = dayjs().week();
const isEdit = ref(0);
const currentId = ref('');
/** 周次选择弹窗 - 显隐 */
const isOpenWeek = ref(false);
/** 班级选择弹窗 - 显隐 */
const isOpenClass = ref(false);
/** 发布格式选择弹窗 - 显隐 */
const isOpenType = ref(false);
/** 教学计划模板选择弹窗 - 显隐 */
const isOpenTemplate = ref(false);
/** 删除弹窗 - 显隐 */
const showDeleteModal = ref(false);
/** 是否返回弹窗 - 显隐 */
const showBackModal = ref(false);
/** 是否已进行编辑 */
const hasChanged = ref(false);
/** 发布格式类型 0-图片版 1-文字版 */
const publishType = ref(0);
/** 教学计划模板 */
const templateId = ref('');
/** 教学计划模板 */
const template = ref({});
/** 教学计划模板 */
const templateNo = ref(0);
/** 弹窗确认事件 */
const modalConfirm = reactive({ event: () => {} });
const planWeeklyDetailDtos = ref<any>([]);
const curClazz = ref({} as IClazz);

/** 当前选中的班级 */
const curSelectClazz = ref([] as { value: any; label?: string }[]);

/** 当前的周数 */
const currentWeekNum = reactive({ value: staticWeekNum });

/** 上传图片列表 */
const imageList = reactive<{ array: { fileId: string; url: string; kind: string }[] }>({
  array: [],
});

/** 发布格式选择项 */
const publishTypeListOpts = ref([
  { text: '图片版', checked: true, value: 2 },
  { text: '文字版', checked: false, value: 1 },
]);

/** 教学计划模板选择项 */
const templateListOpts = ref([]);

/** 周数选择项 */
const timeListOpts = computed(() => {
  const weekIdx: any[] = [];
  for (let i = -TOTAL_WEEK; i <= TOTAL_WEEK; i++) {
    weekIdx.push(i + staticWeekNum);
  }
  const opts = weekIdx.map((idx: number) => {
    const start = dayjs().week(idx).startOf('week');
    const end = dayjs().week(idx).endOf('week');
    const year = start.year();
    const weekNum = start.week();
    return {
      text: `${year}-第${weekNum}周(${start.format('MM-DD')}~${end.format('MM-DD')})`,
      checked: idx === staticWeekNum,
      weekNum: idx,
    };
  });
  return opts;
});

/** 打开选择周次列表 */
const openWeekPickerEvent = () => {
  if (isEdit.value) {
    showInfo('周次暂不支持修改');
    return;
  }
  isOpenWeek.value = true;
};

/** 打开选择发布班级列表 */
const openClassPickerEvent = () => {
  if (isEdit.value) {
    showInfo('班级暂不支持修改');
    return;
  }
  isOpenClass.value = true;
};

/** 打开选择发布格式列表 */
const openTypePickerEvent = () => {
  isOpenType.value = true;
};

/** 打开选择教学计划模板列表 */
const openTemplatePickerEvent = () => {
  isOpenTemplate.value = true;
};

/** 打开删除弹窗 */
const openDeleteEvent = () => {
  showDeleteModal.value = true;
};

/** 选择发布格式 */
const handleTypeSelect = (index: number) => {
  publishType.value = index;
  hasChanged.value = true;
};

/** 选择教学计划模板 */
const handleTemplateSelect = async (index: number) => {
  templateNo.value = index;
  templateId.value = templateListOpts.value[templateNo.value].id;
  loadTemplateConfig();
  hasChanged.value = true;
};

/** 删除 */
const handleDeletePlan = async () => {
  try {
    await deletePlanWeekly(currentId.value);
    showInfo('删除成功');
    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.desc);
  }
};

/** 保存 */
const handleSubmit = async () => {
  if (!curClazz.value) {
    showInfo('请选择班级');
    return;
  }
  if (!currentWeekNum.value) {
    showInfo('请选择周次');
    return;
  }
  if (publishType.value === 0 && !imageList.array.length) {
    showInfo('请上传图片');
    return;
  }
  if (imageList.array.length > 1) {
    showInfo('最多上传1张图片');
    return;
  }
  const list = planWeeklyDetailDtos.value.map((item: any) => ({
    itemId: item.id,
    content: item.content,
  }));
  const extra =
    publishType.value === 1
      ? {
          templateId: templateId.value,
          planWeeklyDetailDtos: list,
          fileId: '',
          fileUrl: '',
        }
      : {
          fileId: imageList.array[0].fileId,
          fileUrl: imageList.array[0].url,
        };

  const params = {
    clazzId: curClazz.value.clazzId,
    year: dayjs().week(currentWeekNum.value).year(),
    week: currentWeekNum.value,
    startDate: dayjs().week(currentWeekNum.value).startOf('week').valueOf(),
    endDate: dayjs().week(currentWeekNum.value).endOf('week').startOf('day').valueOf(),
    publishFormat: publishTypeListOpts.value[publishType.value].value,
    ...extra,
  };

  try {
    if (currentId.value) await updatePlanWeekly({ ...params, id: currentId.value });
    else await savePlanWeekly(params);
    showInfo('保存成功');
    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.desc);
  }
};

/** 上传图片 */
const imageEvent = (typeList: any) => {
  chooseAndUploadImage(
    [],
    1,
    false,
    false,
    false,
    UPLOAD_IMAGE_MAX_SIZE,
    true,
    typeList,
    true,
    UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  ).then((files: any) => {
    const data = files[1]?.map((item: SportsTaskMedia) => {
      return {
        ...item,
        kind: 'image',
        url: item?.url,
      };
    });
    imageList.array.push(...data);
    hasChanged.value = true;
  });
};

/** 点击图片列表删除图标 */
const handleDeleteImage = (index: number) => {
  imageList.array.splice(index, 1);
  hasChanged.value = true;
};

/** 打开相册 */
const pictureEvent = () => {
  if (imageList.array.length >= 1) {
    showInfo('最多上传1张图片');
    return;
  }
  imageEvent(['album']);
};

/** 打开摄像头 */
const cameraEvent = () => {
  if (imageList.array.length >= 1) {
    showInfo('最多上传1张图片');
    return;
  }
  imageEvent(['camera']);
};

/** 返回上一页 */
const backPage = () => {
  uni.navigateBack();
};

/** 点击返回，验证是否改动 */
const handleBack = () => {
  if (hasChanged.value) {
    showBackModal.value = true;
    modalConfirm.event = backPage;
    return;
  }
  backPage();
};

/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    showInfo('暂无可查看班级');
    return;
  }
};

/** 加载模板数据 */
const loadTemplateConfig = async () => {
  const res: any = await findTemplateConfig(templateId.value);
  planWeeklyDetailDtos.value = res.items;
};

/** 获取模板列表 */
const handleLoadTemplate = async (id?: string) => {
  const res: any = await findAllTemplate();
  const curId = id ? id : res[0].id;
  templateListOpts.value = res.map((item: any, index: number) => {
    if (curId === item.id) templateNo.value = index;
    return {
      text: item.name,
      id: item.id,
      checked: curId === item.id,
    };
  });
  templateId.value = templateListOpts.value[templateNo.value].id;
  if (!id || publishType.value === 0) loadTemplateConfig();
};

/** 周次选择变化 */
const handleTimeRangeChange = (idx: number) => {
  const curCheckedIdx = timeListOpts.value.findIndex(item => item.checked === true);
  timeListOpts.value.splice(curCheckedIdx, 1, {
    ...timeListOpts.value[curCheckedIdx],
    checked: false,
  });
  timeListOpts.value.splice(idx, 1, {
    ...timeListOpts.value[idx],
    checked: true,
  });
  currentWeekNum.value = timeListOpts.value[idx].weekNum;
  hasChanged.value = true;
};

/** 设置当前选中班级对象 */
watchEffect(() => {
  if (curSelectClazz.value.length > 0) {
    curClazz.value = {
      title: curSelectClazz.value[2].label || '',
      clazzId: curSelectClazz.value[2].value || '',
    };
    if (JSON.stringify(curSelectClazz.value) != getPageParams().clazzList) {
      hasChanged.value = true;
    }
  }
});

/** 初始化周次 */
const initWeek = (week: number) => {
  const curCheckedIdx = timeListOpts.value.findIndex(item => item.checked === true);
  const curSelectIdx = timeListOpts.value.findIndex(item => item.weekNum === week);
  timeListOpts.value.splice(curCheckedIdx, 1, {
    ...timeListOpts.value[curCheckedIdx],
    checked: false,
  });
  timeListOpts.value.splice(curSelectIdx, 1, {
    ...timeListOpts.value[curSelectIdx],
    checked: true,
  });
  currentWeekNum.value = timeListOpts.value[curSelectIdx].weekNum;
};

/** 加载数据 */
const onLoadData = async () => {
  if (!curSelectClazz.value || !curSelectClazz.value[2].value || !currentWeekNum.value) return;
  const params = {
    clazzId: curSelectClazz.value[2].value,
    year: dayjs().week(currentWeekNum.value).year(),
    week: currentWeekNum.value,
  };

  const res = await getPlanWeeklyInfo(params);
  //初始化发布类型
  const list = publishTypeListOpts.value.map((item, index) => {
    if (item.value === res.publishFormat) {
      publishType.value = index;
      return { ...item, checked: true };
    } else return { ...item, checked: false };
  });
  publishTypeListOpts.value = list;
  // 初始化模板
  handleLoadTemplate(res.templateId);
  if (res.publishFormat === 1) {
    //初始化模板项目内容
    const planList = res.planWeeklyDetailDtos;
    if (planList && planList.length > 0) {
      planWeeklyDetailDtos.value = planList.map((item: any) => {
        return {
          ...item,
          id: item.itemId,
          name: item.itemName,
          content: item.content || '',
        };
      });
    }
  } else {
    imageList.array = [
      {
        fileId: res?.fileId || '',
        url: res?.fileUrl || '',
        kind: 'image',
      },
    ];
  }
};

const initEdit = (param: any) => {
  currentId.value = param.id || '';
  //初始化周次
  initWeek(Number(param.week));
  onLoadData();
};

onBeforeMount(() => {
  const params = getPageParams();
  isEdit.value = Number(params.isEdit);
  //初始化班级
  curSelectClazz.value = JSON.parse(params.clazzList);
  if (isEdit.value) {
    initEdit(params);
  } else {
    handleLoadTemplate();
  }
});
</script>
<style lang="scss" scoped>
.page-padding {
  padding: 0 32rpx 200rpx 32rpx;
  .setting {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 0 33rpx;
    &-item {
      height: 88rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-title {
        font-size: 30rpx;
        color: #1d2129;
        text-align: left;
        line-height: 48rpx;
        font-weight: 400;
      }
      &-btn {
        font-size: 30rpx;
        color: #86909b;
        text-align: right;
        line-height: 48rpx;
        font-weight: 400;
      }
    }
  }
  .template-name {
    width: 360rpx;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow: hidden;
    white-space: nowrap;
  }
  .des {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 28rpx 0rpx;
    display: flex;
    flex-direction: column;
    &-title {
      padding-left: 32rpx;
      text-align: left;
      font-size: 30rpx;
      color: #1d2129;
      line-height: 48rpx;
      font-weight: 400;
      height: 70rpx;
    }
    &-textarea {
      padding-left: 0 !important;
    }
    &-number {
      text-align: right;
      padding-right: 32rpx;
      line-height: 48rpx;
      margin-top: 10rpx;
    }
  }
  .pic {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 28rpx 0rpx;

    &-title {
      padding-left: 32rpx;
      text-align: left;
      font-size: 30rpx;
      color: #1d2129;
      font-weight: 400;
    }
  }
}
</style>
