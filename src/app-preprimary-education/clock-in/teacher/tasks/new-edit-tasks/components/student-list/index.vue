<template>
  <CustomPage title="选择学生" bg-type="clock-in">
    <view class="contacts-wrapper">
      <indexed-list
        v-if="studentOptions.length"
        :show-select="true"
        :options="studentOptions"
        :value="selectedValue.array"
        :is-edit="isEdit"
        @check="onCheck"
      />

      <c-empty v-else bg-type="fill-light" content="请联系管理员为班级录入学生" />
      <c-bottom class-name="border-unset shadow">
        <view class="flex">
          <c-checkbox class-name="no-shrink" :value="isSelectAllState" @change="selectAllAndCancel">
            <text class="font-title"> 全选 </text>
          </c-checkbox>
          <view class="flex flex-right flex-grow font-title mr-b">
            <text>已选择</text>
            <view class="flex-center icon-44 bg-primary radius-round mlr-xs">
              <text class="color-white lh-0">
                {{ Math.min(selectedValue.array.length, studentResps.length) || '0' }}
              </text>
            </view>
            <text>个学生</text>
          </view>
          <u-button type="primary" width="200rpx" @click="onsubmit">确定</u-button>
        </view>
      </c-bottom>
    </view>
  </CustomPage>
</template>

<script lang="ts">
import { IContactDetail } from '@/app-preprimary-education/components/contactor-items/contactor-items.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import { getclazzFile, IStudentResps } from '@/app-preprimary-education/services/teacher';
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { getPageParams } from '@/utils/tools';
import indexedList from './components/indexed-list/index.vue';

import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import { useStore } from '@/store/old';
import { computed, defineComponent, onBeforeMount, reactive, ref } from 'vue';

interface IStudentOption {
  letter: string;
  data: IContactDetail[];
}
export default defineComponent({
  components: {
    'indexed-list': indexedList,
    CustomPage,
    ImpEmptyData,
  },
  setup() {
    const { state } = useStore();
    const safeAreaBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom ?? 0;
    const selectedValue = reactive({ array: [] });
    const studentOptions = reactive([] as IStudentOption[]);
    const isEdit = ref(false);
    const studentResps = ref([]);

    const isSelectAll = () => {
      return (
        selectedValue.array.length >= studentResps.value.length && selectedValue.array.length !== 0
      );
    };
    const isSelectAllState = computed(() => isSelectAll());

    // 拼接学生列表
    const makeStudentOptions = (studentResps: IStudentResps[]) => {
      const defaultImg = (gender: number) =>
        (gender === 2 && profile_photo_girl) || profile_photo_boy;
      // 1. 生成以首字母为key的对象, 并排序
      const first = studentResps
        .map(s => ({
          firstLetter: (s.firstLetter || '#').substr(0, 1).toUpperCase(),
          data: {
            desc: '学号:' + (s.studentCode || '/'),
            pagePath: `/subPackages/home-school-communication/guardian-student-detail/index?id=${s.id}`,
            phoneContactName: s.parentName,
            url: s.imageUrl || defaultImg(s.gender),
            ...s,
          },
        }))
        ?.sort((left, right) => (left.firstLetter < right.firstLetter ? -1 : 1));

      // 2. 按首字母分类
      const second = {} as { [k: string]: IContactDetail[] };
      first.forEach(t => {
        if (!second[t.firstLetter]) {
          second[t.firstLetter] = [t.data];
        } else {
          second[t.firstLetter].push(t.data);
        }
      });

      // 3. 转为符合组件格式的数据
      const final = Object.entries(second).map(arr => ({
        letter: arr[0],
        data: arr[1],
      }));
      studentOptions.splice(0, studentOptions.length);
      studentOptions.push(...final);
    };

    const fetchClazzFile = async () => {
      const pageParams = getPageParams();
      isEdit.value = JSON.parse(pageParams.isEdit);

      const res = await getclazzFile(pageParams.clazzId ?? '1463394710082613250');

      // 拼接学生列表
      makeStudentOptions(res.studentResps);
      studentResps.value = res.studentResps || [];

      // 过滤已删除学生
      const studentIds = (res.studentResps || []).map(v => v.id);
      selectedValue.array = state.clockIn.selectedClass.studentIds.filter(v =>
        studentIds.includes(v),
      );
    };

    const onCheck = e => {
      if (selectedValue.array.includes(e.id)) {
        return selectedValue.array.splice(selectedValue.array.indexOf(e.id), 1);
      }
      selectedValue.array.push(e.id);
    };

    const selectAllAndCancel = () => {
      if (isEdit.value) return;
      if (!isSelectAllState.value) {
        selectedValue.array = studentResps.value?.map(v => v.id);
        return;
      }
      selectedValue.array = [];
    };

    const onsubmit = () => {
      const studentIds = studentResps.value.map(v => v.id);
      uni.$emit('student-list-submit', {
        clazzId: state.clockIn.selectedClass.clazzId,
        studentIds: selectedValue.array.filter(v => studentIds.includes(v)),
      });
      uni.navigateBack({});
    };

    onBeforeMount(() => {
      fetchClazzFile();
    });

    return {
      studentOptions,
      safeAreaBottom,
      onCheck,
      selectedValue,
      isSelectAllState,
      selectAllAndCancel,
      onsubmit,
      isEdit,
      studentResps,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-wrapper {
  position: relative;
  overflow: auto;
  background-color: $ui-color-fill-default;
}
</style>
