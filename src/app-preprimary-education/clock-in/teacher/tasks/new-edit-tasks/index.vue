<template>
  <CustomPage title="打卡任务" bg-type="white" class="new-edit-tasks">
    <view class="content-input" hover-class="none" hover-stop-propagation="false">
      <view class="title-content" hover-class="none" hover-stop-propagation="false">
        <input
          v-model="formData.obj.title"
          class="input"
          type="text"
          :maxlength="30"
          placeholder="标题(必填)"
        />
      </view>
      <view class="textarea-content" hover-class="none" hover-stop-propagation="false">
        <textarea
          v-model="formData.obj.content"
          :maxlength="3000"
          class="textarea"
          placeholder-class="textarea-placeholder"
          placeholder="打卡说明(必填)"
        ></textarea>
      </view>
      <view class="tooltip-content" hover-class="none" hover-stop-propagation="false">
        <text class="description" selectable="false" space="false" decode="false">
          {{ remainingWords }}
        </text>
      </view>
    </view>
    <view class="pic">
      <view class="flex-between">
        <view class="pic-title">
          <text>照片/视频</text>
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
            class="pr-s"
            :src="iconPunchPhoto"
            width="46"
            height="46"
            @click="pictureEvent"
          />
        </view>
      </view>
      <view class="mt-l">
        <Medias :model="''" :medias="mediaList" @delete="handleDelete" />
      </view>
    </view>
    <release-object :value="formData.obj" />
    <basic-configuration :value="formData.obj" @change="onChangeFormData" />
    <advanced-configuration :value="formData.obj" @change="onChangeFormData" />
    <view style="height: 48rpx"></view>
    <imp-empty-line size="xl" is-bottom />
    <imp-bottom>
      <view class="publish-btn">
        <u-button type="primary" @click="submit"> 发布 </u-button>
      </view>
    </imp-bottom>
  </CustomPage>
  <c-select
    v-model:show="isOpenSelect"
    v-model:list="listSelect"
    :auto-close-after-select="false"
    :show-check-icon="true"
    :mask-close-able="false"
    title="请选择"
    title-type="text"
    @onConfirm="handleConfirmSelect"
  />
</template>
<script lang="ts">
import Medias from '@/app-preprimary-education/clock-in/components/task-detail-card/medias.vue';
import {
  UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
  UPLOAD_IMAGE_MAX_SIZE,
} from '@/app-preprimary-education/clock-in/utils/constants';
import { useClockIn } from '@/app-preprimary-education/clock-in/utils/use-clock-in';
import ImpBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpEmptyLine from '@/app-preprimary-education/components/imp-empty-line/imp-empty-line.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import {
  addClock,
  getClazzes,
  getClockConfigInfo,
  getClockinTemplate,
  getVideoSnapshot,
} from '@/app-preprimary-education/services/clock-in';
import icon_failure from '@/app-preprimary-education/static/image/icon_common_failure.png';
import iconPunchCamera from '@/app-preprimary-education/static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';
import permision from '@/app-preprimary-education/utils/permission.js';
import { REGS } from '@/app-preprimary-education/utils/regs';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { CLOCK_IN_COMMITS, useStore } from '@/store/old';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import dayjs from 'dayjs';
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import advancedConfiguration from './components/advanced-configuration/index.vue';
import basicConfiguration from './components/basic-configuration/index.vue';
import releaseObject from './components/release-object/index.vue';
interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}
export default defineComponent({
  components: {
    'release-object': releaseObject,
    'basic-configuration': basicConfiguration,
    'advanced-configuration': advancedConfiguration,
    ImpEmptyLine,
    ImpBottom,
    ImpButton,
    CustomPage,
    Medias,
  },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  onShow() {
    uni.$emit('clock-in-new-edit-show');
  },
  setup() {
    const { commit } = useStore();
    const sourceTypeIndex = ref(2);
    const countIndex = ref(8);
    const store = useClockIn();
    const isOpenSelect = ref(false);
    const listSelect = ref([
      { text: '照片', checked: false, disabled: false },
      { text: '视频', checked: false, disabled: false },
    ]);

    const formData = reactive({
      obj: {
        id: undefined,
        // 标题
        title: undefined,
        // 内容
        content: undefined,
        // 开始时间
        startDate: +new Date(),
        // 打开周期
        cycle: 31,
        // 周期目标时间
        endDate: +new Date() + 1000 * 60 * 60 * 24 * 30,
        // 打卡频次
        rate: [0, 1, 2, 3, 4, 5, 6],
        // 是否允许补卡
        enabledRetry: 0,
        // 是否提醒打卡
        enabledPreNotice: 1,
        // 打卡结束是否提醒
        enabledEndNotice: 0,
        // 是否允许互看
        enabledView: 1,
        // 提醒打开时间
        preNoticeTime: '18:00',
        // 打开方式
        clockinWay: [0],
        // 发布对象总数值,
        classTotal: 0,
        // 已选的发布对象
        clazzs: [],
        // 模板id
        templateId: undefined,
      },
    });
    const imageList = reactive<{ array: { fileId: string; url: string; type: number }[] }>({
      array: [],
    });
    const sourceType = reactive({ array: ['拍照', '相册', '拍照或相册'] });
    const remainingWords = computed(() => 3000 - (formData.obj.content?.length || 0));
    const mediaList = computed(() => {
      const data = store.sourceUploadData.fileData;
      return data;
    });
    const checkPermission = async (code?: any) => {
      let type = code ? code - 1 : sourceTypeIndex.value;
      let status = permision.isIOS
        ? await permision.requestIOS(sourceType.array[type][0])
        : await permision.requestAndroid(
            type === 0 ? 'android.permission.CAMERA' : 'android.permission.READ_EXTERNAL_STORAGE',
          );

      if (status === null || status === 1) {
        status = 1;
      } else {
        uni.showModal({
          content: '没有开启权限',
          confirmText: '设置',
          success: function (res) {
            if (res.confirm) {
              permision.gotoAppSetting();
            }
          },
        });
      }

      return status;
    };

    const onChangeFormData = (params: {
      id: undefined;
      title: undefined;
      content: undefined;
      startDate: number;
      cycle: number;
      endDate: number;
      rate: number[];
      enabledRetry: number;
      enabledPreNotice: number;
      enabledEndNotice: number;
      enabledView: number;
      preNoticeTime: string;
      clockinWay: number[];
      classTotal: number;
      clazzs: never[];
    }) => {
      formData.obj = {
        ...formData.obj,
        ...params,
      };
    };

    const fetchClazzes = async (params: { id?: string }, onlyFetchData?: boolean) => {
      const res = await getClazzes();
      const totalNum = res
        .map((v: { allStudentNum: any }) => v.allStudentNum || 0)
        .reduce((pre = 0, current: number) => pre + current, 0);
      formData.obj['classTotal'] = totalNum;
      if (!params.id && !onlyFetchData) {
        formData.obj.clazzs = res.map(
          (v: { clazzId: string; studentVos: { studentId: string }[] }) => ({
            clazzId: v.clazzId,
            studentIds: v.studentVos.map((i: { studentId: string }) => i.studentId),
          }),
        );
      }
    };

    const submit = async () => {
      if (!formData.obj.title || !formData.obj.content) return showInfo('标题或内容未填写');
      if (
        !REGS.blankAndSpecialCharacter.test(formData.obj.title) ||
        !REGS.blankAndSpecialCharacter.test(formData.obj.content)
      )
        return showInfo('标题和打卡说明不支持全空格和全特殊字符');
      const selectedStudentNum =
        formData.obj.clazzs
          .map(v => v.studentIds?.length)
          .reduce((pre = 0, current) => pre + current, 0) || 0;
      if (!formData.obj.clazzs.length || !selectedStudentNum)
        return showInfo('无发布学生，请先添加学生');
      if (store.sourceUploadData.fileData.length > 9) {
        return showInfo('最多上传9个');
      }
      showLoading();
      //原图
      const masterPicList = store.sourceUploadData.fileData;
      const list = [];

      for (let i = 0; i < masterPicList.length; i++) {
        list.push({
          fileId: masterPicList[i].fileId,
          type: masterPicList[i].kind == 'image' ? 1 : 2,
        });
      }
      try {
        const form = {
          ...formData.obj,
          clockinWay:
            formData.obj.clockinWay.indexOf(0) > -1 ? '' : formData.obj.clockinWay.join(','),
          rate: formData.obj.rate.join(','),
          startDate: dayjs(formData.obj.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(formData.obj.endDate).format('YYYY-MM-DD'),
          medias: list,
          preNoticeTime: formData.obj.enabledPreNotice ? formData.obj.preNoticeTime : null,
        };

        await addClock(form);
        hideLoading();
        showInfo('保存成功');
        uni.navigateTo({
          url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/components/release-complete/index?id=${
            form.id || ''
          }`,
        });
      } catch (error) {
        const Err: any = error;
        showInfo(Err?.desc);
        hideLoading();
      }
    };

    const getInfo = async (id: string) => {
      const res = await getClockConfigInfo(id);
      formData.obj = {
        ...formData.obj,
        id: res.id,
        clockinWay: ['', null, undefined].includes(res.clockinWay)
          ? [0]
          : res.clockinWay?.split(','),
        rate: res.rate.split(','),
        startDate: res.startDate,
        endDate: res.endDate,
        content: res.content,
        cycle: res.cycle,
        preNoticeTime: res.preNoticeTime,
        title: res.title,
        clazzs: res.clazzs.map((v: { clazzId: string; studentIds: string[] }) => ({
          clazzId: v.clazzId,
          studentIds: v.studentIds,
        })),
        enabledRetry: res.enabledRetry,
        // 是否提醒打卡
        enabledPreNotice: res.enabledPreNotice,
        // 打卡结束是否提醒
        enabledEndNotice: res.enabledEndNotice,
        // 是否允许互看
        enabledView: res.enabledView,
        // 模板id，通过模板创建时存在
        templateId: res.templateId,
      };
      store.sourceUploadData.setFileData(
        res.medias.map((v: { fileId: any; url: any; type: any }) => ({
          fileId: v.fileId,
          url: v.url,
          kind: v.type == 1 ? 'image' : 'video',
        })),
      );
    };

    const getTemplate = async (id: string) => {
      const res = await getClockinTemplate(id);
      formData.obj = {
        ...formData.obj,
        title: res.templateName,
        content: res.templateContent,
        templateId: id,
      };
      store.sourceUploadData.setFileData(
        (res?.clockinTemplateMediaVoList || []).map(
          (v: { fileId: any; mediaFileUrl: string; type: number }) => ({
            fileId: v.fileId,
            url: transformImageUrl(v.mediaFileUrl),
            kind: v.type == 1 ? 'image' : 'video',
          }),
        ),
      );
    };

    const handleDelete = (item: any) => {
      store.sourceUploadData.delFileData(item);
    };

    const imageEvent = (typeList: any) => {
      chooseAndUploadImage(
        [],
        10,
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
        store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
        store.sourceUploadData.setOriginFileData([
          ...store.sourceUploadData.originFileData,
          ...files[2],
        ]);
      });
    };
    const cameraEvent = () => {
      // 打开摄像头
      imageEvent(['camera']);
    };
    const pictureEvent = () => {
      isOpenSelect.value = true;
    };
    const handleConfirmSelect = async (type: any) => {
      if (type[0] == 0) {
        //  打开图片相册
        const files = await chooseAndUploadImage(
          [],
          10,
          false,
          false,
          false,
          UPLOAD_IMAGE_MAX_SIZE,
          true,
          ['album'],
          true,
          UPLOAD_IMAGE_DEFAULT_SIZE_TYPE,
        );
        const data = files[1]?.map((item: SportsTaskMedia) => {
          return {
            ...item,
            kind: 'image',
            url: item?.url,
          };
        });

        const data2 = [
          {
            fileId: '',
            type: 2,
            url: '',
          },
        ];

        store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
        store.sourceUploadData.setOriginFileData([
          ...store.sourceUploadData.originFileData,
          ...data2,
        ]);
      } else {
        //  打开视频相册
        const files = await chooseAndUploadVideo({
          sourceType: ['album'],
          compressed: false,
          maxSize: 200,
        });
        const data = [
          {
            kind: 'video',
            url: files[1]?.presignedUrl,
            fileId: files[1]?.fileId,
          },
        ];

        store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
        if (files[1]?.fileId) await getVideoSnapshot({ fileId: files[1]?.fileId });
      }
    };
    onBeforeMount(() => {
      const params = getPageParams() || {};
      if (params.id) {
        getInfo(params.id);
      }
      if (params.templateId) {
        getTemplate(params.templateId);
      }
      uni.$on('class-list-submit', asClazzs => {
        formData.obj.clazzs = asClazzs;
      });
      uni.$on('clock-in-new-edit-show', () => {
        fetchClazzes(params, true);
      });
      fetchClazzes(params);
    });

    onBeforeUnmount(() => {
      uni.$off('clock-in-new-edit-show');
      store.sourceUploadData.clear();
    });

    watchEffect(() => {
      commit(CLOCK_IN_COMMITS.setFormData, formData.obj);
    });

    return {
      imageList,
      remainingWords,
      iconPunchCamera,
      iconPunchPhoto,
      icon_failure,
      formData,
      isOpenSelect,
      listSelect,
      mediaList,
      cameraEvent,
      pictureEvent,
      handleConfirmSelect,
      handleDelete,
      onChangeFormData,
      transformImageUrl,
      submit,
    };
  },
});
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
