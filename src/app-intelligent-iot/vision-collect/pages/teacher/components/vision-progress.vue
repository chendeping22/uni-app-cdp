<template>
  <view>
    <view class="item-card">
      <view
        class="zy-border-solid-bottom zy-padding-bottom zy-padding-top-xs zy-flex zy-flex-row-between zy-flex-col-center"
      >
        <view>
          {{ title }}
          <view class="font-style">变化值：同上一学年的最新数据相比</view>
        </view>
        <view v-if="arrowRightShow" class="zy-flex zy-flex-col-center" @click="toDetail">
          <text class="text-color4">明细</text>
          <zy-icons type="arrow_right" :size="48" color="#86909C" />
        </view>
      </view>
      <view class="">
        <view class="progress-item">
          <view class="zy-flex zy-flex-row-between zy-flex-col-center padding-bottom">
            <view class="zy-margin-bottom-xs"> 正常率 </view>
            <view class="zy-flex">
              <view>
                <view v-if="progressData.normalRate != null">
                  {{ Number((progressData.normalRate * 100).toFixed(2)) }}%
                </view>
                <view v-else> / </view>
              </view>

              <view class="padding-style"> | </view>
              <view>
                <view v-if="progressData.normalChangeRate != null">
                  {{ Number((Math.abs(progressData.normalChangeRate) * 100).toFixed(2)) }}%
                  <image
                    class="svg-style"
                    :src="
                      progressData.normalChangeRate > 0
                        ? srcUp
                        : progressData.normalChangeRate < 0
                        ? srcDown
                        : ''
                    "
                  />
                </view>
                <view v-else> / </view>
              </view>
            </view>
          </view>

          <view class="zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="progress-bg progress-green">
              <progress
                :percent="Number((progressData.normalRate * 100).toFixed(2))"
                stroke-width="10"
                backgroundColor="#F8F8FA"
              ></progress>
            </view>
          </view>
        </view>
        <view class="progress-item">
          <view class="zy-flex zy-flex-row-between zy-flex-col-center padding-bottom">
            <view class="zy-margin-bottom-xs"> 近视率 </view>
            <view class="zy-flex">
              <view>
                <view v-if="progressData.myopiaRate != null">
                  {{ Number((progressData.myopiaRate * 100).toFixed(2)) }}%
                </view>
                <view v-else> / </view>
              </view>

              <view class="padding-style"> | </view>

              <view>
                <view v-if="progressData.myopiaChangeRate != null">
                  {{ Number((Math.abs(progressData.myopiaChangeRate) * 100).toFixed(2)) }}%
                  <image
                    class="svg-style"
                    :src="
                      progressData.myopiaChangeRate > 0
                        ? srcUp
                        : progressData.myopiaChangeRate < 0
                        ? srcDown
                        : ''
                    "
                  />
                </view>
                <view v-else> / </view>
              </view>
            </view>
          </view>
          <view class="zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="progress-bg progress-orange">
              <progress
                :percent="Number((progressData.myopiaRate * 100).toFixed(2))"
                stroke-width="10"
                backgroundColor="#F8F8FA"
              ></progress>
            </view>
          </view>
        </view>
        <view class="progress-item">
          <view class="zy-flex zy-flex-row-between zy-flex-col-center padding-bottom">
            <view class="zy-margin-bottom-xs"> 视力不良率 </view>
            <view class="zy-flex">
              <view>
                <view v-if="progressData.badRate != null">
                  {{ Number((progressData.badRate * 100).toFixed(2)) }}%
                </view>
                <view v-else> / </view>
              </view>

              <view class="padding-style"> | </view>

              <view>
                <view v-if="progressData.badChangeRate != null">
                  {{ Number((Math.abs(progressData.badChangeRate) * 100).toFixed(2)) }}%
                  <image
                    class="svg-style"
                    :src="
                      progressData.badChangeRate > 0
                        ? srcUp
                        : progressData.badChangeRate < 0
                        ? srcDown
                        : ''
                    "
                  />
                </view>
                <view v-else> / </view>
              </view>
            </view>
          </view>
          <view class="zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="progress-bg progress-red">
              <progress
                :percent="Number((progressData.badRate * 100).toFixed(2))"
                stroke-width="10"
                backgroundColor="#F8F8FA"
              ></progress>
            </view>
          </view>
        </view>
        <view class="progress-item">
          <view class="zy-flex zy-flex-row-between zy-flex-col-center padding-bottom">
            <view class="zy-margin-bottom-xs"> 屈光不正率 </view>
            <view class="zy-flex">
              <view>
                <view v-if="progressData.ametropiaRate != null">
                  {{ Number((progressData.ametropiaRate * 100).toFixed(2)) }}%
                </view>
                <view v-else> / </view>
              </view>

              <view class="padding-style"> | </view>
              <view>
                <view v-if="progressData.ametropiaChangeRate != null">
                  {{ Number((Math.abs(progressData.ametropiaChangeRate) * 100).toFixed(2)) }}%
                  <image
                    class="svg-style"
                    :src="
                      progressData.ametropiaChangeRate > 0
                        ? srcUp
                        : progressData.ametropiaChangeRate < 0
                        ? srcDown
                        : ''
                    "
                  />
                </view>
                <view v-else> / </view>
              </view>
            </view>
          </view>
          <view class="zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="progress-bg progress-blue">
              <progress
                :percent="Number((progressData.ametropiaRate * 100).toFixed(2))"
                stroke-width="10"
                backgroundColor="#F8F8FA"
              ></progress>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import srcDown from '../../../assets/image/data_down.svg';
import srcUp from '../../../assets/image/data_up.svg';
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  arrowRightShow: {
    type: Boolean,
    default: false,
  },
  progressData: {
    type: Object,
    default: () => {},
  },
});
const emits = defineEmits(['toDetail']);
const toDetail = () => {
  emits('toDetail');
};
</script>

<style lang="scss">
.progress-item {
  font-size: $zy-font-size28;
  margin: 20rpx 0;
}

.progress-bg {
  width: 100%;
  background: $zy-bg-color;
  border-radius: 4rpx;
  padding: 10rpx;
}

.padding-style {
  padding: 0 10rpx;
}

.padding-bottom {
  padding-bottom: 10rpx;
}

.svg-style {
  width: 24rpx;
  height: 24rpx;
}

.font-style {
  color: #86909c;
  font-size: 28rpx;
}
</style>
