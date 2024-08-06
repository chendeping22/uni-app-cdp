<template>
  <mt-page
    :show-notice-bar="false"
    class="detail-page"
    title="服药详情"
    :show-top-gap="false"
    bg-type="gray"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon v-if="showHome" name="icon_back_home" :size="48" @click="goBackHome" />
      <c-icon v-if="!showHome" name="icon_arrow_left" :size="48" @click="goBackIndex" />
    </template>
    <view class="content">
      <view class="top">
        <view class="leave-main">
          <view class="leave-main-image">
            <c-avatar
              class-name="radius-round "
              :src="itemInfo.photoUrl"
              :sex="String(itemInfo.gender) === '1' ? 'man' : 'woman'"
              type="child"
              :size="108"
            />
          </view>
          <view class="leave-main-info">
            <view class="leave-main-info-top">
              <view>{{ itemInfo.studentName }}</view>
              <ProcessTag :code="itemInfo.status" :title="itemInfo.statusName" />
            </view>
            <view class="leave-main-info-bottom"
              >{{ itemInfo.createByName }} 提交于
              {{ dayjs(itemInfo.createTime).format('YYYY-MM-DD HH:mm') }}</view
            >
          </view>
        </view>
      </view>
      <view class="middle">
        <view class="des">
          <view class="label">所属班级</view>
          <view class="value">
            {{ itemInfo.clazzName }}
          </view>
        </view>
        <view class="des">
          <view class="label">服药日期</view>
          <view class="value">
            {{ dayjs(itemInfo.medicationDate).format('YYYY-MM-DD') }}
          </view>
        </view>
        <template v-if="itemInfo.medicationItems && itemInfo.medicationItems.length">
          <template v-for="(item, index) in itemInfo.medicationItems" :key="index">
            <view class="des">
              <view class="label"
                >药品名称{{ itemInfo.medicationItems.length > 1 ? index + 1 : '' }}</view
              >
              <view class="value">
                {{ item.name }}
              </view>
            </view>
            <view class="des">
              <view class="label"
                >服药说明{{ itemInfo.medicationItems.length > 1 ? index + 1 : '' }}</view
              >
              <view class="value">
                {{ item.introductions }}
              </view>
            </view>
          </template>
        </template>
        <view v-if="itemInfo.comment" class="des">
          <view class="label">备注</view>
          <view class="value">
            {{ itemInfo.comment }}
          </view>
        </view>
        <view class="des">
          <view class="big-tip pt-d">图片</view>
        </view>
        <view class="img-wrap">
          <template v-if="drugImage && drugImage.length">
            <template v-for="item in drugImage" :key="item.fileId">
              <c-image :src="item.fileURL" :width="96" :height="96" preview class="img" />
            </template>
          </template>
        </view>
      </view>
      <view class="middle">
        <view class="des">
          <view class="big-tip">家长签名</view>
        </view>
        <view class="img-wrap">
          <template v-if="parentSignatureImage && parentSignatureImage.length">
            <template v-for="item in parentSignatureImage" :key="item.fileId">
              <c-image
                :src="item.fileURL"
                :width="199"
                :height="78"
                preview
                class="img no-radius-img"
              />
            </template>
          </template>
        </view>
      </view>
      <view
        v-if="
          itemInfo.status !== 1 && itemInfo.medicationRecords && itemInfo.medicationRecords.length
        "
        class="middle"
      >
        <view class="des">
          <view class="big-tip">服药记录</view>
        </view>
        <view class="des">
          <view class="label">服药时间</view>
          <view class="value">
            {{
              itemInfo.medicationRecords && itemInfo.medicationRecords.length
                ? dayjs(itemInfo.medicationRecords[0].medicationTime).format('YYYY-MM-DD HH:mm')
                : ''
            }}
          </view>
        </view>
        <view class="des">
          <view class="label">服药反馈</view>
          <view class="value">
            {{
              itemInfo.medicationRecords &&
              itemInfo.medicationRecords.length &&
              itemInfo.medicationRecords[0].feedback
                ? itemInfo.medicationRecords[0].feedback
                : '无'
            }}
          </view>
        </view>
        <template v-if="medicationRecordImage && medicationRecordImage.length">
          <view class="des">
            <view class="big-tip pt-d">图片</view>
          </view>
          <view class="img-wrap">
            <template v-if="medicationRecordImage && medicationRecordImage.length">
              <template v-for="item in medicationRecordImage" :key="item.fileId">
                <c-image :src="item.fileURL" :width="96" :height="96" preview class="img" />
              </template>
            </template>
          </view>
        </template>
      </view>
      <view class="middle">
        <view class="des">
          <view class="big-tip">服药日志</view>
        </view>
        <view v-if="itemInfo.medicationLogs && itemInfo.medicationLogs.length">
          <c-time-line>
            <c-time-line-item
              v-for="(item, index) in itemInfo.medicationLogs"
              :key="item.id"
              :node-top="18"
            >
              <template #node>
                <view class="icon-16 radius-round bg-primary"></view>
              </template>
              <template #content>
                <view
                  :class="{
                    'last-item': index === itemInfo.medicationLogs.length - 1,
                  }"
                >
                  <view class="w100 flex-between lh-6">
                    <view class="font-title color-base"
                      >{{ item.createByName }}{{ item.statusName }}</view
                    >
                    <view class="font-secondary color-placeholder">{{
                      dayjs(item.createTime).format('YYYY-MM-DD HH:mm')
                    }}</view>
                  </view>
                  <view
                    v-if="item.status === 5 && itemInfo.refuseReason?.trim().length"
                    class="refuse-textarea"
                  >
                    <view>{{ itemInfo.refuseReason.trim() }}</view>
                  </view>
                </view>
              </template>
            </c-time-line-item>
          </c-time-line>
        </view>
      </view>
    </view>
    <c-bottom v-if="itemInfo.status === 1" class="footer">
      <view class="btn-wrap">
        <c-button
          type="plain"
          width="330rpx"
          heightSize="height-button-small"
          class="bottom-btn"
          @click="showRecallModal = true"
        >
          <text class="text-size">撤回</text>
        </c-button>
        <c-button
          type="plain"
          width="330rpx"
          heightSize="height-button-small"
          class="bottom-btn"
          @click="itemEdit"
        >
          <text class="text-size">修改</text>
        </c-button>
      </view>
    </c-bottom>
    <c-modal
      v-model:show="showRecallModal"
      class="recall-confirm-modal"
      @onClose="showRecallModal = false"
      @onConfirm="onRecallModalSubmit"
    >
      <view class="modal-content">
        <view class="title-text">是否确定撤回服药登记？</view>
      </view>
    </c-modal>
    <c-modal
      v-model:show="showErrorToast"
      :has-cancel="false"
      class="error-toast"
      @onConfirm="handelStateChange"
    >
      <view
        class="error-toast-con"
        style="text-align: center; font-size: 1.0625rem; font-weight: bold"
        >该服药登记的状态已变更</view
      >
      <view
        class="error-toast-con"
        style="text-align: center; font-size: 1.0625rem; font-weight: bold"
        >不支持操作</view
      >
    </c-modal>
    <TimePicker
      :visible="showStartTimePicker"
      @changeTime="changeLeaveStartTime"
      @onClose="showStartTimePicker = false"
    />
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  filesType,
  getPageDetailApi,
  responsePageDetailType,
  rollbackPageDetailApi,
} from '@/app-preprimary-education/services/feedMedicine';
import { getHomeConf } from '@/app-preprimary-education/utils/env';
import dayjs from 'dayjs';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import ProcessTag from '../../components/process-tag.vue';
import TimePicker from '../../components/time-picker.vue';
import icon_punch_photo from '/static/svg/icon_punch_photo.svg';
export default defineComponent({
  components: {
    ProcessTag,
    TimePicker,
    mtPage,
  },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  onLoad(option: { infoId: string; from?: string }) {
    if (option) {
      const { infoId, from } = option;
      this.id = infoId;
      this.pageFrom = from || '';
    }
  },
  onUnload() {
    const historyPages = getCurrentPages() || [];
    let len = historyPages.length;
    if (len > 3) {
      uni.navigateBack({ delta: 1 });
    }
  },

  onShow() {
    this.getPageDetail(this.id);
  },
  setup() {
    const id = ref<string>('');
    const pageFrom = ref<string>('');
    const showRecallModal = ref<boolean>(false);
    const showErrorToast = ref<boolean>(false);
    const itemInfo = ref<responsePageDetailType>({});
    const drugImage = ref<filesType[]>([]);
    const parentSignatureImage = ref<filesType[]>([]);
    const medicationRecordImage = ref<filesType[]>([]);
    const reason = ref<string>('');
    const showHome = ref(false); // navbar显示homeIcon
    const showStartTimePicker = ref<boolean>(false);
    const selectFeedTime = ref<number>();
    const feedback = ref<string>(''); //反馈
    const getPageDetail = async (id: string) => {
      if (!id) return;
      const res = await getPageDetailApi(id);
      itemInfo.value = res;
      drugImage.value =
        res.medicationFiles && res.medicationFiles.length
          ? res.medicationFiles?.filter(item => item.uploadType === 1)
          : [];
      parentSignatureImage.value =
        res.medicationFiles && res.medicationFiles.length
          ? res.medicationFiles?.filter(item => item.uploadType === 2)
          : [];
      medicationRecordImage.value =
        res.medicationFiles && res.medicationFiles.length
          ? res.medicationFiles?.filter(item => item.uploadType === 3)
          : [];
    };
    const medias = reactive({
      array: [] as any,
      cloneArray: [] as any,
    });
    const updateAttachments = (data: { fileId: string; url: string }[]) => {
      medias.array = data.map(item => ({
        fileId: item.fileId,
        url: item.url,
      }));
    };
    const handelStateChange = () => {
      getPageDetail(id.value);
      showErrorToast.value = false;
    };
    onMounted(() => {
      const pages = getCurrentPages();
      // #ifdef MP-WEIXIN || H5
      if (pages.length < 2) {
        showHome.value = true;
      }
      // #endif
    });

    return {
      showHome,
      getPageDetail,
      id,
      pageFrom,
      itemInfo,
      dayjs,
      drugImage,
      parentSignatureImage,
      medicationRecordImage,
      showRecallModal,
      reason,
      showErrorToast,
      showStartTimePicker,
      selectFeedTime,
      medias,
      icon_punch_photo,
      updateAttachments,
      feedback,
      handelStateChange,
    };
  },
  methods: {
    changeLeaveStartTime: function (e: any) {
      this.selectFeedTime = dayjs(e).startOf('minute').valueOf();
    },
    itemEdit: function () {
      uni.navigateTo({
        url: `/app-preprimary-education/feed-medicine/guardian/add-detail/index?infoId=${this.id}&from=edit`,
      });
    },
    onRecallModalSubmit: async function () {
      try {
        await rollbackPageDetailApi(this.id);
        this.getPageDetail(this.id);
        uni.$emit('rollbackComplete'); //刷新列表页
      } catch (err) {
        if (err && err.code === 2000401) {
          this.showErrorToast = true;
        }
      } finally {
        this.showRecallModal = false;
      }
    },
    goBackIndex: function () {
      uni.navigateBack();
    },
    goBackHome: function () {
      const homePath = getHomeConf().homeMainPath;
      uni.reLaunch({
        url: homePath,
      });
    },
  },
});
</script>
<style lang="scss" scoped>
.detail-page {
  background-color: $ui-color-bg-light;
  padding-bottom: 240rpx;
  ::v-deep {
    .c-bottom {
      z-index: 9 !important;
    }
  }
  .content {
    padding: $ui-gap-large;
  }
  .des {
    display: flex;
    flex-wrap: nowrap;
    line-height: 44rpx;
    .label {
      min-width: 126rpx;
      // flex-basis: 126rpx;
      font-size: $ui-font-size-content;
      color: $ui-color-placeholder;
      flex-grow: 0;
      flex-shrink: 0;
      margin-right: $ui-gap-default;
    }
    .value {
      flex: 1;
      font-size: $ui-font-size-content;
      color: $ui-color-base;
      word-break: break-all;
    }
  }
  .img-wrap {
    margin-top: $ui-gap-xs;
    display: flex;
    flex-wrap: wrap;
    .img {
      margin-right: $ui-gap-default;
      margin-bottom: $ui-gap-default;
    }
    .no-radius-img {
      ::v-deep .u-image__image {
        border-radius: 0 !important;
      }
    }
  }
  .big-tip {
    color: #1d2129;
    font-size: $ui-font-size-title;
  }
  .pt-d {
    padding-top: 20rpx;
  }
}
.top {
  background-color: $ui-color-white;
  box-shadow: 0px 0px 20px 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-default;
  padding: $ui-gap-default $ui-gap-large;
  .leave-main {
    display: flex;
    flex-direction: row;
    &-image {
      width: 104rpx;
      height: 104rpx;
      border-radius: $uni-border-radius-circle;
    }
    &-info {
      margin-left: $ui-gap-large;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      &-top {
        font-size: $ui-font-size-xt;
        color: $ui-color-base;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      &-bottom {
        font-size: $ui-font-size-secondary;
        color: $ui-color-secondary;
      }
    }
  }
}
.middle {
  margin: $ui-gap-default 0;
  background-color: $ui-color-white;
  box-shadow: 0px 0px 20px 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-default;
  padding: $ui-gap-default $ui-gap-large;
  .item-value-placeholder {
    line-height: $ui-font-size-title * 1.67;
    color: $ui-color-placeholder;
  }

  .apply-setting-container {
    ::v-deep {
      .uni-list {
        border-radius: $ui-radius-default;
        box-shadow: none;
        .uni-list-item {
          padding-left: 0 !important;
          padding-right: 0 !important;
          font-size: $ui-font-size-title !important;
        }
      }
    }
  }
  .reason-textarea {
    margin: $ui-gap-default $ui-gap-default $ui-gap-default 0;
    height: 84rpx;
    overflow: hidden;
    ::v-deep {
      .c-input,
      .c-input-wrap {
        padding: 0rpx;
      }
      .uni-textarea-textarea {
        height: 84rpx;
        overflow-y: scroll;
      }
    }
  }
  .select-imgs-wrap {
    ::v-deep {
      .u-cell {
        padding: 0 !important;
      }
      .c-space-item {
        padding-right: 30rpx !important;
        padding-bottom: 20rpx !important;
      }
    }
  }
  .refuse-textarea {
    padding: $ui-gap-default;
    background: #f2f3f5;
    border-radius: 4px;
    color: #86909c;
    margin-top: $ui-gap-small;
    word-break: break-all;
  }
  .label-require::after {
    content: '*';
    display: inline;
    color: red;
    margin-left: $ui-gap-xxs;
    font-size: $ui-font-size-title;
  }
  .last-item:before {
    content: ' ';
    position: absolute;
    left: -40rpx;
    top: 20rpx;
    width: 1px;
    height: calc(100% + 32rpx);
    background-color: $ui-color-white;
  }
}
.footer {
  .btn-wrap {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
  }
  .text-size {
    font-size: 15px;
  }
}
.modal-content {
  .title-text {
    font-size: $ui-font-size-xt;
    color: $ui-color-base;
    text-align: center;
    line-height: 48rpx;
    font-weight: $ui-font-weight-bold;
    margin-bottom: $ui-gap-default;
  }
  .textarea {
    height: 140rpx;
    font-size: $ui-font-size-content;
    padding: $ui-gap-xxs $ui-gap-small;
    border: 1px solid rgba(230, 232, 235, 1);
    border-radius: 10px;
    width: calc(100% - 1rem);
  }
  .error-toast-con {
    text-align: center;
    font-size: 1.0625rem;
    font-weight: bold;
  }
}
</style>
