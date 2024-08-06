<template>
  <mt-page
    title="家长签名"
    :show-top-gap="false"
    :show-notice-bar="false"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon v-if="showHome" name="icon_back_home" :size="48" @click="goBackHome" />
      <c-icon v-else name="icon_arrow_left" :size="48" @click="goBack" />
    </template>
    <view class="page-container">
      <view class="tip-wrap">
        <c-icon
          name="icon_state_info"
          size="40"
          style="display: flex; align-items: start; padding-top: 4rpx; padding-right: 20rpx"
        />
        <view>
          为了确保您的孩子的用药安全，需要您在登记服药委托时，签上您的姓名，以确保是您本人委托。
        </view>
      </view>
      <view class="signature bg-white-light-1 radius-default" :style="{ marginBottom: navHeight }">
        <canvas
          v-show="!showErrorToast"
          class="w100 h100"
          disable-scroll="true"
          :canvas-id="cid"
          @touchstart="touchStart"
          @touchmove="touchMove"
          @touchend="touchEnd"
        ></canvas>
      </view>
      <c-bottom class="footer">
        <view class="btn-wrap">
          <c-button
            width="330rpx"
            type="plain"
            heightSize="height-button-small"
            @click="clearSignature"
          >
            <text class="text-size">重新签名</text>
          </c-button>
          <c-button
            width="330rpx"
            :disabled="submitLoading"
            heightSize="height-button-small"
            @click="saveSignature"
          >
            <text class="text-size">确认并提交</text>
          </c-button>
        </view>
      </c-bottom>
    </view>
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
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  addMedicineRecords,
  updateMedicineRecords,
} from '@/app-preprimary-education/services/feedMedicine';
import { getHomeConf } from '@/app-preprimary-education/utils/env';
import { showSuccess } from '@/app-preprimary-education/utils/tools';
import { uploadFile } from '@/services/upload';
import { delay, showInfo } from '@/utils/tools';
import { computed, defineComponent, getCurrentInstance, nextTick, onMounted, ref } from 'vue';
import usePageEvent from '../../hooks/usePageEvent';
type IPoint = {
  x: number;
  y: number;
};

type ILine = {
  start: IPoint;
  points: IPoint[];
  end?: IPoint;
};
type ICtrl = {
  width: number;
  height: number;
  clear: () => void;
};
/**画布宽高
 * 跟后端约定好的，后端处理缩略图需要根据这个宽高做等比缩放
 */
const canvasWidth = 660;
const canvasHeight = 1100;
export default defineComponent({
  components: { mtPage },
  props: {
    title: { type: String, default: '' },
  },
  onLoad(option: { id: string; from: string }) {
    const { proxy } = getCurrentInstance();
    proxy.PageFrom = option.from || '';
  },
  onShow: function () {
    // 状态栏高度
    this.globalData.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    // #ifdef MP-WEIXIN
    // 获取微信胶囊的位置信息 width,height,top,right,left,bottom
    const custom = wx.getMenuButtonBoundingClientRect();
    // 导航栏高度(标题栏高度) = 胶囊高度 + (顶部距离 - 状态栏高度) * 2
    this.globalData.navigationBarHeight =
      custom.height + (custom.top - this.globalData.statusBarHeight) * 2;
    // 总体高度 = 状态栏高度 + 导航栏高度
    this.globalData.navHeight =
      this.globalData.navigationBarHeight + this.globalData.statusBarHeight;
    // #endif
  },

  emits: [],
  setup() {
    const showHome = ref(false); // navbar显示homeIcon
    const showErrorToast = ref(false);
    const instance = getCurrentInstance() as any;
    const PageFrom = ref<string>();
    const cid = 'cvs';
    const backUrl = ref('');
    const ctrl = ref({} as ICtrl);
    const lines = ref([] as ILine[]);
    const line = ref({} as ILine);
    const tm = ref({} as NodeJS.Timeout | undefined);
    const cxt = ref({} as CanvasContext);
    const submitLoading = ref(false);
    let submitMedicineInfo = { test: 1 } as any;
    const globalData = ref({
      statusBarHeight: 0, // 状态导航栏高度
      navHeight: 0, // 总体高度
      navigationBarHeight: 0, // 导航栏高度(标题栏高度)
    } as any);
    const navHeight = computed(() => {
      return globalData.value.navHeight + 'rpx';
    });
    uni.getStorage({
      key: 'editPageInfo',
      success: function (res) {
        backUrl.value = res.data.pageUrl || '';
        submitMedicineInfo = Object.assign({}, JSON.parse(res.data.pageData));
        submitMedicineInfo.medicationFileList = submitMedicineInfo.medicationFileList.filter(
          (item: any) => item.uploadType !== 2,
        );
      },
    });
    const getPoint = (e: any) => {
      return {
        x: e.changedTouches[0].x.toFixed(1),
        y: e.changedTouches[0].y.toFixed(1),
      };
    };
    const touchStart = (e: any) => {
      let p = getPoint(e);
      line.value = {
        start: p,
        points: [p],
      };
      lines.value.push(line.value);
    };
    const redraw = () => {
      cxt.value.setFillStyle('#fff');
      cxt.value.fillRect(0, 0, canvasWidth, canvasHeight);
      cxt.value.setStrokeStyle('#000');
      cxt.value.setLineWidth(3);
      lines.value.map(l => {
        cxt.value.beginPath();
        if (l.points.length < 2) {
          return;
        }
        cxt.value.moveTo(l.start.x, l.start.y);
        l.points.map(p => {
          cxt.value.lineTo(p.x, p.y);
        });
        cxt.value.stroke();
      });

      cxt.value.draw();
    };
    // 清除
    const clearSignature = () => {
      ctrl.value && ctrl.value.clear();
      submitLoading.value = false;
    };
    const touchMove = (e: any) => {
      let p = getPoint(e);
      line.value.points.push(p);
      if (!tm.value) {
        tm.value = setTimeout(() => {
          redraw();
          tm.value = undefined;
        }, 10);
      }
    };
    const touchEnd = (e: any) => {
      let p = getPoint(e);
      line.value.points.push(p);
      line.value.end = p;
      redraw();
    };
    const handelStateChange = () => {
      showErrorToast.value = false;
      uni.navigateBack({ delta: 1 });
      return;
    };
    // 保存
    const saveSignature = () => {
      if (!lines.value.length) {
        showInfo('请签字后提交');
        return;
      }
      submitLoading.value = true;
      uni.canvasToTempFilePath(
        {
          destHeight: canvasHeight,
          destWidth: canvasWidth,
          canvasId: cid,
          success: resp => {
            uploadFile({ path: resp.tempFilePath }, resp.tempFilePath)
              .then(async response => {
                //验证过了，详情页数据没变，且可以获取到传过去的数据
                try {
                  submitMedicineInfo.medicationFileList.push({
                    fileId: response.fileId,
                    uploadType: 2,
                  });
                  let fn;
                  fn =
                    instance.proxy.PageFrom === 'edit' ? updateMedicineRecords : addMedicineRecords;

                  let res = await fn(submitMedicineInfo);
                  uni.setStorageSync('hasMedicineRecord', true);
                  showSuccess('提交成功');
                  await delay(1000);
                  submitLoading.value = false;
                  uni.removeStorageSync('editPageInfo');
                  if (instance.proxy.PageFrom === 'edit') {
                    uni.navigateBack({ delta: 1 });
                    return;
                  } else {
                    uni.redirectTo({
                      url: `/app-preprimary-education/feed-medicine/guardian/medicine-detail/index?infoId=${res}&from=signture`,
                    });
                  }
                } catch (error) {
                  submitLoading.value = false;
                  console.log('确认提交错误3,代码出错', error);
                  if (error && error.code === 2000401) {
                    instance.proxy.showErrorToast = true;
                    uni.removeStorageSync('editPageInfo');
                  } else {
                    showInfo(error && error.desc);
                  }
                }
              })
              .catch(error => {
                console.log('确认提交的错误1---签名接口错误', error);
                showInfo('确认提交的错误1---签名接口错误', error && error.desc);
                submitLoading.value = false;
              });
          },
          fail: response => {
            console.log('确认提交错误2', response);
            showInfo('确认提交错误2' + response);
            submitLoading.value = false;
          },
        },
        instance,
      );
    };
    const initCtrl = async () => {
      cxt.value = uni.createCanvasContext(cid, instance);
      ctrl.value = {
        width: 0,
        height: 0,
        clear: () => {
          lines.value = [];
          let info = uni
            .createSelectorQuery()
            .in(instance)
            .select('.' + cid);
          info
            .boundingClientRect(data => {
              if (data) {
                cxt.value.clearRect(0, 0, data.width, data.height);
                if (data.width && data.height) {
                  ctrl.value.width = data.width;
                  ctrl.value.height = data.height;
                }
              }
            })
            .exec();
          redraw();
        },
      };
      nextTick(() => {
        ctrl.value.clear();
      });
    };
    onMounted(() => {
      initCtrl();
    });

    return {
      showHome,
      cid,
      touchStart,
      getPoint,
      touchMove,
      tm,
      touchEnd,
      clearSignature,
      saveSignature,
      usePageEvent,
      backUrl,
      showErrorToast,
      handelStateChange,
      submitLoading,
      globalData,
      navHeight,
    };
  },
  methods: {
    goBackHome: function () {
      const homePath = getHomeConf().homeMainPath;
      uni.reLaunch({
        url: homePath,
      });
    },
    goBack: function () {
      if (this.backUrl) {
        let url =
          this.backUrl.indexOf('backfrom') > -1
            ? this.backUrl
            : this.backUrl.indexOf('?') > -1
            ? this.backUrl + '&backfrom=signture'
            : this.backUrl + '?backfrom=signture';
        uni.redirectTo({
          url,
        });
      } else {
        uni.navigateBack();
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.page-container {
  padding: 0 $ui-gap-large;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 320rpx);
}
.signature {
  border: 1px #e5e6ec solid;
  flex: 1;
}
.tip-wrap {
  display: flex;
  padding: $ui-gap-xs $ui-gap-large $ui-gap-xs 0;
  .tip {
    font-size: $ui-font-size-content;
    color: #4e5969;
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
</style>
