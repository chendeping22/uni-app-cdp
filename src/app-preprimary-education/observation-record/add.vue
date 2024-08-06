<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :auto-show-left-icon="false">
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <view class="page-padding">
      <view v-if="!isGuardian" class="setting" @click="openEvent">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text class="mr-s" style="color: red">*</text>
            <text>观察对象</text>
          </view>
          <view class="setting-item-btn flex">
            <text class="point-name"> {{ studentNames }}</text>
            <text v-if="studentsLength > 2"> 等{{ studentsLength }}人</text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="setting" @click="openEvent2">
        <view class="setting-item">
          <view class="setting-item-prefix">观察要点</view>
          <view class="setting-item-btn flex">
            <text class="point-name"> {{ pointsNames }}</text>
            <text v-if="pointsNameList.length > 2"> 等{{ pointsNameList.length }}项</text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <view class="des">
        <view class="des-title">行为记录</view>
        <c-input
          v-model:value="behavior"
          placeholder="选填"
          type="textarea"
          height="240rpx"
          maxlength="200"
          class-name="des-textarea"
          :show-clear="false"
        ></c-input>
      </view>
      <view class="des">
        <view class="des-title">教育建议</view>
        <c-input
          v-model:value="eduSuggest"
          placeholder="选填"
          type="textarea"
          height="240rpx"
          maxlength="200"
          class-name="des-textarea"
          :show-clear="false"
        ></c-input>
      </view>
      <view class="pic mtb-under">
        <view class="flex-between">
          <view class="pic-title">
            <text class="mr-s" style="color: red">*</text>
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
              class="pr-l"
              :src="iconPunchPhoto"
              width="46"
              height="46"
              @click="pictureEvent"
            />
          </view>
        </view>
        <view class="mt-l">
          <Midias :model="''" :medias="mediaList" @delete="handleDelete" />
        </view>
      </view>
    </view>
    <imp-bottom :z-index="zIndexs">
      <view class="flex-around">
        <c-button
          v-if="types !== 'edit'"
          :width="widths"
          heightSize="height-button-small"
          type="plain"
          @click="hanldeSubmit(0)"
        >
          <text class="text-size">存草稿</text>
        </c-button>
        <c-button
          v-if="types !== 'addNew'"
          heightSize="height-button-small"
          :width="widths"
          type="plain"
          @click="deletDartf"
        >
          <text class="text-size">删除</text>
        </c-button>
        <c-button
          type="primary"
          width="350rpx"
          heightSize="height-button-small"
          :disabled="buttonDisabled"
          @click="hanldeSubmit(1)"
        >
          <text class="text-size">发布</text>
        </c-button>
      </view>
    </imp-bottom>
  </mt-page>
  <c-select
    v-model:show="isOpen"
    v-model:list="list"
    :auto-close-after-select="false"
    :show-check-icon="true"
    multiple
    :mask-close-able="false"
    title="观察对象"
    title-type="text"
    @onConfirm="handleConfirm"
  />
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
  <c-modal
    v-model:show="showModal"
    content="是否确认删除？"
    class-name="modal"
    @onConfirm="delSampleItem"
  />
</template>
<script lang="ts" setup>
import impBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import Midias from '@/app-preprimary-education/observation-record/components/task-detail-card/medias.vue';
import iconPunchCamera from '@/app-preprimary-education/static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { getPageParams, showInfo } from '@/utils/tools';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { onLoad } from '@dcloudio/uni-app';
import { computed, onBeforeMount, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import { UPLOAD_IMAGE_DEFAULT_SIZE_TYPE, UPLOAD_IMAGE_MAX_SIZE } from './utils/constants';
import {
  deleteObserveRecord,
  deleteSingleObserveRecord,
  getObserveRecordById,
  publishApi,
  updateObserveRecord,
} from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

interface SportsTaskMedia {
  fileId: string;
  type: number; //媒体类型：1-图片，2-视频
}

const title = computed(() => (types.value === 'edit' ? '编辑观察记录' : '新建观察记录'));
const isOpen = ref(false);
const isOpenSelect = ref(false);
const showModal = ref(false);
const buttonDisabled = ref(false);
const totalPerson = ref(0);
const eduSuggest = ref('');
const types = ref('');
const toTypes = ref();
const zIndexs = ref(999);
const currentId = ref('');
const behavior = ref('');
const list = ref<any>([]);
const studentList = ref<any>([]);
const studentNames = ref('请选择');
const selectStudentId = ref('');
const studentsLength = ref(0);
const pointsNames = ref('请选择');
const pointsNameList = ref<any>([]);
const listSelect = ref([
  { text: '照片', checked: false, disabled: false },
  { text: '视频', checked: false, disabled: false },
]);
const store = useTimeImpression();
const { curClazz } = toRefs(store);
const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
// const { taskRefStudents } = toRefs(store.observeRecordPage);
const fetchDataFunc = async () => {
  const data = await store.homePage.getHomeList(curClazz.value.clazzId);
  return data;
};
const initTotalPerson = () => {
  totalPerson.value = store.PointsOfObservationData.inxList.length;
};

// 观察对象名称
const getStudentNames = (data: any) => {
  if (data.length > 0) {
    studentNames.value = data
      .map((item: any) => item.text)
      .filter((one: any, index: number) => index < 2)
      .join('，');
    studentsLength.value = data.length;
  } else {
    studentNames.value = '请选择';
    studentsLength.value = 0;
  }
};

// 观察要点名称
const getPointsNames = () => {
  const indicators = store.PointsOfObservationData.indicators;
  const treeDataSave = store.PointsOfObservationData.treeDataSave;
  const names: any[] = [];
  if (treeDataSave && treeDataSave.length > 0) {
    indicators.forEach((item: any) => {
      const name = treeDataSave
        .filter((one: any) => one.id === item.domainId)
        .map(
          (childs: any) =>
            childs.childs.filter((child: any) => child.id === item.projectId)[0].name,
        )[0]
        .split('：')[1];
      if (!names.includes(name)) names.push(name);
    });
  } else {
    indicators.forEach((item: any) => {
      const name = item.projectName.split('：')[1];
      if (!names.includes(name)) names.push(name);
    });
  }
  if (names.length > 0) {
    pointsNames.value = names.filter((one: any, index: number) => index < 2).join('，');
  } else {
    pointsNames.value = '请选择';
  }
  pointsNameList.value = names;
};

watch(() => store.PointsOfObservationData.indicators, getPointsNames, { immediate: true });

const init = () => {
  initTotalPerson();
  const { studentId } = getPageParams();
  selectStudentId.value = studentId;
  !isGuardian &&
    fetchDataFunc().then(res => {
      if (studentId) {
        const inx: any = [];
        res.forEach((item: any, index: any) => {
          if (item.studentId === studentId) inx.push(index);
        });
        store.PointsOfObservationData.setInxList(inx);
        const students = res
          .filter((item: any) => item.studentId === studentId)
          .map((item: any) => item.studentId);
        store.PointsOfObservationData.setStudentList(students);
      }
      const inxList: any = store.PointsOfObservationData.inxList;
      list.value = res.map((item: any, index: number) => {
        if (inxList.length && inxList.includes(index)) {
          return {
            text: item.studentName,
            checked: true,
            disabled: false,
            id: item.studentId,
          };
        } else {
          return {
            text: item.studentName,
            checked: false,
            disabled: false,
            id: item.studentId,
          };
        }
      });

      studentList.value = store.PointsOfObservationData.studentList;
      const data = list.value.filter((item: any, index: any) => {
        return inxList.includes(index);
      });
      getPointsNames();
      getStudentNames(data);
    });
};
const mediaList = computed(() => {
  const data = store.sourceUploadData.fileData;
  // [{"fileId":"ffe60401cf504891bf8c86f8cc723c35","type":1,"kind":"image"}]
  console.log('mediaList : ' + JSON.stringify(data));
  return data;
});
const widths = computed(() => {
  const data = types.value === 'dartf' ? '150rpx' : '350rpx';
  return data;
});
/**回填观察对象 */
const getStudentList = (arr: any) => {
  totalPerson.value = arr.length;
  if (arr.length > 0) {
    studentNames.value = arr
      .map((item: any) => item.studentName)
      .filter((one: any, index: number) => index < 2)
      .join('，');
    studentsLength.value = arr.length;
  } else {
    studentNames.value = '请选择';
    studentsLength.value = 0;
  }
  !isGuardian &&
    fetchDataFunc().then(res => {
      const studentLists: any = [];
      arr.forEach(item => {
        studentLists.push(item.studentId);
      });
      studentList.value = studentLists;
      store.PointsOfObservationData.setStudentList(studentLists);

      list.value = res.map((item: any, index: number) => {
        if (studentLists.length && studentLists.includes(item.studentId)) {
          return {
            text: item.studentName,
            checked: true,
            disabled: true,
            id: item.studentId,
          };
        } else {
          return {
            text: item.studentName,
            checked: false,
            disabled: true,
            id: item.studentId,
          };
        }
      });
    });
};
const getIndicatorsList = (data: any) => {
  store.PointsOfObservationData.setIndicators(data);
};
const getMediasList = (data: any) => {
  const list = data.map((item: any) => {
    return {
      ...item,
      kind: item.resourceType == 1 ? 'image' : 'video',
      url: item.fileUrl,
    };
  });
  const list2 = data.map((item: any) => {
    return {
      ...item,
      kind: item.resourceType == 1 ? 'image' : 'video',
      url: item.thumbnailUrl,
    };
  });
  store.sourceUploadData.setFileData(list);
  store.sourceUploadData.setOrigionFileData(list2);
};
const init2 = () => {
  //草稿箱的时候
  if (types.value !== 'addNew') {
    const { studentId } = getPageParams();
    selectStudentId.value = studentId;
    const data = { id: currentId.value, studentId: types.value === 'edit' ? studentId : '' };
    getObserveRecordById(data).then((res: any) => {
      behavior.value = res.behavior;
      eduSuggest.value = res.eduSuggest;
      getStudentList(res.students);
      getIndicatorsList(res.indicators);
      getMediasList(res.resources);
    });
  } else {
    init();
  }
};
onLoad(() => {
  const { type, id, toType } = getPageParams();
  currentId.value = id;
  toTypes.value = toType;

  store.PointsOfObservationData.setCurrentType(type);
  types.value = type;
});
onBeforeMount(() => {
  init2();
});
onBeforeUnmount(() => {
  // store.sourceUploadData.clear();
});
const clearEvent = () => {
  store.sourceUploadData.clear();
  store.PointsOfObservationData.setInxList([]);
  store.PointsOfObservationData.setStudentList([]);
};
const handleBack = () => {
  clearEvent();
  uni.navigateBack();
};
const handleDelete = (item: any) => {
  store.sourceUploadData.delFileData(item);
};
const openEvent = () => {
  if (types.value !== 'addNew') {
    showInfo('观察对象暂不支持修改');
    return;
  }
  isOpen.value = true;
};
const openEvent2 = () => {
  uni.navigateTo({
    url: '/app-preprimary-education/observation-record/pointsOfObservation',
  });
};
const handleConfirm = (inx: any) => {
  store.PointsOfObservationData.setInxList(inx);
  const data = list.value.filter((item: any, index: any) => {
    return inx.includes(index);
  });
  studentList.value = data.map((item: any) => {
    return item.id;
  });
  getStudentNames(data);
  store.PointsOfObservationData.setStudentList(studentList.value);
  totalPerson.value = studentList.value.length;
  isOpen.value = false;
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
    store.sourceUploadData.setOrigionFileData([
      ...store.sourceUploadData.origionFileData,
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
const backEvent = () => {
  let pages = getCurrentPages(); // 当前页面
  let beforePage: any = pages[pages.length - 2]; // 上一页
  uni.navigateBack({
    success: function () {
      beforePage.onLoad(); // 执行上一页的onLoad里面的方法方法
    },
  });
};
const hanldeSubmit = (status: number) => {
  buttonDisabled.value = true;
  if (!isGuardian && !studentList.value.length) {
    uni.showToast({
      title: '请选择观察对象',
      icon: 'none',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }
  if (store.sourceUploadData.fileData.length > 9) {
    uni.showToast({
      title: '最多上传9个',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }
  if (!store.sourceUploadData.fileData.length) {
    uni.showToast({
      title: '请上传照片或者视频',
      icon: 'none',
      duration: 2000,
    });
    buttonDisabled.value = false;
    return;
  }
  //原图
  const masterPicList = store.sourceUploadData.fileData;
  const thumbnailPicList = store.sourceUploadData.origionFileData;
  const list = [];
  for (let i = 0; i < masterPicList.length; i++) {
    list.push({
      fileId: masterPicList[i].fileId,
      resourceType: masterPicList[i].kind == 'image' ? 1 : 2,
      thumbnailId: masterPicList[i].kind == 'image' ? thumbnailPicList[i]?.fileId : '',
    });
  }
  // 小程序打包选择将JS编译成ES5时会报：Cannot read property 'getStorageSync' of undefined
  // const personId = uni.getStorageSync('currentStudentId') || '';
  const personId = loginSt.userInfo?.currentChildId;
  const studentIds = isGuardian ? [personId] : studentList.value;
  const params: any = {
    studentIds,
    resources: list,
    clazzId: curClazz.value.clazzId,
    behavior: behavior.value,
    eduSuggest: eduSuggest.value,
    status,
    indicators: store.PointsOfObservationData.indicators,
  };

  if (types.value == 'addNew') {
    //新建
    publishApi(params)
      .then((res: any) => {
        uni.showToast({
          title: status == 1 ? '已发布' : '已保存',
          icon: 'none',
          duration: 2000,
        });
        if (status == 1) {
          //发布按钮
          setTimeout(() => {
            uni.$emit('reLoadDelete');
            uni.navigateBack();
            buttonDisabled.value = false;
          }, 2000);
        } else {
          //草稿按钮
          setTimeout(() => {
            uni.navigateTo({
              url: '/app-preprimary-education/observation-record/draft?toType=1',
            });
            buttonDisabled.value = false;
          }, 2000);
        }
        clearEvent();
      })
      .catch(() => {
        buttonDisabled.value = false;
      });
  } else {
    //草稿
    params.id = currentId.value;
    if (types.value == 'dartf') params.sourceType = 0;
    updateObserveRecord(params)
      .then((res: any) => {
        uni.showToast({
          title: status == 1 ? '已发布' : '已保存',
          icon: 'none',
          duration: 2000,
        });
        if (status == 1) {
          //发布按钮
          setTimeout(() => {
            uni.$emit('reLoadDelete');

            if (toTypes.value == 1) {
              uni.navigateBack({
                delta: 3,
              });
            } else {
              uni.navigateBack({
                delta: 2,
              });
            }
            buttonDisabled.value = false;
          }, 2000);
        } else {
          //草稿按钮
          setTimeout(() => {
            uni.$emit('reLoad');
            uni.navigateBack();
            buttonDisabled.value = false;
          }, 2000);
        }
        clearEvent();
      })
      .catch(() => {
        buttonDisabled.value = false;
      });
  }
};
const delSampleItem = () => {
  const data = {
    recordId: currentId.value,
    studentId: selectStudentId.value,
  };
  (types.value == 'edit'
    ? deleteSingleObserveRecord(data)
    : deleteObserveRecord({ recordId: currentId.value })
  ).then(res => {
    showInfo('删除成功');
    uni.$emit('reLoad');
    clearEvent();
    setTimeout(() => {
      types.value == 'edit' ? uni.navigateBack({ delta: 2 }) : uni.navigateBack();
      // if (isGuardian) {
      //   uni.navigateBack();
      // } else {
      //   uni.navigateBack({
      //     delta: 2,
      //   });
      // }
    }, 2000);
  });
};
const deletDartf = () => {
  showModal.value = true;
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
    // 旧基座取files[1]
    const data = files[1]?.map((item: SportsTaskMedia) => {
      return {
        ...item,
        kind: 'image',
        url: item?.url,
      };
    });

    store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
    store.sourceUploadData.setOrigionFileData([
      ...store.sourceUploadData.origionFileData,
      ...files[2],
    ]);
  } else {
    //  打开视频相册
    const files = await chooseAndUploadVideo({
      sourceType: ['album'],
      compressed: false,
      maxSize: 200,
    });
    if (!files[1]?.fileId) return;
    // 旧基座取files[1]?.presignedUrl
    const data = [
      {
        kind: 'video',
        url: files[1]?.presignedUrl,
        fileId: files[1]?.fileId,
      },
    ];
    const data2 = [
      {
        fileId: '',
        type: 2,
        url: '',
      },
    ];

    store.sourceUploadData.setFileData([...store.sourceUploadData.fileData, ...data]);
    store.sourceUploadData.setOrigionFileData([
      ...store.sourceUploadData.origionFileData,
      ...data2,
    ]);
  }
};
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
      height: 88rpx;
    }
    &-textarea {
      padding-left: 0 !important;
    }
    &-number {
      text-align: right;
      padding-right: 32rpx;
      font-size: 30rpx;
      line-height: 48rpx;
      font-weight: 400;
      color: #86909c;
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
.submit-btn {
  padding: 0rpx 32rpx;
}

.point-name {
  width: 330rpx;
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
  white-space: nowrap;
}
.text-size {
  font-size: 15px;
}
</style>
