<template>
  <u-navbar
    title="智能填报"
    :back-icon-color="state.isFromShare !== '1' ? 'black' : primaryColor"
    :back-icon-name="state.isFromShare !== '1' ? 'nav-back' : 'home'"
    :custom-back="customBack"
    title-color="black"
    :title-bold="true"
  >
    <!-- #ifdef APP-PLUS || MP-WEIXIN -->
    <template #right>
      <view class="navbar-share" @click="showSharePopup = true">
        <u-icon name="zhuanfa" class="navbar-share-icon" />
      </view>
    </template>
    <!-- #endif -->
  </u-navbar>
  <view
    v-if="state.errorText"
    class="fill-error"
    :style="{
      height:
        'calc(100vh - ' +
        (48 + (systemInfo?.statusBarHeight || 0)) +
        'px - env(safe-area-inset-bottom))',
    }"
  >
    <p v-for="t in state.errorText" :key="t">{{ t }}</p>
  </view>
  <view
    v-if="!state.errorText && state.showContent === 0"
    class="fill-content"
    :style="{
      minHeight:
        'calc(100vh - ' +
        (48 + (systemInfo?.statusBarHeight || 0)) +
        'px - env(safe-area-inset-bottom))',
    }"
  >
    <view class="fill-header">
      <view class="fill-name">
        <marquee
          v-if="state.formData && state.formData.fillName"
          :label="state.formData.fillName"
        />
        <view v-else class="fill-name-default">/</view>
      </view>
      <view v-if="state.showContent === 0" class="fill-info" @click="handleShowMore">
        <view class="more-icon-wrapper">
          <u-icon name="info-circle-fill" class="icon-info" />
        </view>
        <view class="fill-more-dropdown">
          <u-dropdown
            v-if="dropdownShow"
            ref="dropdownRef"
            :close-on-click-mask="false"
            :close-on-click-self="false"
          >
            <u-dropdown-item>
              <view class="fill-more-wrapper">
                <scroll-view scroll-y class="fill-more-scroll">
                  <view class="fill-more-container">
                    <view class="more-info-item">
                      <view class="more-info-label">创建人</view>
                      <view class="more-info-text">{{ state.formData.creatorName }}</view>
                    </view>
                    <view class="more-info-item mt-xs">
                      <view class="more-info-label">创建时间</view>
                      <view class="more-info-text">
                        {{ dayjs(state.formData.createTime).format('YYYY-MM-DD HH:mm') }}
                      </view>
                    </view>
                    <view v-if="state.formData.issueName" class="more-info-item mt-xs">
                      <view class="more-info-label">分发人</view>
                      <view class="more-info-text">{{ state.formData.issueName }}</view>
                    </view>
                    <view v-if="state.formData.issueName" class="more-info-item mt-xs">
                      <view class="more-info-label">分发时间</view>
                      <view class="more-info-text">
                        {{ dayjs(state.formData.issueTime).format('YYYY-MM-DD HH:mm') }}
                      </view>
                    </view>
                    <view class="more-info-item mt-xs">
                      <view class="more-info-label">截止时间</view>
                      <view class="more-info-text">
                        {{
                          state.formData.delayTime
                            ? dayjs(state.formData.delayTime).format('YYYY-MM-DD HH:mm')
                            : '不限制'
                        }}
                      </view>
                    </view>
                    <view
                      v-if="!state.formData.currentFinish && state.formData.delayTime"
                      class="more-info-item mt-xs"
                    >
                      <view class="more-info-label">剩余时间</view>
                      <view class="more-info-text" :style="{ color: getTimeColor }">
                        {{ getDelayTime }}
                      </view>
                    </view>
                    <view class="more-info-item mt-xs">
                      <view class="more-info-label">滞留时间</view>
                      <view class="more-info-text">{{ getSpendTime }}</view>
                    </view>
                    <view class="more-info-item mt-xs">
                      <view class="more-info-label">填报说明</view>
                      <view class="more-info-text more-info-desc">{{
                        state.formData.description || '/'
                      }}</view>
                    </view>
                  </view>
                </scroll-view>
                <view class="fill-more-bottom">
                  <view class="fill-more-close" @click="handleCloseMore">
                    <u-icon name="close" />
                  </view>
                </view>
              </view>
            </u-dropdown-item>
          </u-dropdown>
        </view>
        <template v-if="state.formData.myCreate">
          <view class="fill-base-info">
            <view class="user-name text-ellipse">{{ state.formData.creatorName || '/' }}</view>
            <view class="base-info-text">
              <view>进度：</view>
              <view class="line-progress-wrapper">
                <u-line-progress
                  class="line-progress"
                  :active-color="progressBarColor"
                  :percent="state.formData.fillReportProgress"
                  :show-percent="false"
                  height="15"
                />
              </view>
              <view v-if="state.formData?.progressBarTag === 0">
                {{ state.formData?.fillReportProgress || '0' }}%
              </view>
              <view v-else-if="state.formData?.progressBarTag === 3">
                {{ state.formData?.fillReportProgress || '0' }}%
              </view>
              <u-icon
                v-else-if="state.formData?.progressBarTag === 1"
                name="checkmark-circle-fill"
                color="#52C41A"
                size="35"
              />
              <view v-else>
                <u-icon name="close-circle-fill" color="#FF4D4F" size="35" />
              </view>
            </view>
            <view class="base-info-text">耗时：{{ state.formData?.costTimeDesc }}</view>
          </view>

          <view v-if="state.formData.state === 2" class="fill-delay-time">
            <image class="fill-end" :src="iconStatusEnd" />
          </view>
          <view v-else-if="state.formData.state === 1" class="fill-delay-time">
            <image class="fill-submitted" :src="iconStatusCompleted" />
          </view>
        </template>
        <template v-else>
          <view class="fill-base-info">
            <view class="user-name text-ellipse">{{ state.formData.issueName || '/' }}</view>
            <view v-if="state.formData.currentFinish" class="base-info-text">
              提交：{{
                state.formData.commitTime
                  ? dayjs(state.formData.commitTime).format('YYYY-MM-DD HH:mm')
                  : '/'
              }}
            </view>
            <view v-if="state.formData.currentFinish" class="base-info-text">
              耗时：{{ getSpendTime }}
            </view>
          </view>
          <view v-if="state.formData.currentFinish" class="fill-delay-time">
            <image class="fill-submitted" :src="iconStatusSubmitted" />
          </view>
          <view v-else class="fill-delay-time" :style="{ color: getTimeColor }">
            {{ getDelayTime }}
          </view>
        </template>
      </view>
    </view>
    <view class="page-fill-detail">
      <view class="fill-table-wrapper">
        <view class="fill-table-scroll-x" :style="tableWidth">
          <view class="fill-table-head">
            <view class="fill-table-row">
              <view
                v-if="state.exampleData || state.dataSource.length > 0"
                class="fill-table-index-cell"
              />
              <view
                v-for="col in state.columns"
                :key="col.prop"
                class="fill-table-cell"
                :class="state.columns.length === 1 ? 'only-one-col' : ''"
              >
                <image v-if="col.type === 'input'" class="fill-table-col-icon" :src="iconText" />
                <image
                  v-if="col.type === 'inputPhone'"
                  class="fill-table-col-icon"
                  :src="iconPhone"
                />
                <u-icon v-if="col.type === 'inputEmail'" class="fill-table-col-icon" name="email" />
                <image
                  v-if="col.type === 'inputIdCard'"
                  class="fill-table-col-icon"
                  :src="iconIdCard"
                />
                <image
                  v-if="col.type === 'inputNumber'"
                  class="fill-table-col-icon"
                  :src="iconNumber"
                />
                <image v-if="col.type === 'radio'" class="fill-table-col-icon" :src="iconRadio" />
                <image
                  v-if="col.type === 'select'"
                  class="fill-table-col-icon"
                  :src="iconCheckbox"
                />
                <u-icon
                  v-if="col.type === 'datePicker'"
                  class="fill-table-col-icon"
                  name="calendar"
                />
                <u-icon v-if="col.type === 'uploadImg'" class="fill-table-col-icon" name="photo" />
                <u-icon
                  v-if="col.type === 'uploadFile'"
                  class="fill-table-col-icon"
                  name="file-text"
                />
                <image
                  v-if="col.type === 'slider'"
                  class="fill-table-col-icon"
                  :src="iconProgress"
                />
                <u-icon
                  v-if="col.type === 'userSelect'"
                  class="fill-table-col-icon"
                  name="account"
                />
                <view style="flex: 1">{{ col.label }}</view>
              </view>
            </view>
          </view>
          <view v-if="state.exampleData" class="fill-table-row">
            <view class="fill-table-index-cell">示例</view>
            <view
              v-for="col in state.columns"
              :key="col.prop"
              class="fill-table-cell"
              :class="state.columns.length === 1 ? 'only-one-col' : ''"
            >
              <template
                v-if="
                  col.type === 'input' ||
                  col.type === 'inputPhone' ||
                  col.type === 'inputEmail' ||
                  col.type === 'inputIdCard' ||
                  col.type === 'radio' ||
                  col.type === 'select' ||
                  col.type === 'userSelect'
                "
              >
                {{ state.exampleData[col.prop] || '——' }}
              </template>
              <template v-if="col.type === 'inputNumber'">
                {{ getNumberValue(col, state.exampleData[col.prop]) || '——' }}
              </template>
              <template v-if="col.type === 'datePicker'">
                {{
                  state.exampleData[col.prop]
                    ? dayjs(state.exampleData[col.prop]).format(col.format)
                    : '——'
                }}
              </template>
              <template v-if="col.type === 'uploadImg'">
                <view
                  v-if="state.exampleData[col.prop] && state.exampleData[col.prop].length > 0"
                  class="image-list"
                >
                  <view
                    v-for="(img, k) in state.exampleData[col.prop] || []"
                    :key="img.fileId + k"
                    class="image-item"
                  >
                    <image class="image-item-img" :src="img.url" :lazy-load="true" />
                  </view>
                </view>
                <template v-else>——</template>
              </template>
              <template v-if="col.type === 'uploadFile'">
                <template
                  v-if="state.exampleData[col.prop] && state.exampleData[col.prop].length > 0"
                >
                  <view
                    v-for="file in state.exampleData[col.prop]"
                    :key="file.fileId"
                    class="fill-table-file"
                  >
                    {{ file.name }}
                  </view>
                </template>
                <template v-else>——</template>
              </template>
              <template v-if="col.type === 'slider'">
                <u-line-progress
                  class="fill-table-progress"
                  :active-color="col.color"
                  :percent="getPercentValue(state.exampleData[col.prop])"
                >
                  <view class="fill-table-progress-text">
                    {{ getPercent(col, state.exampleData[col.prop]) }} %
                  </view>
                </u-line-progress>
              </template>
            </view>
          </view>
          <view :style="{ minHeight: totalHeight ? totalHeight + 'px' : '' }">
            <view :style="{ height: prevHideRowsHeight + 'px' }"></view>
            <template v-for="(record, index) in state.dataSource" :key="record.id">
              <view
                v-if="
                  !record.height ||
                  (index > currentTopRowIndex - 35 && index < currentTopRowIndex + 35)
                "
                class="fill-table-row"
                :height="record.height || 0"
                :class="!record.height ? 'show-table-row' : ''"
                @click="handleRowClick(index)"
              >
                <view class="fill-table-index-cell">{{ index + 1 }}</view>
                <view
                  v-for="col in state.columns"
                  :key="col.prop"
                  class="fill-table-cell"
                  :class="state.columns.length === 1 ? 'only-one-col' : ''"
                >
                  <template
                    v-if="
                      col.type === 'input' ||
                      col.type === 'inputPhone' ||
                      col.type === 'inputEmail' ||
                      col.type === 'inputIdCard' ||
                      col.type === 'radio' ||
                      col.type === 'select' ||
                      col.type === 'userSelect'
                    "
                  >
                    {{ record[`${col.prop}_name`] || '——' }}
                  </template>
                  <template v-if="col.type === 'inputNumber'">
                    {{ getNumberValue(col, record[col.prop]) || '——' }}
                  </template>
                  <template v-if="col.type === 'datePicker'">
                    {{ record[col.prop] ? dayjs(record[col.prop]).format(col.format) : '——' }}
                  </template>
                  <template v-if="col.type === 'uploadImg'">
                    <template
                      v-if="
                        !record.height ||
                        (index > currentTopRowIndex - 2 && index < currentTopRowIndex + 12)
                      "
                    >
                      <view
                        v-if="record[col.prop] && record[col.prop].length > 0"
                        class="image-list"
                      >
                        <view
                          v-for="(img, k) in record[col.prop] || []"
                          :key="img.fileId + k"
                          class="image-item"
                        >
                          <image class="image-item-img" :src="img.url" :lazy-load="true" />
                        </view>
                      </view>
                      <template v-else>——</template>
                    </template>
                  </template>
                  <template v-if="col.type === 'uploadFile'">
                    <template v-if="record[col.prop] && record[col.prop].length > 0">
                      <view
                        v-for="(file, k) in record[col.prop]"
                        :key="file.fileId + k"
                        class="fill-table-file"
                      >
                        {{ file.name }}
                      </view>
                    </template>
                    <template v-else>——</template>
                  </template>
                  <template v-if="col.type === 'slider'">
                    <u-line-progress
                      class="fill-table-progress"
                      :active-color="col.color"
                      :percent="getPercentValue(record[col.prop])"
                    >
                      <view class="fill-table-progress-text">
                        {{ getPercent(col, record[col.prop]) }} %
                      </view>
                    </u-line-progress>
                  </template>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>
      <u-loadmore :status="state.status" margin-top="24" margin-bottom="280" @loadmore="loadMore" />
      <view class="safe-area-inset-bottom"></view>
    </view>
  </view>
  <view
    v-if="!state.errorText && state.showContent > 0 && state.formData.id"
    class="fill-card-content"
    :style="{
      height:
        'calc(100vh - ' +
        (48 + (systemInfo?.statusBarHeight || 0)) +
        'px - env(safe-area-inset-bottom))',
    }"
  >
    <view class="fill-header">
      <view class="fill-name">
        <marquee
          v-if="state.formData && state.formData.fillName"
          disabled
          :label="state.formData.fillName"
        />
        <view v-else class="fill-name-default">/</view>
      </view>
    </view>
    <view v-if="state.showContent === 1 && state.formData.id" class="fill-add-wrapper">
      <view class="add-item-content">
        <FillRecordCard
          class="swiper-item-card"
          :columns="state.columns"
          :seq-id="state.formData.seqId"
          :report-id="state.id"
          :flow-before-id="state.flowBeforeId"
          @close="handleSwiperClose"
          @add="handleAdd"
        />
      </view>
    </view>
    <view v-if="state.showContent === 2 && state.formData.id" class="fill-add-wrapper">
      <view class="swiper-wrapper">
        <fill-report-swiper
          :total="state.exampleData ? state.total + 1 : state.total"
          :length="state.exampleData ? state.dataSource.length + 1 : state.dataSource.length"
          :current="state.swiperCurrent"
          :disable-touch="state.currentEditing"
          @loadmore="loadMore"
        >
          <template #item="{ index }">
            <view class="swiper-item-content">
              <FillExampleCard
                v-if="state.exampleData && index === 0"
                class="swiper-item-card"
                :data="state.exampleData"
                :columns="state.columns"
              />
              <FillRecordCard
                v-else
                class="swiper-item-card"
                :readonly="state.formData.currentFinish"
                :total="state.total"
                :index="state.exampleData ? index - 1 : index"
                :data="state.dataSource[state.exampleData ? index - 1 : index]"
                :columns="state.columns"
                :seq-id="state.formData.seqId"
                :report-id="state.id"
                :flow-before-id="state.flowBeforeId"
                @delete="() => handleDelete(index)"
                @update="(values: any) => handleUpdate(index, values)"
                @close="handleSwiperClose"
                @editing="(value: boolean) => (state.currentEditing = value)"
              />
            </view>
          </template>
        </fill-report-swiper>
      </view>
    </view>
  </view>
  <floating-actions
    v-if="
      !state.errorText &&
      (state.showContent === 0 || state.showContent === 2) &&
      state.formData.id &&
      !state.currentEditing
    "
    :actions="getActions"
    @actionClick="handleActionClick"
  />
  <u-modal
    v-model="state.confirmSubmit"
    :content="state.confirmText"
    show-cancel-button
    @confirm="handleSubmit"
    @cancel="state.confirmSubmit = false"
  />
  <dispatch
    v-if="state.flowBeforeId && state.id"
    v-model="state.showDispatch"
    :flow-before-id="state.flowBeforeId"
    :fill-report-id="state.id"
  />
  <u-popup
    v-model="showSharePopup"
    closeable
    mode="bottom"
    :safe-area-inset-bottom="true"
    border-radius="16"
    height="320rpx"
    close-icon-color="#000"
    close-icon-size="40"
  >
    <view class="share-title">分享至</view>
    <view class="share-list">
      <!-- #ifdef MP-WEIXIN -->
      <button class="share-item" open-type="share">
        <u-icon name="weixin-fill" class="share-item-icon wx" />
        <view class="share-item-text">微信</view>
      </button>
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <view class="share-item" @click="handleShareWX">
        <u-icon name="weixin-fill" class="share-item-icon wx" />
        <view class="share-item-text">微信</view>
      </view>
      <!-- #endif -->
      <view class="share-item"></view>
      <view class="share-item"></view>
      <view class="share-item"></view>
    </view>
  </u-popup>
  <view class="share-canvas-wrapper">
    <canvas id="shareCanvas" canvas-id="shareCanvas" />
  </view>
</template>

<script lang="ts" setup>
import { getFileInfo, getUploadUrl, updateUploadResult, uploadFile } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { Server_Asset_Prefix } from '@/utils/constant';
import { EUserIdentityType, createSharePath } from '@/utils/handle-share-link';
import { EUserType } from '@/utils/kind';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad, onPageScroll, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import * as api from '../../services/fill-report';
import iconCheckbox from '../../static/columns/checkbox.svg';
import iconIdCard from '../../static/columns/id-card.svg';
import iconNumber from '../../static/columns/number.svg';
import iconPhone from '../../static/columns/phone.svg';
import iconProgress from '../../static/columns/progress-bar.svg';
import iconRadio from '../../static/columns/radio.svg';
import iconText from '../../static/columns/text.svg';
import iconDispatch from '../../static/dispatch.svg';
import iconMyDispatches from '../../static/my-dispatches.svg';
import iconPlus from '../../static/plus.svg';
import iconSharePicture from '../../static/share-intelligent-reporting.jpg';
import iconStatusCompleted from '../../static/status-completed.svg';
import iconStatusEnd from '../../static/status-end.svg';
import iconStatusSubmitted from '../../static/status-submitted.svg';
import iconSubmit from '../../static/submit.svg';
import iconSwitchView from '../../static/switch-view.svg';
import Dispatch from '../components/dispatch.vue';
import FillExampleCard from '../components/fill-example-card.vue';
import FillRecordCard from '../components/fill-record-card.vue';
import FillReportSwiper from '../components/fill-report-swiper.vue';
import FloatingActions from '../components/floating-actions.vue';
import Marquee from '../components/marquee.vue';
import iconAvatar from '/static/avatar.png';

const store = loginStore();

dayjs.locale('zh-cn');

const primaryColor = getPrimaryColor();

const systemInfo = uni.getSystemInfoSync();

defineProps<{
  fillReportId: string;
  flowBeforeId?: string;
  fromType?: string;
  isFromShare?: string; // 1 表示来自分享
}>();

const showSharePopup = ref(false);
const state = reactive({
  id: '',
  flowBeforeId: '',
  fromType: '',
  formData: {} as any,
  errorText: null as any,
  columns: [] as any[],
  exampleData: null as any,
  dataSource: [] as any[],
  pageSize: 20,
  pageNum: 1,
  total: 0,
  status: 'loading',
  hasNext: true,
  showContent: 0, // 0 填报数据列表，1 新增一行，2 卡片模式
  swiperCurrent: 0, // 有示例数据的时候，0为示例数据（示例数据也属于swiper的卡片）
  currentEditing: false, // 卡片当前是否处于编辑状态，编辑状态下，不允许轮播
  confirmType: -1, // 1 提交确认，2 结束确认，3 删除确认
  confirmSubmit: false,
  confirmText: '',
  deleteItem: {} as any,
  showDispatch: false,
  isFromShare: '',
  canvasContext: null as any,
  canvasWidth: 0,
  canvasBgHeight: 0,
  textAreaHeight: 0,
  shareImageUrl: '',
});
const getActions = computed(() => {
  if (!state.formData.id) {
    return [];
  }
  const actionAdd = { key: 'add', image: iconPlus, title: '增加一行' };
  const actionMyDispatches = { key: 'myDispatches', image: iconMyDispatches, title: '分发情况' };
  const actionSwitchView = { key: 'switchView', image: iconSwitchView, title: '切换视图' };
  const actionDispatch = { key: 'dispatch', image: iconDispatch, title: '分发' };
  const actionSubmit = { key: 'submit', image: iconSubmit, title: '提交' };
  const actionEnd = { key: 'end', image: iconSubmit, title: '结束' };
  const res: any[] = [];
  if (state.formData.state !== 2 && !state.formData.currentFinish) {
    res.push(actionAdd);
  }
  // 学生和家长隐藏分发情况
  if (store.currentUserType === EUserType.teacher) {
    res.push(actionMyDispatches);
  }
  res.push(actionSwitchView);
  if (!state.formData.currentFinish) {
    // // 学生和家长隐藏分发情况
    if (store.currentUserType === EUserType.teacher) {
      res.push(actionDispatch);
    }
  }
  if (!state.formData.currentFinish && state.formData.state !== 2 && !state.formData.myCreate) {
    res.push(actionSubmit);
  }
  if (!state.formData.currentFinish && state.formData.myCreate) {
    res.push(actionEnd);
  }
  return res;
});
function getTimeStr(diffValue: number) {
  let result = '';
  if (diffValue < 0) return result;
  diffValue = Math.floor(diffValue / 1000);
  const days = Math.floor(diffValue / 86400);
  const hours = Math.floor((diffValue - days * 86400) / 3600);
  const minutes = Math.floor((diffValue - days * 86400 - hours * 3600) / 60);
  if (days > 0) {
    result += days + '天';
  }
  if (result || hours > 0) {
    result += hours + '时';
  }
  if (result || minutes > 0) {
    result += minutes + '分';
  }
  return result;
}
const currentTopRowIndex = ref(0);
const totalHeight = ref(0);
const prevHideRowsHeight = ref(0);
let updateScrollTopTimeout: any = 0;
let updateScrollTopValue = 0;
const query = uni.createSelectorQuery();
function updateItemsScrollTop() {
  query
    .selectAll('.show-table-row')
    .boundingClientRect((res: any) => {
      let topIndex = 0;
      let resTotal = 0;
      let resPrev = 0;
      let resIndex = 0;
      state.dataSource.forEach((i, index) => {
        const prevItem = state.dataSource[index - 1];
        if (prevItem) {
          i.scrollTop = prevItem.scrollTop + prevItem.height;
        } else {
          i.scrollTop = 286;
        }
        if (!i.height) {
          i.height = res[resIndex].height;
          resIndex += 1;
        }
        if (i.scrollTop && i.scrollTop - updateScrollTopValue < 0) {
          topIndex = index;
        }
      });
      state.dataSource.forEach((i, index) => {
        if (i.height && index <= topIndex - 35) {
          resPrev += i.height || 0;
        }
        resTotal += i.height || 0;
      });
      currentTopRowIndex.value = topIndex;
      totalHeight.value = resTotal;
      prevHideRowsHeight.value = resPrev;
    })
    .exec();
}
function updateScrollTop() {
  let topIndex = 0;
  let resTotal = 0;
  let resPrev = 0;
  state.dataSource.forEach((i, index) => {
    if (i.scrollTop && i.scrollTop - updateScrollTopValue < 0) {
      topIndex = index;
    }
  });
  state.dataSource.forEach((i, index) => {
    if (i.height && index <= topIndex - 35) {
      resPrev += i.height || 0;
    }
    resTotal += i.height || 0;
  });
  currentTopRowIndex.value = topIndex;
  totalHeight.value = resTotal;
  prevHideRowsHeight.value = resPrev;
}
function updateScrollTopDebounce(top: number) {
  updateScrollTopValue = top;
  if (updateScrollTopTimeout) {
    return;
  }
  updateScrollTopTimeout = setTimeout(() => {
    updateScrollTopTimeout = 0;
    updateScrollTop();
  }, 200);
}
onBeforeUnmount(() => {
  if (updateScrollTopTimeout) {
    clearTimeout(updateScrollTopTimeout);
    updateScrollTopTimeout = 0;
  }
});
onPageScroll(e => {
  updateScrollTopDebounce(e.scrollTop);
});

const getDelayTime = computed(() => {
  const time = state.formData.delayTime;
  if (!time) return '';
  let diffValue = time - Date.now();
  if (diffValue < 0) {
    return '已超时';
  }
  return getTimeStr(diffValue + 59999);
});
const getSpendTime = computed(() => {
  if (typeof state.formData.costTime !== 'number') {
    return '';
  }
  let result = '';
  const diffValue = state.formData.costTime || 1;
  const days = Math.floor(diffValue / 1440);
  const hours = Math.floor((diffValue - days * 1440) / 60);
  const minutes = diffValue - days * 1440 - hours * 60;
  if (days > 0) {
    result += days + '天';
  }
  if (result || hours > 0) {
    result += hours + '时';
  }
  if (result || minutes > 0) {
    result += minutes + '分';
  }
  return result;
});
// 剩余时间
const getTimeColor = computed(() => {
  const time = state.formData.delayTime;
  if (!time) return '';
  let diffValue = time - Date.now();
  if (diffValue < 0) return '#FF4D4F';
  diffValue += 59999;
  diffValue = Math.floor(diffValue / 1000);
  const days = Math.floor(diffValue / 86400);
  if (days > 2) {
    return '#52C41A';
  } else if (days > 0) {
    return '#FAAD14';
  } else {
    return '#FF4D4F';
  }
});
const progressBarColor = computed(() => {
  switch (state.formData.progressBarColor) {
    case 'red':
      return '#ff4d4f';
    case 'orange':
      return '#ffa500';
    case 'green':
      return '#52c41a';
    case 'blue':
      return '#1677ff';
    default:
      return '#8c8c8c';
  }
});
const tableWidth = computed(() => {
  let width = state.columns.length * 400 + 48;
  if (state.exampleData || state.dataSource.length > 0) {
    width += 110;
  }
  return {
    width: width + 'rpx',
  };
});
async function fetchDetail() {
  try {
    state.errorText = null;
    const res: any = await api.getFillReportInfo(state.id, state.flowBeforeId, state.fromType);
    if (res.templateMode) {
      state.errorText = ['移动端暂不支持多表填报任务，', '请使用电脑浏览器登录处理。'];
      return false;
    }
    state.formData = res;
    state.flowBeforeId = state.flowBeforeId || res.flowBeforeId;
    const columnData = JSON.parse(res.columnData);
    state.columns = columnData.columnList;
    let exampleData: any = null;
    if (res.exampleData) {
      exampleData = JSON.parse(res.exampleData);
      fixedExampleData(exampleData, state.columns);
    }
    state.exampleData = exampleData;

    // #ifdef APP-PLUS || MP-WEIXIN
    nextTick(() => {
      _setShareImg();
    });
    // #endif
  } catch (error: any) {
    state.errorText = [error?.msg || error?.desc || '请求服务器失败'];
    return false;
  }

  return true;
}
function fixedExampleData(exampleData: any, columnList: any) {
  columnList.forEach((col: any) => {
    if (col.type === 'select' && exampleData[col.prop]) {
      exampleData[col.prop] = (exampleData[col.prop] || []).join(',');
    } else if (
      col.type === 'userSelect' &&
      exampleData[col.prop] &&
      exampleData[`${col.prop}_name`]
    ) {
      if (col.multiple) {
        exampleData[col.prop] = exampleData[`${col.prop}_name`].join(';');
      } else {
        exampleData[col.prop] = exampleData[`${col.prop}_name`];
      }
    }
  });
}
const dropdownRef = ref<any>();
const dropdownShow = ref(false);

async function handleShowMore() {
  if (!state.formData.id) {
    return;
  }
  dropdownShow.value = true;
  setTimeout(() => {
    if (dropdownRef.value) {
      dropdownRef.value.menuClick(0);
    }
  }, 250);
}
function handleCloseMore() {
  if (dropdownRef.value) {
    dropdownRef.value.close();
    setTimeout(() => {
      dropdownShow.value = false;
    }, 250);
  }
}
// 小数位四舍五入
function sp_round(num: string, precision: number) {
  // 检验数字字符串
  let v = num;
  if (num.includes('.')) {
    v += '00001';
  } else {
    v += '.00001';
  }

  let [integerPart, decimalPart] = v.split('.');
  decimalPart = [decimalPart.substr(0, precision), decimalPart.substr(precision, 1)].join('.');
  decimalPart = Math.round(+decimalPart).toString();
  if (decimalPart === '0') {
    if (precision > 0) {
      decimalPart = '00000'.substr(0, precision);
      return [integerPart, decimalPart].join('.');
    } else {
      return integerPart;
    }
  } else {
    if (decimalPart.length > precision) {
      // 整数部分需要进1
      decimalPart = decimalPart.substr(1, precision);
      if (integerPart[0] === '-') {
        integerPart = (BigInt(integerPart) - BigInt(1)).toString();
      } else {
        integerPart = (BigInt(integerPart) + BigInt(1)).toString();
      }
      if (!decimalPart) {
        return integerPart;
      }
      return [integerPart, decimalPart].join('.');
    } else {
      if (precision > 0) {
        decimalPart = ('00000' + decimalPart).substr(-precision);
        return [integerPart, decimalPart].join('.');
      } else {
        return integerPart;
      }
    }
  }
}
function fixNumber(num: string) {
  let v = num.split('.');
  v[0] = BigInt(v[0]).toString();
  if (v[1]) {
    v[1] = v[1].replace(/0+$/g, '');
  }
  return v.join('.');
}
function getNumberValue(col: any, value: string) {
  if (!value || !value.trim()) {
    return '';
  }
  let v = value.trim();
  if (!Number.isNaN(Number(v))) {
    v = fixNumber(v);
    if (col.precision >= 0) {
      v = sp_round(v, col.precision);
    }
    if (col.thousands) {
      const valueArr = v.split('.');
      valueArr[0] = valueArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return valueArr.join('.');
    }
    return v;
  } else {
    return '';
  }
}
function getPercentValue(value: string) {
  return +value || 0;
}
function getPercent(col: any, value: string) {
  // 仅仅后面补0，不做四舍五入
  return (+(value || '0')).toFixed(col.precision);
}
async function getPageList() {
  try {
    state.status = 'loading';
    const res: any = await api.getReportList({
      currentPage: state.pageNum,
      pageSize: state.pageSize,
      id: state.id,
      flowBeforeId: state.flowBeforeId,
    });

    if (state.pageNum === 1) {
      state.dataSource = [...res.list];
    } else {
      state.dataSource = state.dataSource.concat(res.list || []);
    }
    state.total = res?.pagination?.total || 0;

    if (state.showContent === 0) {
      nextTick(() => {
        updateItemsScrollTop();
      });
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.status = state.dataSource.length >= state.total ? 'nomore' : 'loadmore';
    uni.stopPullDownRefresh();
  }
}
function handleSwiperClose() {
  state.showContent = 0;
  nextTick(() => {
    updateItemsScrollTop();
  });
  state.currentEditing = false;
}
function handleActionClick({ key }: any) {
  if (!state.formData.id) {
    return;
  }
  if (key === 'add') {
    state.showContent = 1;
  } else if (key === 'myDispatches') {
    uni.navigateTo({
      url: `/app-school-affairs/fill-report/dispatch/index?reportId=${state.formData.id}&delayTime=${state.formData.delayTime}&flowBeforeId=${state.flowBeforeId}`,
    });
  } else if (key === 'switchView') {
    if (state.showContent === 2) {
      state.showContent = 0;
      return;
    }
    if (state.dataSource.length > 0) {
      state.swiperCurrent = 0;
      state.showContent = 2;
    } else {
      showInfo('暂无数据，无法切换视图');
      return;
    }
  } else if (key === 'dispatch') {
    state.showDispatch = true;
  } else if (key === 'submit') {
    if (state.dataSource.length === 0) {
      showInfo('暂无任何数据，请填写后再提交');
      return;
    }
    state.confirmType = 1;
    state.confirmText = '确认提交当前提报吗？提交后不可编辑';
    state.confirmSubmit = true;
  } else if (key === 'end') {
    state.confirmType = 2;
    state.confirmText = `您确定结束“${state.formData.fillName}”的填报任务？此操作不可逆，结束后您将不可再编辑填报任务信息。`;
    state.confirmSubmit = true;
  }
}
function handleRowClick(index: number) {
  if (state.exampleData) {
    state.swiperCurrent = index + 1;
  } else {
    state.swiperCurrent = index;
  }
  state.showContent = 2;
}
function handleSubmit() {
  if (state.confirmType === 3) {
    showLoading();
    api
      .deleteReportItem(state.id, state.flowBeforeId, state.deleteItem.id)
      .then(() => {
        if (!state.exampleData && state.dataSource.length === 1) {
          state.showContent = 0;
          nextTick(() => {
            state.total -= 1;
            state.dataSource.splice(state.swiperCurrent, 1);
          });
          return;
        }
        state.showContent = -1;
        state.currentEditing = false;
        nextTick(() => {
          if (state.exampleData) {
            state.total -= 1;
            state.dataSource.splice(state.swiperCurrent - 1, 1);
            if (state.swiperCurrent >= state.total) {
              state.swiperCurrent -= 1;
            }
          } else {
            state.total -= 1;
            state.dataSource.splice(state.swiperCurrent, 1);
            if (state.swiperCurrent >= state.total - 1) {
              state.swiperCurrent -= 1;
            }
          }
          state.showContent = 2;
        });
      })
      .finally(() => {
        hideLoading();
      });
  } else if (state.confirmType === 1) {
    showLoading();
    api
      .submitReport(state.id, state.flowBeforeId)
      .then(() => {
        hideLoading();
        showInfo('提交成功');
        fetchDetail();
      })
      .catch((err: any) => {
        hideLoading();
        showInfo(err?.msg || err?.desc || '提交失败');
      });
  } else if (state.confirmType === 2) {
    showLoading();
    api
      .endReport(state.id)
      .then(() => {
        hideLoading();
        showInfo('结束成功');
        fetchDetail();
      })
      .catch((err: any) => {
        hideLoading();
        showInfo(err?.msg || err?.desc || '结束失败');
      });
  }
}
function handleAdd() {
  state.pageNum = 1;
  getPageList();
}
function handleUpdate(index: any, values: any) {
  const _index = state.exampleData ? index - 1 : index;
  state.dataSource[_index] = values;
  state.currentEditing = false;
}
function handleDelete(index: any) {
  const _index = state.exampleData ? index - 1 : index;
  const item = state.dataSource[_index];
  state.deleteItem = item;
  state.confirmType = 3;
  state.confirmText = '确定要删除当前填写记录吗？';
  state.confirmSubmit = true;
}
function customBack() {
  if (state.isFromShare === '1') {
    uni.switchTab({
      url: `/pages/workbench/index`,
    });
  } else {
    uni.navigateBack();
  }
}
onLoad(async (option: any) => {
  state.id = option.fillReportId || '';
  state.flowBeforeId = option.flowBeforeId || '';
  state.fromType = option.fromType || '';
  state.isFromShare = option.isFromShare || '';
  try {
    showLoading();
    await fetchDetail();
    state.pageNum = 1;
    await getPageList();
    hideLoading();
  } catch (error: any) {
    hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  }
});
function loadMore() {
  if (state.status === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
}
onReachBottom(() => {
  if (state.showContent !== 0) {
    return;
  }
  loadMore();
});
onPullDownRefresh(async () => {
  try {
    showLoading();
    state.showContent = 0;
    await fetchDetail();
    state.pageNum = 1;
    await getPageList();
  } finally {
    hideLoading();
  }
});
onMounted(async () => {
  const context = uni.createCanvasContext('shareCanvas');
  query
    .select('#shareCanvas')
    .boundingClientRect((res: any) => {
      state.canvasWidth = res.width; // 将upx单位转换为px，假设设计稿宽度为750rpx
      state.canvasBgHeight = 116 * (state.canvasWidth / 210);
      context.setFillStyle('white'); // 设置背景颜色为白色，可以替换为其他颜色
      context.fillRect(0, 0, res.width, res.height);
      state.textAreaHeight = res.height - state.canvasBgHeight;
      context.drawImage(iconSharePicture, 0, 0, state.canvasWidth, state.canvasBgHeight); // 绘制SVG图片
      context.save();
      state.canvasContext = context;
    })
    .exec();
});
// 绘制分享的canvas
function transformContentToMultiLineText(
  ctx: any,
  text: string,
  contentWidth: number,
  lineNumber: number,
) {
  let textArray = text.split(''); // 分割成字符串数组
  let temp = '';
  let row: string[] = [];

  for (let i = 0; i < textArray.length; i++) {
    if (ctx.measureText(temp).width < contentWidth) {
      temp += textArray[i];
    } else {
      i--; // 这里添加i--是为了防止字符丢失
      row.push(temp);
      temp = '';
    }
  }
  row.push(temp);

  // 如果数组长度大于2，则截取前两个
  if (row.length > lineNumber) {
    let rowCut = row.slice(0, lineNumber);
    let rowPart = rowCut[lineNumber - 1];
    let test = '';
    for (let a = 0; a < rowPart.length; a++) {
      if (ctx.measureText(test + '...').width < contentWidth) {
        test += rowPart[a];
      } else {
        break;
      }
    }
    let group = test + '...';
    rowCut.splice(lineNumber - 1, 1, group);
    row = rowCut;
  }
  return row;
}
async function _setShareImg() {
  if (!state.canvasContext) {
    setTimeout(() => {
      _setShareImg();
    }, 200);
    return;
  }
  const context = state.canvasContext;
  context.fillStyle = 'rgba(0, 0, 0, 0.88)'; // 设置文案颜色
  context.font = '12px Arial'; // 设置文案字体和大小
  const lines = transformContentToMultiLineText(
    context,
    state.formData.creatorName + '创建的智能填报',
    state.canvasWidth - 70,
    2,
  );
  let avatarPaddingTop = state.canvasBgHeight + (state.textAreaHeight - 60) / 2;
  let textPaddingTop = state.canvasBgHeight + (state.textAreaHeight - lines.length * 14) / 2;
  lines.forEach((txt, index) => {
    context.fillText(txt, 60, textPaddingTop + 14 * index);
  });
  context.save();
  context.fillStyle = 'rgba(0, 0, 0, 0.45)'; // 设置文案颜色
  context.font = '11px Arial'; // 设置文案字体和大小
  const delayTimeStr =
    '截止时间：' +
    (state.formData.delayTime
      ? dayjs(state.formData.delayTime).format('YYYY-MM-DD HH:mm')
      : '不限制');
  context.fillText(delayTimeStr, 60, textPaddingTop + 14 * lines.length + 6);
  context.save();
  context.beginPath();
  context.arc(30, avatarPaddingTop + 30, 20, 0, 2 * Math.PI);
  context.clip();
  if (state.formData.creatorHeadImg) {
    await new Promise(resolve => {
      try {
        // 在微信小程序上 downloadFile 合法域名 添加了 https://test2impfile.lexikos.com
        uni.getImageInfo({
          src: state.formData.creatorHeadImg,
          success: res => {
            // 绘制圆形头像
            context.drawImage(res.path, 10, avatarPaddingTop + 10, 40, 40);
            resolve(res.path);
          },
          fail: (error: any) => {
            console.log('getImageInfo error', error);
            resolve(true);
            context.drawImage(iconAvatar, 10, avatarPaddingTop + 10, 40, 40);
          },
        });
      } catch (error: any) {
        console.log('getImageInfo2 error', error);
        resolve(true);
        context.drawImage(iconAvatar, 10, avatarPaddingTop + 10, 40, 40);
      }
    });
  } else {
    context.drawImage(iconAvatar, 10, avatarPaddingTop + 10, 40, 40);
  }
  context.save();
  context.draw(false, () => {
    uni.canvasToTempFilePath({
      fileType: 'jpg',
      canvasId: 'shareCanvas', // canvas 的 id
      success: (res2: any) => {
        uni.getImageInfo({
          src: res2.tempFilePath,
          success: res3 => {
            if (res3.path) {
              state.shareImageUrl = res3.path;
            }
          },
        });
      },
    });
  });
}

// #ifdef MP-WEIXIN
import { onShareAppMessage } from '@dcloudio/uni-app';

onShareAppMessage(async (res: any) => {
  console.log('onShareAppMessage', res);
  const params = `fillReportId=${state.formData.id}&isFromShare=1`;
  let imageUrl = `${Server_Asset_Prefix}img_invite.png`;
  const title: string = state.formData.fillName || '';
  const timestamp = new Date().getTime();
  let fileId = '';
  if (state.shareImageUrl) {
    await new Promise((resolve, reject) => {
      uploadFile(
        {
          path: state.shareImageUrl,
          extname: 'jpg',
        },
        state.shareImageUrl,
        {
          showLoading: true,
          useCompressUrl: false,
          isPublic: true,
          anon: false,
          isThumbnailUrl: false,
          isFollowCloudEdge: false,
          isFormDataReq: false,
        },
      )
        .then(res => {
          fileId = res.fileId;
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  if (fileId) {
    const updateResult = await updateUploadResult(fileId, 1, Date.now().toString() + '.jpg');
    if (updateResult) {
      const fileInfo = await getFileInfo(fileId);
      imageUrl = fileInfo.fullUrl;
    }
  }
  const path = `/app-school-affairs/fill-report/detail/index?${params}&timestamp=${timestamp}`;
  return {
    title,
    path: createSharePath(
      path,
      'zntb,zntbOffice',
      EUserIdentityType.teacher | EUserIdentityType.guardian | EUserIdentityType.student,
    ),
    imageUrl,
  };
});
// #endif

// #ifdef APP-PLUS
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
async function handleShareWX() {
  if (!state.formData || !state.formData.id) {
    return;
  }
  const title = state.formData.fillName;
  const params = `fillReportId=${state.formData.id}&isFromShare=1`;

  // 检查是否安装了微信
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    showInfo('您的手机尚未安装微信');
    return;
  }
  const envTypeMap: Record<string, 0 | 1 | 2> = {
    PROD: 0,
    DEV: 1,
    TEST: 2,
    TEST2: 2,
    TEST3: 2,
    PRE: 0, // 转到正式版
  };
  const envType = envTypeMap[VITE_SERVER_ENV];
  const appid = plus.runtime.appid;
  if (!appid) {
    showInfo('找不到appid');
    return;
  }
  const timestamp = new Date().getTime();
  let shareImageUrl = `${Server_Asset_Prefix}img_invite.png`;
  if (state.shareImageUrl) {
    const currentFilePath = state.shareImageUrl;
    const fileName = currentFilePath.split('/').pop() || '';
    const requestParams: any = {
      locationId: store.userInfo?.locationId,
      fileType: currentFilePath.split('.').pop() || '',
      bucketType: 'public',
    };
    const getUploadUrlData = await getUploadUrl(requestParams);
    const uploadResponse: any = await callBridge({
      service: Service.file,
      action: Action.fileUpload,
      data: {
        uploadUrl: getUploadUrlData.uploadUrl,
        header: getUploadUrlData.header,
        filePath: currentFilePath,
        fileType: getUploadUrlData.fileType,
      },
    });
    if (uploadResponse.status == 1) {
      const updateResult = await updateUploadResult(
        getUploadUrlData.fileId,
        uploadResponse.status,
        fileName,
      );
      if (updateResult) {
        const fileInfo = await getFileInfo(getUploadUrlData.fileId);
        shareImageUrl = fileInfo.fullUrl;
      }
    }
  }
  const opt: UniApp.ShareOptions = {
    provider: 'weixin',
    type: 5,
    title,
    imageUrl: shareImageUrl,
    scene: 'WXSceneSession',
    miniProgram: {
      id: import.meta.env.VITE_WX_ID,
      path: createSharePath(
        `/app-school-affairs/fill-report/detail/index?${params}&timestamp=${timestamp}`,
        'zntb,zntbOffice',
        EUserIdentityType.teacher | EUserIdentityType.guardian | EUserIdentityType.student,
      ),
      type: envType,
      webUrl: import.meta.env.VITE_APP_OFFICIA_URL,
    },
  };
  uni.share(opt);
}
// #endif
</script>

<style lang="scss">
.fill-more-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: -16rpx;

  :deep(.u-dropdown__menu) {
    height: 0rpx !important;
    overflow: hidden !important;
  }
}
</style>

<style lang="scss" scoped>
.fill-content {
  display: flex;
  flex-direction: column;
}
.fill-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 32rpx;
  line-height: 44rpx;
}
.fill-card-content {
  display: flex;
  flex-direction: column;
}
.page-fill-detail {
  flex: 1;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.fill-header {
  background-color: #ffffff;
  box-shadow: 0rpx 12rpx 16rpx 0rpx rgba(0, 0, 0, 0.04);
  .fill-name {
    height: 96rpx;
  }
  .fill-name-default {
    padding: 24rpx;
    font-size: 38rpx;
    color: #000;
    height: 96rpx;
    line-height: 48rpx;
    font-weight: 400;
  }
  .fill-info {
    display: flex;
    min-height: 72rpx;
    align-items: flex-start;
    padding: 0 32rpx 24rpx;
    position: relative;
    .more-icon-wrapper {
      margin-right: 24rpx;
      height: 48rpx;
      width: 48rpx;
    }
    .icon-info {
      height: 48rpx;
      width: 48rpx;
      font-size: 48rpx;
      color: #1296db;
    }
    .fill-base-info {
      flex: 1;
      overflow: hidden;
    }
    .user-name {
      color: rgba(0, 0, 0, 0.88);
      font-size: 34rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx;
      width: 100%;
    }
    .base-info-text {
      color: #999999;
      margin-top: 16rpx;
      display: flex;
      align-items: center;
    }
    .line-progress-wrapper {
      width: 200rpx;
      display: flex;
      align-items: center;
      margin-right: 16rpx;
    }
    .line-progress {
      width: 200rpx;
      display: flex;
      align-items: center;
    }
    .font-size26 {
      font-size: 26rpx;
    }
    .color-gray {
      color: #999;
    }
    .red {
      color: red;
      background-color: #fff;
    }
    .orange {
      color: orange;
      background-color: #fff;
    }
    .grey {
      color: #8c8c8c;
      background-color: #fff;
    }
    .green {
      color: #52c41a;
      background-color: #fff;
    }
    .fill-delay-time {
      margin-left: 32rpx;
      line-height: 48rpx;
    }
    .fill-end {
      width: 160rpx;
      height: 140rpx;
      display: block;
    }
    .fill-submitted {
      width: 160rpx;
      height: 160rpx;
      display: block;
    }
  }
}

.fill-more-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  width: 100%;
  border-top: 1px solid rgb(228, 231, 237);
  .fill-more-container {
    padding: 24rpx 32rpx;
  }
  .fill-more-scroll {
    background-color: #ffffff;
    border-radius: 0 0 16rpx 16rpx;
    line-height: 48rpx;
    font-size: 28rpx;
    max-height: 50vh;
    overflow: hidden;
  }
  .fill-more-bottom {
    flex: 1;
    width: 100%;
    min-height: 45%;
    display: flex;
    justify-content: center;
  }
  .fill-more-close {
    position: relative;
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-top: 48rpx;
    overflow: hidden;
    display: flex;
    background-color: #ffffff;
    align-items: center;
    justify-content: center;
  }
  .more-info-item {
    display: flex;
    align-items: flex-start;
  }
  .more-info-label {
    white-space: nowrap;
    color: $uni-text-color-grey;
    width: 140rpx;
  }
  .more-info-text {
    flex: 1;
    color: $u-main-color;
  }
  .more-info-desc {
    white-space: pre-wrap;
  }
}
.fill-table-wrapper {
  padding: 24rpx 0;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  .fill-table-col-icon {
    width: 40rpx;
    height: 40rpx;
    display: block;
    font-size: 40rpx;
    margin-right: 16rpx;
    color: #707070;
  }
  .fill-table-row {
    display: flex;
    margin: 0 24rpx;
    background-color: #ffffff;
    border-left: 1px solid rgb(228, 231, 237);
    border-right: 1px solid rgb(228, 231, 237);
    border-bottom: 1px solid rgb(228, 231, 237);
  }
  .fill-table-head {
    width: 100%;
    .fill-table-row {
      border-top: 1px solid rgb(228, 231, 237);
      background-color: #f5f6f8;
    }
    .fill-table-cell {
      display: flex;
      align-items: flex-start;
      line-height: 40rpx;
      padding: 32rpx 24rpx;
    }
  }
  .fill-table-scroll-x {
    display: flex;
    flex-direction: column;
    min-width: 100%;
  }
  .fill-table-index-cell {
    width: 110rpx;
    padding: 16rpx 24rpx;
    font-size: 30rpx;
    text-align: center;
  }
  .fill-table-cell {
    min-height: 74rpx;
    width: 400rpx;
    padding: 16rpx 24rpx;
    font-size: 30rpx;
    color: $u-main-color;
    word-break: break-all;
    border-left: 1px solid rgb(228, 231, 237);
    &.only-one-col {
      flex: 1;
    }
  }
  .image-list {
    display: flex;
    flex-wrap: wrap;
  }
  .image-item {
    width: 100rpx;
    height: 100rpx;
    overflow: hidden;
    border-radius: 16rpx;
    position: relative;
    margin-right: 16rpx;
    z-index: 1;
  }
  .image-item:nth-child(n + 4) {
    margin-top: 24rpx;
  }
  .image-item-img {
    width: 100rpx;
    height: 100rpx;
    display: block;
  }
  .fill-table-file {
    color: $ui-color-primary;
  }
  .fill-table-progress {
    position: relative;
  }
  .fill-table-progress-text {
    position: absolute;
    left: 16rpx;
    color: #000000;
  }
}
.fill-add-wrapper {
  overflow: hidden;
  width: 100%;
  flex: 1;
  position: relative;
}
.add-item-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
}
:deep(.u-mode-center-box) {
  background-color: transparent !important;
}
.swiper-item-content {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 24rpx;
  top: 24rpx;
  display: flex;
  overflow: hidden;
}
.swiper-item-card {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  overflow: hidden;
}
.swiper-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.share-canvas-wrapper {
  position: absolute;
  top: -100000rpx;
  // top: 200rpx;
  // background-color: #1296db;
  width: 100%;
  height: 0;
  padding-top: 80%;
  overflow: hidden;
}
#shareCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}
.navbar-share {
  margin-right: 32rpx;
}
.share-title {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 34rpx;
}
.navbar-share-icon {
  height: 48rpx;
  width: 48rpx;
  font-size: 48rpx;
}
.share-list {
  display: flex;
}
.share-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 184rpx;
  padding: 32rpx 16rpx 24rpx;
  background: none;
  border: none;
  &::after {
    content: none;
  }
}
.share-item-icon {
  height: 80rpx;
  width: 80rpx;
  font-size: 64rpx;
  color: #ffffff;
  background-color: #03db6b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}
.share-item-text {
  font-size: 28rpx;
  margin-top: 16rpx;
  height: 32rpx;
  line-height: 32rpx;
  color: #1f1f1f;
}
</style>
