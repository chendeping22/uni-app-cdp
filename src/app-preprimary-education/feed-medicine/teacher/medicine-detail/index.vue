<template>
  <mt-page
    :show-notice-bar="false"
    bg-type="gray"
    class="detail-page"
    title="服药详情"
    :auto-show-left-icon="false"
    :show-top-gap="false"
  >
    <template #navbarLeft>
      <c-icon v-if="showHome" name="icon_back_home" :size="48" @click="goBackHome" />
      <c-icon v-else name="icon_arrow_left" :size="48" @click="goBackIndex" />
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
      <template v-if="itemInfo.status === 2">
        <view class="middle">
          <view class="des">
            <view class="big-tip">服药记录</view>
          </view>
          <!-- 添加选择时间控件 -->
          <view class="apply-setting-container">
            <uni-list>
              <uni-list-item
                :border="false"
                show-arrow
                clickable
                @click="showStartTimePicker = true"
              >
                <template #header>
                  <view class="label-require">服药时间</view>
                </template>
                <template #footer>
                  <view v-if="!selectFeedTime" class="item-value-placeholder item-require"
                    >请选择</view
                  >
                  <view v-else class="item-value item-value-placeholder">{{
                    dayjs(selectFeedTime).format('YYYY-MM-DD HH:mm')
                  }}</view>
                </template>
              </uni-list-item>
              <uni-list-item direction="column">
                <template #header>
                  <view>服药反馈</view>
                </template>
                <template #footer>
                  <view class="reason-textarea">
                    <c-input
                      v-model:value="feedback"
                      type="textarea"
                      :trim="false"
                      :show-clear="false"
                      :disable-default-padding="true"
                      placeholder="请输入服药情况，如孩子服药后的反应等"
                      :placeholder-style="reason.length ? 'color: #f53f3f;' : ''"
                      :maxlength="100"
                    />
                    <view class="text-right color-placeholder">
                      {{ feedback?.length || 0 }}/100
                    </view>
                  </view>
                </template>
              </uni-list-item>
              <uni-list-item direction="column">
                <template #header>
                  <view class="select-imgs-wrap"
                    ><select-attachment @changeData="data => updateAttachments(data)"
                  /></view>
                </template>
              </uni-list-item>
            </uni-list>
          </view>
        </view>
      </template>
      <template v-else>
        <view
          v-if="
            itemInfo.status !== 1 && itemInfo.medicationRecords && itemInfo.medicationRecords.length
          "
          class="middle"
        >
          <view class="des">
            <view class="big-tip">服药记录</view>
          </view>
          <template v-if="itemInfo.medicationRecords && itemInfo.medicationRecords.length">
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
          </template>
        </view>
      </template>

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
    <c-empty-line need-safe-bottom class-name="mtb-b" />
    <c-bottom v-if="itemInfo.status === 1" class="footer">
      <view class="btn-wrap">
        <c-button
          type="plain"
          heightSize="height-button-small"
          width="330rpx"
          class="bottom-btn"
          @click="showRejectModal = true"
        >
          <text class="text-size">拒绝</text>
        </c-button>
        <c-button
          type="primary"
          heightSize="height-button-small"
          width="330rpx"
          class="bottom-btn"
          @click="handleAgree"
        >
          <text class="text-size">同意</text>
        </c-button>
      </view>
    </c-bottom>
    <c-bottom v-show="itemInfo.status === 2 && !showStartTimePicker" class="footer">
      <u-button type="primary" @click="handleConfirmMedication"> 确认喂药 </u-button>
    </c-bottom>
  </mt-page>
  <c-modal v-model:show="showRejectModal" @onConfirm="handleConfirmReject" @onCancel="reason = ''">
    <view class="modal-content">
      <view class="title-text">是否确认拒绝？</view>
      <view class="radius-default border border-line-default">
        <c-input
          v-model:value="reason"
          type="textarea"
          class-name="textarea"
          placeholder="可输入拒绝原因"
          :maxlength="100"
        ></c-input>
        <view class="text-right color-placeholder pr-b">{{ reason?.length || 0 }}/100</view>
      </view>
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
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import {
  addRecords,
  agreeAction,
  filesType,
  getPageDetailApi,
  rejectAction,
  responsePageDetailType,
} from '@/app-preprimary-education/services/feedMedicine';
import icon_punch_photo from '@/app-preprimary-education/static/svg/icon_punch_photo.svg';
import { getHomeConf } from '@/app-preprimary-education/utils/env';
import { delay, showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import ProcessTag from '../../components/process-tag.vue';
import SelectAttachment from '../../components/select-attachment';
import TimePicker from '../../components/time-picker.vue';
export default defineComponent({
  components: {
    ProcessTag,
    TimePicker,
    SelectAttachment,
    mtPage,
    uniListItem,
    uniList,
  },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  onLoad(option: { infoId: string; from?: string }) {
    if (option) {
      const { infoId, from } = option;
      // if (from === 'apply') {
      //   this.isProcessed = true;
      // }
      this.id = infoId;
    }
  },
  onShow() {
    this.getLeaveDetail(this.id);
  },
  setup() {
    const id = ref<string>('');
    const showRejectModal = ref<boolean>(false);
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
    const getLeaveDetail = async (id: string) => {
      if (!id) return;
      const res = await getPageDetailApi(id);
      console.log('res---', res);
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
      getLeaveDetail,
      id,
      itemInfo,
      dayjs,
      drugImage,
      parentSignatureImage,
      medicationRecordImage,
      showRejectModal,
      reason,
      showErrorToast,
      showStartTimePicker,
      selectFeedTime,
      medias,
      icon_punch_photo,
      updateAttachments,
      feedback,
    };
  },
  methods: {
    handelStateChange: async function () {
      uni.$emit('refresh', {});
      this.showErrorToast = false;
      await delay(1000);
      this.goBackIndex();
    },
    changeLeaveStartTime: function (e: any) {
      //e转成时间戳
      this.selectFeedTime = dayjs(e).startOf('minute').valueOf();
    },
    handleAgree: function () {
      this.handleSave({ type: 'agree', values: this.itemInfo });
    },
    handleConfirmReject: function () {
      if (this.reason.length && !this.reason.trim()) {
        showInfo('拒绝原因不能全空格');
        this.reason = '';
        return false;
      }
      this.handleSave({ type: 'reject', reason: this.reason, values: this.itemInfo });

      this.showRejectModal = false;
      this.reason = '';
    },
    handleSave: async function (saveData: { type: string; reason?: string; values: any }) {
      try {
        if (saveData.type === 'agree') {
          await agreeAction(saveData.values.id as number);
        } else {
          await rejectAction(saveData.values.id as number, { refuseReason: saveData.reason });
        }
        showInfo('操作成功！');
        uni.$emit('refresh', {});
        await delay(1000);
        this.goBackIndex();
      } catch (err) {
        if (err && err.code === 2000401) {
          this.showErrorToast = true;
        }
      }
    },
    //确认喂药方法
    handleConfirmMedication: async function () {
      if (!this.selectFeedTime) {
        showInfo('请填写必填项');
        return;
      }
      if (this.feedback.length && !this.feedback.trim()) {
        showInfo('服药反馈不能全空格');
        this.feedback = '';
        return;
      }
      let files = [];
      files = this.medias.array.map((item: { fileId: any }) => ({
        fileId: item.fileId,
        uploadType: 3,
      }));
      try {
        await addRecords({
          feedback: this.feedback,
          medicationTime: this.selectFeedTime,
          medicationFileList: files,
          registerId: this.itemInfo.id,
        });
        showInfo('操作成功！');
        uni.$emit('refresh', {});
        await delay(1000);
        this.goBackIndex();
      } catch (err) {
        console.log(err);
      }
    },
    goBackIndex: function () {
      // const pages = getCurrentPages();
      // const len = pages.length;
      // const p1 = pages[len - 1]?.route;
      // const p2 = pages[len - 2]?.route;
      // uni.navigateBack({ delta: p1 && p1 === p2 ? 2 : 1 });
      // // if (this.isProcessed) {
      // //   uni.$emit('refresh', {});
      // // }
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
      margin-top: $ui-gap-default;
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
    overflow: hidden;
    ::v-deep {
      .c-input,
      .c-input-wrap {
        padding: 0rpx;
      }
      .uni-textarea-textarea {
        height: 240rpx;
        overflow-y: visible;
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
.error-toast-con {
  text-align: center;
  font-size: 1.0625rem;
  font-weight: bold;
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
}
</style>
