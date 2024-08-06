<template>
  <view class="steps">
    <movable-area class="movableArea">
      <movable-view
        class="movableView"
        :x="x"
        :out-of-bounds="true"
        direction="all"
        :inertia="true"
        :scale="true"
        :animation="false"
      >
        <FlowCard ref="FlowCard" :options="options" @nodeClick="nodeClick" />
        <section class="end-node">流程结束</section>
      </movable-view>
    </movable-area>
  </view>
</template>
<script>
import FlowCard from './FlowCard.vue';

export default {
  name: 'Steps',
  components: {
    FlowCard,
  },
  props: {
    options: {},
    config: {},
  },
  emits: ['nodeClick'],
  data() {
    return {
      x: 30,
    };
  },
  mounted() {
    let movableView = uni.createSelectorQuery().in(this).select('.movableView');
    movableView
      .boundingClientRect(res => {
        const allWith = res.width;
        const winWidth = uni.getSystemInfoSync().windowWidth;
        this.x = -(allWith / 2) + winWidth / 2;
      })
      .exec();
  },
  methods: {
    nodeClick(options) {
      this.$emit('nodeClick', options);
    },
  },
};
</script>
<style scoped lang="scss">
@import './FlowCard.scss';

.steps {
  height: 100%;
}

.movableArea {
  width: 100%;
  height: 100%;
}

.movableView {
  width: unset;
  height: unset;
}

.end-node {
  padding-bottom: 15rpx;
}
</style>
