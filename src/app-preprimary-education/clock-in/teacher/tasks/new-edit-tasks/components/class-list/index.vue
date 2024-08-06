<template>
  <CustomPage class="class-list" title="发布对象" bg-type="clock-in">
    <uni-list
      v-if="classList.array.length"
      class="list-content class-list-content mlr-b"
      :style="{ height: bodyHeight, 'min-height': bodyHeight }"
    >
      <uni-list-item
        v-for="item in classList.array"
        :key="item.clazzId"
        :title="item.clazzName"
        :border="false"
      >
        <template #header>
          <view
            class="view-header"
            hover-class="none"
            hover-stop-propagation="false"
            @click="selectAllStudentAndCancel(item.clazzId)"
          >
            <imp-checkbox class="class-check" :value="isSelectClass(item.clazzId)" />
          </view>
        </template>
        <template #footer>
          <view
            class="expend"
            hover-class="none"
            hover-stop-propagation="false"
            @click="link(item.clazzId)"
          >
            <text class="min-width gray-text" selectable="false" space="false" decode="false">
              {{
                `${
                  computeStudentNum(item.clazzId) > item.allStudentNum
                    ? item.allStudentNum
                    : computeStudentNum(item.clazzId)
                }/${item.allStudentNum}`
              }}
            </text>
            <text class="arrow-right" />
          </view>
        </template>
      </uni-list-item>
    </uni-list>
    <c-empty v-else bg-type="fill-light" content="暂无数据" />
    <view class="submit-content select-content">
      <view class="item" style="width: 25%" hover-class="none" hover-stop-propagation="false">
        <imp-checkbox :value="isAllSelectState" @click="selectAllCancelSelectAll"
          >全选</imp-checkbox
        >
      </view>
      <view class="item" style="width: 41%" hover-class="none" hover-stop-propagation="false">
        已选择
        <view class="flex-center icon-44 bg-primary radius-round mlr-xs">
          <text class="color-white lh-0"> {{ isAllSelectClassNum || '0' }} </text>
        </view>
        个班级
      </view>
      <view class="item" hover-class="none" hover-stop-propagation="false">
        <u-button type="primary" class="btn" @click="onSubmit">确定</u-button>
      </view>
    </view>
  </CustomPage>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpCheckbox from '@/app-preprimary-education/components/imp-checkbox/imp-checkbox.vue';
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import { getClazzes, getSchoolClazzes } from '@/app-preprimary-education/services/clock-in';
import { CLOCK_IN_COMMITS, useStore } from '@/store/old';
import { cloneDeep } from '@/utils/lodash-es';
import { getPageParams } from '@/utils/tools';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';

export default defineComponent({
  components: { CustomPage, ImpEmptyData, ImpButton, uniListItem, uniList, ImpCheckbox },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  onShow() {
    uni.$emit('clock-in-class-list-show');
  },
  setup() {
    const { state, commit } = useStore();
    const marginTop = uni.getSystemInfoSync().statusBarHeight || 0;
    const bodyHeight = `calc(100vh - ${marginTop}px  - 88rpx - 73px)`;
    const classList = reactive<{
      array: {
        studentVos: any[];
        clazzId: string;
        allStudentNum: string | number;
        clazzName: string;
      }[];
    }>({ array: [] });
    const clazzs = reactive<{ array: { studentIds: any[]; clazzId: string }[] }>({ array: [] });
    const isEdit = ref(false);

    const isAllSelect = () => {
      if (!clazzs.array?.length) return false;
      const studentNum = classList.array
        .map(v => v.studentVos?.length)
        ?.reduce((pre = 0, current) => pre + current, 0);
      const selectedNum =
        clazzs.array
          .map(v => v.studentIds?.length)
          .reduce((pre = 0, current) => pre + current, 0) || 0;
      return studentNum <= selectedNum;
    };
    const isAllSelectClass = () => {
      return clazzs.array?.filter(v => v.studentIds.length > 0).length || 0;
    };
    const isAllSelectState = computed(() => isAllSelect());
    const isAllSelectClassNum = computed(() => isAllSelectClass());
    const link = (id: any) => {
      commit(
        CLOCK_IN_COMMITS.setSelectedClass,
        clazzs.array?.find(v => v.clazzId === id) || {
          clazzId: id,
          studentIds: [],
        },
      );
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/components/student-list/index?clazzId=${id}&isEdit=${isEdit.value}`,
      });
    };
    const fetchClazzes = async () => {
      const params = getPageParams();
      const methods = params?.locationId ? getSchoolClazzes : getClazzes;
      const res = await methods();
      classList.array = res;
    };

    const isSelectClass = (clazzId: string) => {
      return clazzs.array?.find(v => v.clazzId === clazzId)?.studentIds.length >= 1;
    };

    const computeStudentNum = (clazzId: string) => {
      return clazzs.array?.find(v => clazzId === v.clazzId)?.studentIds?.length || 0;
    };

    const selectAllStudentAndCancel = (clazzId: string) => {
      if (isEdit.value) return;
      const selectingStudent = classList.array.find(v => v.clazzId === clazzId)?.studentVos;
      const selectedStudent = clazzs.array.find(v => v.clazzId === clazzId)?.studentIds;
      if (selectingStudent?.length === selectedStudent?.length && selectedStudent?.length !== 0) {
        clazzs.array.splice(
          clazzs.array.findIndex(v => v.clazzId === clazzId),
          1,
        );
        return;
      }
      if (selectedStudent) {
        clazzs.array[clazzs.array.findIndex(v => v.clazzId === clazzId)].studentIds =
          selectingStudent.map(v => v.studentId);
        return;
      }
      clazzs.array.push({
        clazzId,
        studentIds: selectingStudent.map(v => v.studentId),
      });
    };

    const selectAllCancelSelectAll = () => {
      if (isEdit.value) return;
      if (isAllSelectState.value) {
        clazzs.array = [];
      } else {
        clazzs.array = classList.array.map(v => ({
          clazzId: v.clazzId,
          studentIds: v.studentVos.map(v => v.studentId),
        }));
      }
    };

    const onSubmit = () => {
      uni.$emit('class-list-submit', clazzs.array);
      uni.navigateBack({});
    };

    onBeforeMount(() => {
      const params = getPageParams();
      isEdit.value = !!params.id;
      clazzs.array = cloneDeep(state.clockIn.formData.clazzs) || [];
      uni.$on('student-list-submit', selectedClassData => {
        const selectedClass = clazzs.array.find(v => v.clazzId === selectedClassData.clazzId);
        if (!selectedClass) return clazzs.array.push(selectedClassData);
        clazzs.array[clazzs.array.findIndex(v => v.clazzId === selectedClassData.clazzId)] =
          selectedClassData;
      });
      uni.$on('clock-in-class-list-show', fetchClazzes);
      fetchClazzes();
    });

    onBeforeUnmount(() => {
      uni.$off('student-list-submit');
      uni.$off('clock-in-class-list-show');
    });

    return {
      link,
      classList,
      clazzs,
      isSelectClass,
      computeStudentNum,
      isAllSelectState,
      isAllSelectClassNum,
      selectAllCancelSelectAll,
      selectAllStudentAndCancel,
      onSubmit,
      bodyHeight,
    };
  },
});
</script>
<style scoped lang="scss">
@import '../../index.scss';
.class-list {
  .view-header {
    padding: $ui-gap-xs $ui-gap-default $ui-gap-xs 0;
    .class-check {
      ::v-deep {
        .checkmarkempty::after {
          display: none;
        }
        .uni-icons {
          display: block;
        }
      }
    }
  }
  .min-width {
    min-width: 50rpx;
  }
  .expend {
    display: flex;
    .arrow-right::after {
      width: 40rpx;
      height: 40rpx;
      content: ' ';
      display: block;
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACPTkDJAAACCElEQVRYCWNgGAVDLQQ8vIOy3L0DW6nlbkZiDQoNDWX++PX3JIb/DFkgPYwMjPE7t69fRKx+XOqYcEmgi2tra/9n/M8ogxD/P8vNO8QKwSePRXQIgIwHhgLPpy9/jv5n+K8HsY7xFQsjo9m2besekmc9AwPRIQCyYPXq1V+YGRn9gBHwCmLhf7G///9vAjmMLg4AWQL2LRNzIDDofoL4oNAAhsrShoYGkjwD0gsCzBCKNPLu7WuPVVQ1HwF1BUJ1qj959oLz7u0be0gziUwHgCy5e+fGRRU1DS4g0xpqqTXQUfdB4lA+URRZwQYz2dLMoBKYHTfB+MAIITlnkJQLEBYhWJTmDIpCAOQMSnMGxQ4AOYKSnEFWLgBZig6w5YynL15dvHPr+g10tch8qoQAsoGksqnmAEi98H8WzAGg3GFhorcRxsdFU5wLQAZ7eQXJ//n//xQwG4qB+EDLL/HxsFiDEiiIjw9QnAZA2fDHr3/AEvC/EsQicAXltHHj2tf4LIbJURQFoPIfVA/Aakdw/QCsJ0ipHSkKAXYugY7/DAxJMN8Agz5517Z1W2B8YmiyQ8DdMzDu/3+GMpgljIwMXeS0kMhyALYUD6oXYI4hhSY5F1CS4rE5jKQ0QGmKx+YAoqOAGimeIgdcvXoV2Cj+/wRhCGParq1rjiH4dGJRu2NCJ2ePWoM7BACEE9cfww+sjQAAAABJRU5ErkJggg==');
      background-size: 100% 100%;
    }
  }
  .select-content {
    display: flex;
    padding: $ui-gap-default $ui-gap-large;
    box-sizing: border-box;
    .item {
      display: flex;
      align-items: center;
      width: 33%;
      .badge {
        margin: 0 $ui-gap-xxs;
      }
      .btn {
        display: block;
        width: 100%;
        ::v-deep {
          .button-large {
            margin: 0;
            min-width: 100%;
          }
        }
      }
    }
  }
  ::v-deep {
    .page-body {
      padding-top: $ui-gap-default;
    }
  }
}
.class-list-content {
  overflow: auto;
}
</style>
