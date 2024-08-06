<template>
  <mt-page
    :title="currentTitle"
    theme="default"
    :show-bottom-gap="false"
    :show-top-gap="false"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <view>
      <view class="left-icon" :style="{ top: detail.resourceType === 2 ? '350rpx' : '410rpx' }">
        <u-image :src="iconLeft" width="64" height="64" @click="handleLeft" />
      </view>
      <view class="right-icon" :style="{ top: detail.resourceType === 2 ? '350rpx' : '410rpx' }">
        <u-image :src="iconRight" width="64" height="64" @click="handleRight" />
      </view>
      <video
        v-if="detail.resourceType === 2"
        :src="detail.resourceFileURL"
        class="w100"
        @play="handlePlay"
      />

      <view v-else style="height: 562rpx">
        <c-image
          v-if="detail.resourceFileURL"
          :src="detail.resourceFileURL"
          width="100vw"
          height="562rpx"
          mode="aspectFit"
          @click="handlePreview"
        />
      </view>
    </view>
    <ScrollWrap class-name="bg-white">
      <view class="p-all-l">
        <view class="font-xt">{{ detail?.resourceDTO?.remark }}</view>
        <view class="color-secondary mt-s">
          {{ formatDate(detail?.resourceDTO?.createTime, 'YYYY-MM-DD hh:mm') }}
        </view>
        <view class="bg-white">
          <view v-if="detail?.resourceMoreCommentDTOList?.length !== 0">
            <view
              v-for="(item, index) in detail?.resourceMoreCommentDTOList"
              :key="index"
              class="comment-item mt-l"
            >
              <view class="comment-item-area">
                <c-image
                  class-name="img"
                  class="comment-avatar"
                  width="80"
                  height="80"
                  :src="item.targetType == 1 ? photo_other : commentAvatar(item.relation)"
                />
                <view class="font-desc color-placeholder">
                  {{ item.commentatorName }}{{ item.relation == 0 ? '老师' : '家长' }}
                </view>
              </view>
              <view
                style="white-space: pre-wrap"
                :class="item.relation == 0 ? 'bg-teacher ml-s' : 'bg-guardian ml-s'"
              >
                <view style="white-space: pre-wrap" class="color-base">
                  {{ item.commentContent }}
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
      </view>
      <c-empty-line :need-safe-bottom="true" height="170rpx" />
    </ScrollWrap>
    <imp-bottom>
      <view class="flex-between p-all-s">
        <view style="width: 80%">
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
    <view v-if="isPreview" class="mask">
      <view class="swiper-wrap">
        <swiper
          :current="currentPreview.index"
          @change="handleSwipe"
          :autoplay="false"
          :style="{ height: '100%' }"
          @click="handleClosePreview"
        >
          <swiper-item class="swiper-item" v-for="(item, index) in imageResource" :key="index">
            <view class="list-image-wrap">
              <image class="swiper-image" :src="item.resourceURL" mode="aspectFit" />
            </view>
          </swiper-item>
        </swiper>
      </view>
    </view>
  </mt-page>
  <c-modal
    v-model:show="showModal"
    content="是否确认删除？"
    class-name="modal"
    @onConfirm="delSampleItem"
  />
</template>
<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate, getPageParams, showInfo } from '@/utils/tools';
import { isNil } from 'lodash-es';
import { onBeforeMount, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import ImpBottom from '../components/imp-bottom/imp-bottom.vue';
import mtPage from '../components/mt-page/mt-page.vue';
import iconDelete from '../static/image/delete_icon.png';
import iconLeft from '../static/image/jiantou_left_icon.png';
import iconRight from '../static/image/jiantou_right_icon.png';
import photo_grandma from '../static/image/photo_grandma.png';
import photo_grandpa from '../static/image/photo_grandpa.png';
import photo_other from '../static/image/photo_other.png';
import profile_photo_man from '../static/image/profile_photo_man.png';
import profile_photo_woman from '../static/image/profile_photo_woman.png';
import iconSend from '../static/image/send_icon.png';
import ScrollWrap from './components/scroll-wrap/index.vue';
import { IPageType } from './utils/constants';
import { getCurrentUserType } from './utils/is';
import {
  IGetSourceDetail,
  deleteEvaluation,
  findStudentTimeSets,
  saveEvaluation,
  timesetResourceReads,
} from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

interface IPagesParams {
  id: string; // 资源id
  type: IPageType;
  taskId: string;
  relId: string;
  studentId?: string;
  uploadDate: any;
}

const { userInfo, currentUserType } = loginStore();
const personId = userInfo?.personId;
const store = useTimeImpression();
const { detail } = toRefs(store.sourceDetailPage);
const pagesParams = ref({} as IPagesParams);
const isGuardian = EUserType.teacher !== currentUserType;
const showModal = ref(false);
const description = ref('');
const currentTitle = ref('');
const deletId = ref();

const currentStudentId = ref('');
const resourceList = ref<any[]>([]);
const currentIndex = ref(-1);
const imageResource = ref<any[]>([]);
const currentPreview = ref({ index: -1, relId: '' });
const isPreview = ref(false);

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

const postMessage = () => {
  if (!description.value) {
    showInfo('评价内容不能为空');
    return;
  }
  const data = {
    commentContent: description.value,
    resourceStudentId: detail.value.id,
  };
  saveEvaluation(data).then(res => {
    description.value = '';
    console.log(
      '🚀 ~ file: view-picture-detail.vue:230 ~ saveEvaluation ~ description.value:',
      description.value,
    );
    showInfo('评论成功');
    getResource();
  });
};
const teacherEvnet = (params: any) => {
  if (params.relation == 0) {
    //老师
    if (params.commentatorId == personId) {
      return true;
    } else {
      return false;
    }
  } else if (params.relation == 1) {
    //家长
    return true;
  }
};
const guardianEvnet = (params: any) => {
  if (params.commentatorId == personId) {
    return true;
  } else {
    return false;
  }
};
const isDelete = (params: any) => {
  switch (getCurrentUserType()) {
    case EUserType.guardian:
      return guardianEvnet(params);
    case EUserType.teacher:
      return teacherEvnet(params);
  }
};
const deleteEvent = (params: any) => {
  showModal.value = true;
  deletId.value = params.id;
};
const delSampleItem = () => {
  deleteEvaluation(deletId.value).then(res => {
    showInfo('删除成功');
    getResource();
  });
};
const handlePlay = () => {
  handleNetworkStatusChange();
};

/** 点击图片 - 预览 */
const handlePreview = () => {
  const resourceRelId = resourceList.value[currentIndex.value].resourceRelId;
  const list: string[] = [];
  resourceList.value.forEach(item => {
    if (item.resourceType === 1) {
      list.push(item.resourceURL);
      if (item.resourceRelId === resourceRelId) {
        currentPreview.value = { index: list.length - 1, relId: resourceRelId };
      }
    }
  });
  isPreview.value = true;
};

/** 滑动预览图片 */
const handleSwipe = val => {
  const index = val.target.current || 0;
  currentPreview.value = { index, relId: imageResource.value[index].resourceRelId };
};

const handleBack = () => {
  if (isPreview.value) {
    handleClosePreview();
    return;
  }
  uni.navigateBack();
};

/** 关闭预览 */
const handleClosePreview = () => {
  currentIndex.value = resourceList.value.findIndex(
    item => item.resourceRelId === currentPreview.value.relId,
  );
  isPreview.value = false;
};

/** 查看上一张 */
const handleLeft = () => {
  if (currentIndex.value === 0) {
    showInfo('已经是当天的第一张了！');
    return;
  }
  currentIndex.value = currentIndex.value - 1;
};

/** 查看下一张 */
const handleRight = () => {
  if (currentIndex.value === resourceList.value.length - 1) {
    showInfo('已经是当天的最后一张了！');
    return;
  }
  currentIndex.value = currentIndex.value + 1;
};

/** 获取当天所有资源 */
const getResourceList = async (resourceRelId: string) => {
  const params = {
    studentId: currentStudentId.value,
    startDate: currentTitle.value,
    endDate: currentTitle.value,
  };
  const res = await findStudentTimeSets(params);
  const resources: any[] = [];
  const imageList: any[] = [];
  res.map(item => {
    item.resourceGroups.forEach(one => {
      one.resourceList.forEach(i => {
        const data = {
          resourceRelId: i.resourceRelId,
          resourceId: i.resourceId,
          resourceURL: i.resourceURL,
          resourceType: i.resourceType,
        };
        resources.push(data);
        if (i.resourceType === 1) imageList.push(data);
      });
    });
  });
  resourceList.value = resources;
  currentIndex.value = resourceList.value.findIndex(item => item.resourceRelId === resourceRelId);
  imageResource.value = imageList;
};

/** 获取当前图片信息 */
const getResource = () => {
  const resourceId = resourceList.value[currentIndex.value].resourceId;
  const list = {
    resourceId,
    studentId: currentStudentId.value,
  };
  store.sourceDetailPage.getDetail(list);
};

/** 左右切换 - 对应信息变化 */
watch(
  () => currentIndex.value,
  () => {
    getResource();
  },
);

const init = async () => {
  pagesParams.value = getPageParams();
  const { id, type, studentId, uploadDate, relId } = pagesParams.value;
  currentStudentId.value = studentId || '';
  if (!isGuardian)
    await timesetResourceReads({ studentId: studentId || '', type: 2, resourceStudentId: relId });
  currentTitle.value = formatDate(Number(uploadDate), 'YYYY-MM-DD');
  uni.setNavigationBarTitle({
    title: currentTitle.value,
  });

  detail.value = {} as IGetSourceDetail;
  if (type === 'revert') {
    store.sourceDetailPage.fetchRecycleDetail(id);
  } else {
    const list = {
      resourceId: id,
      studentId: studentId,
    };
    store.sourceDetailPage.getDetail(list);

    getResourceList(relId);
  }
};

const handleNetworkStatusChange = (res?: UniApp.OnNetworkStatusChangeSuccess) => {
  if (res && !res.isConnected) {
    showInfo('网络已断开');
    return;
  }
  uni.getNetworkType({
    complete(res: any) {
      const networkType = res.networkType || 'none';
      if (networkType === 'none') {
        showInfo('当前无网络');
        return;
      }
      if (/\dg/.test(networkType)) {
        showInfo('注意！您正在使用流量！');
        return;
      }
    },
  });
};

onBeforeMount(() => {
  handleNetworkStatusChange();
  uni.onNetworkStatusChange(handleNetworkStatusChange);
  init();
});
onBeforeUnmount(() => {
  uni.offNetworkStatusChange(handleNetworkStatusChange);
});
</script>
<style lang="scss" scoped>
.bg-style {
  background-color: #f2f3f4;
  border-radius: 24rpx;
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
.mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #000;
  transition: all 0.3s ease;
  .swiper-wrap {
    height: 100%;
  }
  .swiper-item {
    align-items: center;
    .list-image-wrap {
      width: 100%;
      height: 100%;
      flex: 1;
      transition: all 0.5s;
      overflow: hidden;
      box-sizing: content-box;
      position: relative;
      .swiper-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.left-icon {
  position: absolute;
  left: 20rpx;
  z-index: 1000;
}
.right-icon {
  position: absolute;
  right: 20rpx;
  z-index: 1000;
}
</style>
