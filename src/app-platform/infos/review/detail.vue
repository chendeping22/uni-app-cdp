<template>
  <page custom-overflow="scroll">
    <view v-if="infoDetail && isLoad">
      <view class="container">
        <view class="content">
          <view class="title title-3-medium">
            {{ infoDetail?.title }}
            <text
              class="u-m-l-16 caption-2-regular tag"
              :style="{ backgroundColor: tagInfo.background }"
            >
              {{ tagInfo.name }}
            </text>
          </view>
          <view class="subheadline-regular u-m-t-24">
            <text class="create"> {{ tagInfo.statusPrefix }}人 </text>
            <text>{{ infoDetail?.createName }}</text>
          </view>
          <view class="subheadline-regular u-m-t-8">
            <text class="create"> {{ tagInfo.statusPrefix }}时间 </text>
            <text>{{ commonDateStr(tagInfo.time ?? 0) }}</text>
          </view>
          <view class="rich">
            <Dafter
              v-if="infoDetail?.type === IInfoType.info"
              v-model="infoDetail.content"
              readonly
            />
            <view v-else-if="infoDetail?.type === IInfoType.video" class="video">
              <video :src="videoUrl" :poster="posterUrl"></video>
            </view>
            <view
              v-else-if="infoDetail?.type === IInfoType.album && infoDetail.fileList.length > 0"
            >
              <Upload :default-file-list="showFileList(infoDetail.fileList)" :show-remove="false" />
            </view>
          </view>
        </view>
      </view>
      <view v-if="tagInfo.showBottom">
        <view>
          <view :style="{ height: 128 + 'rpx' }"></view>
          <view class="safe-area-inset-bottom"> </view>
        </view>
        <view class="bottom">
          <view>
            <u-row gutter="12">
              <u-col span="6">
                <view class="refuse-button custom-button" @click="refuseAction">驳回</view>
              </u-col>
              <u-col span="6">
                <view class="agree-button custom-button" @click="agreeAction">通过</view>
              </u-col>
            </u-row>
          </view>
          <view class="safe-area-inset-bottom"></view>
        </view>
      </view>
      <view v-else>
        <view class="safe-area-inset-bottom"></view>
      </view>
    </view>
    <u-empty-custom v-else-if="isLoad" :text="['信息不存在', '发布人已变更此信息']" />
  </page>
</template>

<script lang="ts" setup>
import Dafter from '@/app-platform/infos/components/dafter/index.vue';
import {
  IInfoDetail,
  ReviewStatus,
  reviewAgree,
  reviewRefuse,
} from '@/app-platform/services/infos';
import { formatDate, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import { IInfoType, queryReviewDetail } from '../../services/infos';
import Upload from '../components/upload/index.vue';

const isLoad = ref<boolean>(false);
const infoId = ref<string>();
const source = ref<string>();
const infoDetail = ref<Partial<IInfoDetail>>({
  content: '',
});
const videoUrl = ref<string>();
const posterUrl = ref<string>();

onLoad(option => {
  infoId.value = decodeURIComponent(option?.id);
  source.value = decodeURIComponent(option?.source);
  console.log('infoId:' + infoId.value);
  loadData();
});

const loadData = async () => {
  try {
    showLoading();
    const res = await queryReviewDetail(infoId.value ?? '', source.value ?? '');
    infoDetail.value = res as IInfoDetail;
    console.log('>>LL>>> ~ loadData ~ infoDetail:', infoDetail);
    if (infoDetail.value && infoDetail.value.fileList) {
      infoDetail.value.fileList.forEach(item => {
        if (item.type === 1) {
          videoUrl.value = item.fileUrl;
        } else {
          posterUrl.value = item.fileUrl;
        }
      });
    }
    if (!infoDetail.value) {
      uni.$emit('RefreshReviewList');
    }
    isLoad.value = true;
    hideLoading();
  } catch (error) {
    hideLoading();
    showInfo(error?.desc || '获取校园资讯详情失败');
  }
};

const commonDateStr = (date: number) => {
  if (date === 0) {
    return '';
  }
  return formatDate(date, 'YYYY-MM-DD hh:mm');
};

const tagInfo = computed(() => {
  let tag = {
    background: '',
    name: '',
    statusPrefix: '',
    time: 0,
    showBottom: false,
  };

  if (infoDetail.value?.reviewStatus === ReviewStatus.approved) {
    tag = {
      background: '#52C41A',
      name: '已通过',
      statusPrefix: '创建',
      time: infoDetail.value?.createTime,
      showBottom: false,
    };
  } else if (infoDetail.value?.reviewStatus === ReviewStatus.rejected) {
    tag = {
      background: '#FF4D4F',
      name: '已驳回',
      statusPrefix: '创建',
      time: infoDetail.value?.createTime,
      showBottom: false,
    };
  } else if (infoDetail.value?.reviewStatus === ReviewStatus.waiting) {
    tag = {
      background: '#FAAD14',
      name: '待审核',
      statusPrefix: '创建',
      time: infoDetail.value?.createTime,
      showBottom: true,
    };
  }
  return tag;
});

const showFileList = (fileList: any[]) => {
  return fileList.map(item => {
    return {
      url: item.fileUrl,
      fileId: item.fileId,
    };
  });
};

const refuseAction = async () => {
  try {
    showLoading();
    await reviewRefuse([infoId.value ?? '']);
    uni.$emit('RefreshReviewList');
    uni.navigateBack({
      success() {
        showInfo('已驳回');
      },
    });
    hideLoading();
  } catch (error) {
    hideLoading();
    if (error.code === 2020201) {
      showAlert();
    } else {
      showInfo(error?.desc || '请求服务器失败');
    }
  }
};

const agreeAction = async () => {
  try {
    showLoading();
    await reviewAgree([infoId.value ?? '']);
    uni.$emit('RefreshReviewList');
    uni.navigateBack({
      success() {
        showInfo('已通过');
      },
    });
    hideLoading();
  } catch (error) {
    hideLoading();
    if (error.code === 2020201) {
      showAlert();
    } else {
      showInfo(error?.desc || '请求服务器失败');
    }
  }
};

const showAlert = () => {
  uni.showModal({
    title: '信息不存在',
    content: '发布人已变更此信息',
    showCancel: false,
    confirmText: '关闭',
    success: async res => {
      if (res.confirm) {
        uni.$emit('RefreshReviewList');
        uni.navigateBack({});
      }
    },
  });
};
</script>

<style scoped lang="scss">
.container {
  padding: $space-size-ms $space-size-md;

  .content {
    background-color: $color-bg-container;
    border-radius: $radius-base;
    padding: $space-size-md $space-size-md;

    .title {
      color: $color-text;
      position: relative;

      .tag {
        @include caption-2-regular;
        position: relative;
        top: -6rpx;
        display: inline-block;
        text-align: center;
        width: 82rpx;
        height: 40rpx;
        line-height: 40rpx;
        color: white;
        border-radius: $radius-sm;
      }
    }

    .create {
      display: inline-block;
      color: #000000a6;
      width: 148rpx;
    }

    .rich {
      margin-top: $space-size-md;

      .video {
        background-color: white;
        position: relative;
        overflow: hidden;
        width: px2rpx(311);
        height: px2rpx(192);
        border-radius: $radius-base;

        video {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);

  .refuse-button {
    margin: 24rpx 0rpx 24rpx 32rpx;
    background: white;
    color: $ui-color-primary;
    border: 2rpx solid $ui-color-primary;
  }

  .agree-button {
    margin: 24rpx 32rpx 24rpx 0rpx;
    color: white;
    background: $ui-color-primary;
  }

  .custom-button {
    height: 80rpx;
    font-size: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    border-radius: 16rpx;
  }
}
</style>
