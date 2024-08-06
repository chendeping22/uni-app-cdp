<template>
  <view>
    <picker-view
      v-if="visible"
      :indicator-style="indicatorStyle"
      :mask-style="maskStyle"
      :value="[value]"
      @change="bindChange"
    >
      <picker-view-column>
        <view v-for="(item, index) in days" :key="index" class="item"
          >{{ index + 1 }}天(至{{ dayjs(item).format('YYYY') }}年{{ dayjs(item).format('MM') }}月{{
            dayjs(item).format('DD')
          }}日)</view
        >
      </picker-view-column>
    </picker-view>
  </view>
</template>

<script>
import dayjs from 'dayjs';
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Number,
      default: +new Date(),
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  emits: ['onChange'],
  data(props) {
    const days = [];
    let timeTamp = props.startTime;
    for (let i = 1; i <= 180; i++) {
      if (i === 1) {
        days.push(timeTamp);
      } else {
        timeTamp += 1000 * 60 * 60 * 24;
        days.push(timeTamp);
      }
    }
    return {
      days,
      /**
       * 解决动态设置indicator-style不生效的问题
       */
      //   visible: false,
      // indicatorStyle: `height: ${Math.round(uni.getSystemInfoSync().screenWidth/(750/100))}px;`
      indicatorStyle: `height: 50px;`,
      // #ifdef MP-KUAISHOU
      maskStyle: 'padding:10px 0',
      // #endif
      // #ifndef MP-KUAISHOU
      maskStyle: '',
      // #endif
      dayjs,
    };
  },
  methods: {
    bindChange(e) {
      const val = e.detail.value;
      this.$emit('onChange', {
        key: val[0],
        value: this.days[val[0]],
      });
      //   this.value = val[0];
    },
  },
};
</script>

<style lang="scss">
picker-view {
  width: 100%;
  height: 600rpx;
  margin-top: $ui-gap-small;
}

.item {
  line-height: 100rpx;
  text-align: center;
}
</style>
