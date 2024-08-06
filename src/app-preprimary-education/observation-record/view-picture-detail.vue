<template>
  <mt-page
    title="详情"
    theme="default"
    :show-bottom-gap="false"
    :show-top-gap="false"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <view class="bg-white p-all-l">
      <view class="flex-between">
        <view>
          <view class="flex">
            <view>记录人：</view>
            <view>{{ createByName }}</view>
          </view>
          <view class="color-secondary">{{ currentTime }}</view>
        </view>
        <view class="flex-inline">
          <c-image
            v-if="isShowDelete"
            class-name="img"
            width="48"
            height="48"
            :src="iconDelete"
            @click="delet"
          />
          <c-image
            v-if="isShowEdit"
            class-name="img"
            class="ml-xl"
            width="48"
            height="48"
            :src="iconEdit"
            @click="handleJump"
          />
        </view>
      </view>
    </view>

    <view class="mt-s p-all-l bg-white">
      <view class="font-xt">观察要点</view>
      <view v-for="(item, index) in indicatorsList" :key="index" class="mt-s">
        <view class="font-title">{{ item.domainName }}</view>
        <view class="flex flex-start mt-s">
          <view class="color-placeholder pr-s widthStyle">{{
            item.projectName.split('：')[0]
          }}</view>
          <view class="widthRight">{{ item.projectName.split('：')[1] }}</view>
        </view>
        <view class="flex flex-start mt-s">
          <view class="color-placeholder pr-s widthStyle">典型表现{{ item?.level }}</view>
          <view class="widthRight">{{ item.indicatorName }}</view>
        </view>
      </view>
    </view>
    <view class="mt-s p-all-l bg-white">
      <view class="font-xt">行为记录</view>
      <view class="mt-s">
        <view class="font-title">{{ behavior }}</view>
      </view>
      <view>
        <PicOrVideo
          :list="lists"
          :isPreview="isPreview"
          @videoDatas="videoDatasEvent"
          @changePreview="changePreview"
        />
      </view>
    </view>
    <view class="mt-s p-all-l bg-white">
      <view class="font-xt">教育建议</view>
      <view class="mt-s">
        <view class="font-title">{{ eduSuggest }}</view>
      </view>
    </view>
    <view class="pt-s p-all-l bg-white">
      <view v-if="evaluates.length !== 0" class="mt-s">
        <view v-for="(item, index) in evaluates" :key="index" class="comment-item mt-l">
          <view class="comment-item-area">
            <c-image
              class-name="img"
              class="comment-avatar"
              width="80"
              height="80"
              :src="item.targetType == 1 ? photo_other : commentAvatar(item.relation)"
            />
            <view class="font-desc color-placeholder">
              {{ item.targetName }}{{ item.targetType == 1 ? '老师' : '家长' }}
            </view>
          </view>
          <view
            style="white-space: pre-wrap"
            :class="item.targetType == 1 ? 'bg-teacher ml-s' : 'bg-guardian ml-s'"
          >
            <view style="white-space: pre-wrap" class="color-base">
              {{ item.content }}
            </view>
            <view class="flex-between">
              <view class="font-secondary color-secondary mr-b mt-s">
                {{ formatDate(item.createTime, 'YYYY-MM-DD hh:mm') }}
              </view>
              <view v-show="isDelete(item)">
                <c-image
                  class-name="img"
                  width="30"
                  height="30"
                  :src="iconDelete"
                  @click="deleteEvent(item)"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      <c-empty v-else top="0" content="暂无评价" />
    </view>
    <view class="blockStyle"></view>
    <imp-bottom>
      <view class="flex-between plr-s">
        <view style="width: 77%">
          <c-input
            v-model:value="description"
            padding-clz="p-all-s"
            placeholder="给宝贝鼓励一下呗~"
            font-size="content"
            type="textarea"
            height="36rpx"
            maxlength="200"
            bg-type="line-light"
            class-name="des-textarea"
            :show-clear="false"
            cursor-spacing="50"
          ></c-input>
        </view>

        <view>
          <c-button
            height-size="cell-small"
            type="primary"
            :is-brand-type="false"
            @click="postMessage"
          >
            <c-image :src="iconSend" width="44" height="44" class="lh-0 pr-xxs" />
            <text class="font-title">发送</text>
          </c-button>
        </view>
      </view>
    </imp-bottom>
  </mt-page>

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
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate, getPageParams, showInfo } from '@/utils/tools';
import { isNil } from 'lodash-es';
import { onBeforeMount, ref } from 'vue';
import iconDelete from '../static/image/delete_icon.png';
import iconEdit from '../static/image/edit_icon.png';
import photo_grandma from '../static/image/photo_grandma.png';
import photo_grandpa from '../static/image/photo_grandpa.png';
import photo_other from '../static/image/photo_other.png';
import profile_photo_man from '../static/image/profile_photo_man.png';
import profile_photo_woman from '../static/image/profile_photo_woman.png';
import iconSend from '../static/image/send_icon.png';
import PicOrVideo from './components/picOrVideo/index.vue';
import {
  deleteObserveRecordEvaluates,
  deleteSingleObserveRecord,
  getObserveRecordById,
  saveRecordEvaluate,
  setObserveRecordReads,
} from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

const store = useTimeImpression();
const pagesParams = ref<any>({});
const currentTime = ref('');
const createByName = ref('');
const currentId = ref('');
const studentIdRef = ref('');
const behavior = ref('');
const eduSuggest = ref('');
const description = ref('');
const deletType = ref('');
const indicatorsList = ref<any[]>([]);
const lists = ref([]);
const evaluates = ref<any[]>([]);
const showModal = ref(false);
const isShowDelete = ref<any>(false);
const isShowEdit = ref<any>(false);
const deletId = ref();
const loginSt = loginStore();
const personId = loginSt.userInfo?.personId;
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
const isPreview = ref(false);
const videoDatasEvent = (data: any) => {
  store.viewPicturePage.setFileUrl(data.fileUrl);
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/video-detail?fileUrl=${data.fileUrl}`,
  });
};
const handleJump = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/add?type=edit&id=${currentId.value}&studentId=${studentIdRef.value}`,
  });
};

const commentAvatar = (relation?: number) => {
  if (isNil(relation)) return photo_other;
  switch (relation) {
    case 0:
      return profile_photo_man;
    case 1:
      return profile_photo_woman;
    case 2:
      return photo_grandpa;
    case 3:
      return photo_grandma;
    case 4:
      return photo_grandpa;
    case 5:
      return photo_grandma;
    case 99:
      return photo_other;
    default:
      return profile_photo_man;
  }
};

const init = async () => {
  pagesParams.value = getPageParams();
  const { id, updateTime, studentId } = pagesParams.value;
  if (!isGuardian) await setObserveRecordReads({ studentId, type: 2, recordId: id });

  currentId.value = id;
  studentIdRef.value = studentId;
  currentTime.value = formatDate(Number(updateTime), 'YYYY-MM-DD hh:mm:ss');
  const data = {
    id,
    studentId,
  };

  getObserveRecordById(data).then((res: any) => {
    createByName.value = res.createByName;
    indicatorsList.value = res.indicators;
    behavior.value = res.behavior;
    eduSuggest.value = res.eduSuggest;
    evaluates.value = res.evaluates;
    isShowDelete.value = isDelete(res);
    isShowEdit.value = isEdit(res);
    lists.value = res.resources;
  });
};
onBeforeMount(() => {
  // handleNetworkStatusChange();
  // uni.onNetworkStatusChange(handleNetworkStatusChange);
  init();
});
// onBeforeUnmount(() => {
//   uni.offNetworkStatusChange(handleNetworkStatusChange);
// });
const postMessage = () => {
  const data = {
    content: description.value,
    recordId: currentId.value,
    studentId: studentIdRef.value,
  };
  console.log('data : ' + JSON.stringify(data));
  saveRecordEvaluate(data).then(res => {
    description.value = '';
    showInfo('评论成功');
    init();
  });
};
const delSampleItem = () => {
  if (deletType.value === 'all') {
    const data = {
      recordId: currentId.value,
      studentId: studentIdRef.value,
    };
    deleteSingleObserveRecord(data).then(res => {
      showInfo('删除成功');
      setTimeout(() => {
        uni.$emit('reLoadDelete');
        uni.navigateBack();
      }, 2000);
    });
  } else {
    deleteObserveRecordEvaluates(deletId.value).then(res => {
      showInfo('删除成功');
      init();
    });
  }
};
const deleteEvent = (params: any) => {
  showModal.value = true;
  deletType.value = 'deleteEvaluates';
  deletId.value = params.id;
};
const teacherEvnet = (params: any) => {
  if (params.targetType == 1) {
    //老师
    if (params.createBy == personId) {
      return true;
    } else {
      return false;
    }
  } else if (params.targetType == 2) {
    //家长
    return true;
  }
};
const guardianEvnet = (params: any) => {
  if (params.createBy == personId) {
    return true;
  } else {
    return false;
  }
};
const isDelete = (params: any) => {
  if (isGuardian) {
    return guardianEvnet(params);
  } else {
    return teacherEvnet(params);
  }
};
const isEdit = (params: any) => {
  if (!isGuardian && params.createBy == personId) {
    return true;
  } else {
    return false;
  }
};
const delet = () => {
  deletType.value = 'all';
  showModal.value = true;
};

const handleBack = () => {
  if (isPreview.value) {
    changePreview(false);
    return;
  }
  uni.navigateBack();
};

/** 预览 */
const changePreview = (value: boolean) => {
  isPreview.value = value;
};
</script>
<style lang="scss" scoped>
.widthStyle {
  width: 25%;
}
.widthRight {
  width: 73%;
}
.bg-style {
  background-color: #f2f3f4;
  border-radius: 24rpx;
}
.blockStyle {
  height: 250rpx;
}
.comment-item {
  display: flex;
  justify-content: space-between;

  .comment-item-area {
    width: 160rpx;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .comment-avatar {
    display: flex;
    justify-content: center;
  }
}
.bg-guardian {
  background-color: $ui-color-primary-light-3;
  border-radius: 24rpx;
  padding: 12px 16px;
  width: 100%;
}
.bg-teacher {
  background-color: $ui-color-warnning-light-3;
  border-radius: 24rpx;
  padding: 12px 16px;
  width: 100%;
}
</style>
