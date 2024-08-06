<template>
  <view class="steps">
    <view>
      <view
        v-if="!options?.isBranchFlow && !options?.isInterflow && options?.type != 'condition'"
        class="node-wrap"
      >
        <view v-if="options?.type" class="node-wrap-box" :class="options.type">
          <!-- 注意：点击事件逻辑与源代码不一致，目前只兼容了我的发文流程点击事件 -->
          <view
            class="flow-path-card"
            :class="[options.state, options.type, options.type ? 'start-node' : '']"
            @click.stop="clickFlowCard(options)"
          >
            <view class="header">
              <view
                v-if="options.type != 'subFlow' || !options.state"
                class="title-box"
                style="height: 100%; width: 190px"
              >
                <span class="title-text">{{ options.properties.title }}</span>
              </view>
              <view v-else class="title-box" style="height: 100%; width: 190px">
                <span class="title-text">{{ options.properties.title }}</span>
              </view>
              <u-tag
                v-if="options?.type == 'subFlow'"
                class="async-state"
                size="mini"
                :text="options.properties.isAsync ? '异步' : '同步'"
                plain
                style="right: 10px"
              ></u-tag>
            </view>
            <view class="body"
              ><span class="text">{{ options.content }}</span></view
            >
          </view>
          <div class="add-node-btn-box flex justify-center"></div>
        </view>
      </view>
      <div v-if="options?.conditionNodes?.length" class="branch-wrap">
        <div class="branch-box-wrap">
          <div class="branch-box flex justify-center relative">
            <span class="line"></span>
            <div v-for="(item, index) in options.conditionNodes" :key="index" class="col-box">
              <div class="center-line"></div>
              <div class="top-cover-line"></div>
              <div class="bottom-cover-line"></div>
              <view class="node-wrap">
                <view v-if="item?.type" class="node-wrap-box branchFlow">
                  <view class="flow-path-card" :class="[item.state, item.type]">
                    <view class="header">
                      <view class="title-box" style="height: 100%; width: 190px">
                        <span class="title-text">{{ item.properties.title }}</span>
                      </view>
                      <u-tag
                        v-if="item?.type == 'subFlow'"
                        class="async-state"
                        size="mini"
                        :text="item.properties.isAsync ? '异步' : '同步'"
                        plain
                        style="right: 10px"
                      >
                      </u-tag>
                    </view>
                    <view class="body"
                      ><span class="text">{{ item.content }}</span></view
                    >
                  </view>
                  <div class="add-node-btn-box flex justify-center"></div>
                </view>
              </view>
              <FlowCard v-if="item.conditionNodes" ref="FlowCard" :options="item"></FlowCard>
              <FlowCard
                v-if="options.childNode && item.type == 'condition'"
                ref="FlowCard"
                :options="item.childNode"
              ></FlowCard>
            </div>
          </div>
          <div class="add-node-btn-box flex justify-center"></div>
        </div>
      </div>
      <FlowCard
        v-if="options?.childNode"
        ref="FlowCard"
        :options="options.childNode"
        @nodeClick="clickFlowCard"
      />
    </view>
  </view>
</template>

<script>
// #ifdef MP
import FlowCard from './FlowCard.vue';
// #endif
export default {
  name: 'FlowCard',
  // #ifdef MP
  components: {
    FlowCard,
  },
  // #endif
  props: {
    options: {},
  },
  methods: {
    clickFlowCard(options) {
      this.$emit('nodeClick', options);
    },
  },
};
</script>
<style scoped lang="scss">
@import './FlowCard.scss';
$bg-color: #fff;

.branch-wrap {
  display: flex;
  justify-content: center;

  .branch-box {
    background: $bg-color;

    > .col-box {
      &:first-of-type {
        &::before,
        &::after {
          background: $bg-color !important;
        }
      }

      &:last-of-type {
        &::before,
        &::after {
          background: $bg-color;
        }
      }
    }
  }
}

.node-wrap-box.approver::before {
  background: #fff;
}

.flow-path-card {
  &.start-node,
  &.approver,
  &.subFlow {
    .header {
      background-color: #b6b6b6;
    }
  }

  &.state-past {
    .header {
      background-color: #67c23a;
    }
  }

  &.state-curr {
    .header {
      background-color: #1890ff;
    }
  }
}

.node-wrap-box .start {
  margin-top: 15rpx;
}
</style>
