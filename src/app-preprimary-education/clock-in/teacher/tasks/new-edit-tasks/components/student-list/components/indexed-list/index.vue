<template>
  <view id="list" ref="list" class="imp-indexed-list">
    <scroll-view :scroll-into-view="scrollViewId" class="imp-indexed-list__scroll" scroll-y>
      <view
        v-for="(list, idx) in lists"
        :id="'imp-indexed-list-' + idx"
        :key="'imp-indexed-list-' + idx"
      >
        <student-items
          :item="list"
          :loaded="loaded"
          :idx="idx"
          :show-select="showSelect"
          :value="value"
          :is-edit="isEdit"
          @item-check="onItemCheck"
        ></student-items>
      </view>
      <view class="blank-item" :style="{ height: blankItemHeight }"> </view>
    </scroll-view>
    <view class="imp-indexed-list__menu">
      <view
        v-for="(list, key) in lists"
        :key="key"
        class="imp-indexed-list__menu-item"
        :class="touchmoveIndex == key ? 'imp-indexed-list__menu--active' : ''"
        @touchstart.stop.prevent="handleClickIndex(key)"
      >
        <text
          class="imp-indexed-list__menu-text"
          :class="touchmoveIndex == key ? 'imp-indexed-list__menu-text--active' : ''"
        >
          {{ list.key }}
        </text>
      </view>
    </view>
  </view>
</template>
<script>
import studentItems from '../student-items/index.vue';

export default {
  name: 'UniIndexedList',
  components: {
    'student-items': studentItems,
  },
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['click', 'check'],
  data() {
    return {
      lists: [],
      winHeight: 0,
      itemHeight: 0,
      winOffsetY: 0,
      touchmoveIndex: -1,
      scrollViewId: '',
      touchmovable: true,
      loaded: false,
      blankItemHeight: `calc(96rpx + 32rpx + ${
        uni.getSystemInfoSync().safeAreaInsets?.bottom ?? 0
      })`,
    };
  },
  watch: {
    options: {
      handler: function () {
        this.setList();
      },
      deep: true,
    },
  },
  mounted() {
    setTimeout(() => {
      this.setList();
    }, 50);
    setTimeout(() => {
      this.loaded = true;
    }, 300);
  },
  methods: {
    setList() {
      this.lists = [];
      this.options.forEach((value, index) => {
        if (value.data.length === 0) {
          return;
        }
        let indexBefore = index;
        let items = value.data.map(item => {
          let obj = {};
          obj['key'] = value.letter;
          obj['info'] = item;
          obj['itemIndex'] = index;
          index++;
          obj.checked = item.checked ? item.checked : false;
          return obj;
        });
        this.lists.push({
          title: value.letter,
          key: value.letter,
          items: items,
          itemIndex: indexBefore,
        });
      });
      uni
        .createSelectorQuery()
        .in(this)
        .select('#list')
        .boundingClientRect()
        .exec(ret => {
          this.winOffsetY = ret[0].top;
          this.winHeight = ret[0].height;
          this.itemHeight = this.winHeight / this.lists.length;
        });
    },

    handleClickIndex(index) {
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = 'imp-indexed-list-' + index;
        this.touchmoveIndex = index;
      }
    },

    onClick(e) {
      let { idx, index } = e;
      let obj = {};
      for (let key in this.lists[idx].items[index]) {
        obj[key] = this.lists[idx].items[index][key];
      }
      let select = [];
      if (this.showSelect) {
        this.lists[idx].items[index].checked = !this.lists[idx].items[index].checked;
        this.lists.forEach((value, idx) => {
          value.items.forEach((item, index) => {
            if (item.checked) {
              let obj = {};
              for (let key in this.lists[idx].items[index]) {
                obj[key] = this.lists[idx].items[index][key];
              }
              select.push(obj);
            }
          });
        });
      }
      this.$emit('click', {
        item: obj,
        select: select,
      });
    },
    onItemCheck(info) {
      this.$emit('check', info);
    },
  },
};
</script>
<style lang="scss" scoped>
.imp-indexed-list {
  height: 100%;
  width: 100%;
  overflow: auto;
  position: relative;
}

.imp-indexed-list__scroll {
  height: calc(100vh - 140rpx);
}

.imp-indexed-list__menu {
  position: absolute;
  right: 0;
  top: 100rpx;
  width: 50rpx;
  display: flex;
  flex-direction: column;

  &-item {
    height: 20rpx;
    line-height: 20rpx;
    margin-bottom: $ui-gap-xs;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
  &-text {
    font-size: $ui-font-size-secondary;
    text-align: center;
    color: $ui-color-primary;
    font-size: $ui-font-size-secondary;
    font-weight: $ui-font-weight-bold;

    &--active {
      border-radius: 16px;
      width: 16px;
      height: 16px;
      line-height: 16px;
      background-color: $ui-color-primary;
      color: $ui-color-white;
    }
  }
}
.blank-item {
  background: transparent;
}
</style>
