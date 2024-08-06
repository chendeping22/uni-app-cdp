<template>
  <view>
    <u-card title="选择离职人员" @click="handleSelectSeparatedPerson">
      <template #body>
        <view> value: {{ selectedData.separatedPerson.value }} </view>
        <view> names: {{ selectedData.separatedPerson.data }} </view>
      </template>
    </u-card>
    <u-card title="选择空间" @click="handleSelectSpaces">
      <template #body>
        <view> value: {{ selectedData.spaces.value }} </view>
        <view> names: {{ selectedData.spaces.data }} </view>
      </template>
    </u-card>
    <u-card title="单选选择空间" @click="handleSelectSpace">
      <template #body>
        <view> value: {{ selectedData.space.value }} </view>
        <view> names: {{ selectedData.space.data }} </view>
      </template>
    </u-card>
    <u-card title="选择角色" @click="handleSelectPersonRole">
      <template #body>
        <view> value: {{ selectedData.personRole.value }} </view>
        <view> names: {{ selectedData.personRole.data }} </view>
      </template>
    </u-card>
    <u-card title="跨组织选择部门人员" @click="handleSelectAcrossLocationPersonScope">
      <template #body>
        <view> value: {{ selectedData.acrossLocationPersonScope.value }} </view>
        <view> names: {{ selectedData.acrossLocationPersonScope.data }} </view>
      </template>
    </u-card>
    <u-card title="跨组织选择人员" @click="handleSelectAcrossLocationPerson">
      <template #body>
        <view> value: {{ selectedData.acrossLocationPerson.value }} </view>
        <view> names: {{ selectedData.acrossLocationPerson.data }} </view>
      </template>
    </u-card>
    <u-card title="选择组织" @click="handleSelectLocations">
      <template #body>
        <view> value: {{ selectedData.locations.value }} </view>
        <view> names: {{ selectedData.locations.data }} </view>
      </template>
    </u-card>
    <u-card title="选择学生" @click="handleSelectStudents">
      <template #body>
        <view> value: {{ selectedData.students.value }} </view>
        <view> names: {{ selectedData.students.data }} </view>
      </template>
    </u-card>
    <u-card title="选择学生范围" @click="handleSelectStudentScope">
      <template #body>
        <view> value: {{ selectedData.studentScope.value }} </view>
        <view> names: {{ selectedData.studentScope.data }} </view>
      </template>
    </u-card>
    <u-card title="选择人员" @click="handleSelectPersons">
      <template #body>
        <view> value: {{ selectedData.persons.value }} </view>
        <view> names: {{ selectedData.persons.data }} </view>
      </template>
    </u-card>
    <u-card title="单选选择人员" @click="handleSelectPerson">
      <template #body>
        <view> value: {{ selectedData.person.value }} </view>
        <view> names: {{ selectedData.person.data }} </view>
      </template>
    </u-card>
    <u-card title="选择设备" @click="handleSelectDevice">
      <template #body>
        <view> value: {{ selectedData.device.value }} </view>
        <view> names: {{ selectedData.device.data }} </view>
      </template>
    </u-card>
    <u-card title="选择设备范围" @click="handleSelectDeviceScope">
      <template #body>
        <view> value: {{ selectedData.deviceScope.value }} </view>
        <view> names: {{ selectedData.deviceScope.data }} </view>
      </template>
    </u-card>
    <u-card title="选择年级/班级" @click="handleSelectGradeClass">
      <template #body>
        <view> value: {{ selectedData.gradeClass.value }} </view>
        <view> names: {{ selectedData.gradeClass.data }} </view>
      </template>
    </u-card>
    <u-card title="跨组织选择学生范围" @click="handleSelectAcrossLocationStudentScope">
      <template #body>
        <view> value: {{ selectedData.acrossLocationStudentScope.value }} </view>
        <view> names: {{ selectedData.acrossLocationStudentScope.data }} </view>
      </template>
    </u-card>
    <u-card title="跨组织选择学生" @click="handleSelectAcrossLocationStudent">
      <template #body>
        <view> value: {{ selectedData.acrossLocationStudent.value }} </view>
        <view> names: {{ selectedData.acrossLocationStudent.data }} </view>
      </template>
    </u-card>
    <u-card title="选择职位" @click="handleSelectPosition">
      <template #body>
        <view> value: {{ selectedData.position.value }} </view>
        <view> names: {{ selectedData.position.data }} </view>
      </template>
    </u-card>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import showSelector from './show-selector';
import { LocationScopeEnum, SelectorTypeEnum, SelectorValue } from './types';

const selectedData = reactive<any>({
  separatedPerson: {
    value: '',
    data: {},
  },
  position: {
    value: '',
    data: {},
  },
  space: {
    value: '',
    data: {},
  },
  spaces: {
    value: [],
    data: [],
  },
  personRole: {
    value: [],
    data: [],
  },
  device: {
    value: [],
    data: [],
  },
  deviceScope: {
    value: [],
    data: [],
  },
  gradeClass: {
    value: [],
    data: [],
  },
  acrossLocationPersonScope: {
    value: [
      {
        id: '-104',
        name: 'devcloud',
        locationName: null,
        level: 0,
        parentId: '',
      },
    ],
    data: [],
  },
  acrossLocationPerson: {
    value: [],
    data: [],
  },
  locations: {
    value: [],
    data: [],
  },
  students: {
    value: [],
    data: [],
  },
  studentScope: {
    value: [],
    data: [],
  },
  acrossLocationStudent: {
    value: [],
    data: [],
  },
  acrossLocationStudentScope: {
    value: [],
    data: [],
  },
  persons: {
    value: [],
    data: [],
  },
  person: {
    value: '',
    data: {},
  },
});

const handleSelectSpace = () => {
  showSelector({
    type: SelectorTypeEnum.space,
    multiple: false,
    value: selectedData.space.value,
    callback: (value, data) => {
      console.log('file: select-demo.vue:178 ~ handleSelectSpace ~ value, data:', value, data);
      selectedData.space = {
        value,
        data,
      };
    },
  });
};

const handleSelectSpaces = () => {
  showSelector({
    type: SelectorTypeEnum.space,
    multiple: true,
    value: selectedData.spaces.value,
    callback: (value, data) => {
      selectedData.spaces = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectPersonRole = () => {
  showSelector({
    type: SelectorTypeEnum.personRole,
    multiple: true,
    value: selectedData.personRole.value,
    callback: (value, data) => {
      selectedData.personRole = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectDevice = () => {
  showSelector({
    type: SelectorTypeEnum.device,
    multiple: true,
    value: selectedData.device.value,
    callback: (value, data) => {
      selectedData.device = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectDeviceScope = () => {
  showSelector({
    type: SelectorTypeEnum.deviceScope,
    multiple: true,
    value: selectedData.deviceScope.value,
    callback: (_, data) => {
      selectedData.deviceScope = {
        value: data,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectGradeClass = () => {
  showSelector({
    type: SelectorTypeEnum.gradeClass,
    multiple: true,
    value: selectedData.gradeClass.value,
    callback: (value, data) => {
      selectedData.gradeClass = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectAcrossLocationStudentScope = () => {
  showSelector({
    type: SelectorTypeEnum.acrossLocationStudentScope,
    multiple: true,
    value: selectedData.acrossLocationStudentScope.value,
    callback: (_, data) => {
      selectedData.acrossLocationStudentScope = {
        value: data,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectAcrossLocationStudent = () => {
  showSelector({
    type: SelectorTypeEnum.acrossLocationStudent,
    multiple: true,
    value: selectedData.acrossLocationStudent.value,
    callback: (value, data) => {
      selectedData.acrossLocationStudent = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectAcrossLocationPersonScope = () => {
  showSelector({
    type: SelectorTypeEnum.acrossLocationPersonScope,
    multiple: true,
    value: selectedData.acrossLocationPersonScope.value,
    /** 禁用的选项 id */
    disabledItemIds: ['-104', '1380350166118696190'],
    /** 当前组织及下级组织 */
    scope: LocationScopeEnum.ancestor,
    callback: (_, data) => {
      selectedData.acrossLocationPersonScope = {
        value: data,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectAcrossLocationPerson = () => {
  showSelector({
    type: SelectorTypeEnum.acrossLocationPerson,
    multiple: true,
    value: selectedData.acrossLocationPerson.value,
    callback: (value, data) => {
      selectedData.acrossLocationPerson = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectLocations = () => {
  showSelector({
    type: SelectorTypeEnum.location,
    multiple: true,
    value: selectedData.locations.value,
    scope: LocationScopeEnum.ancestor,
    callback: (value, data) => {
      selectedData.locations = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectStudentScope = () => {
  showSelector({
    type: SelectorTypeEnum.studentScope,
    multiple: true,
    value: selectedData.studentScope.value,
    callback: (_, data) => {
      selectedData.studentScope = {
        value: data,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectStudents = () => {
  showSelector({
    type: SelectorTypeEnum.student,
    multiple: true,
    value: selectedData.students.value,
    callback: (value, data) => {
      selectedData.students = {
        value,
        data: (data as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectPersons = () => {
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: true,
    value: selectedData.persons.value,
    callback: (value, data) => {
      selectedData.persons = {
        value,
        data: ([data] as SelectorValue[])?.map(i => i.name),
      };
    },
  });
};

const handleSelectPerson = () => {
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: selectedData.person.value,
    callback: (value, data) => {
      selectedData.person = {
        value,
        data,
      };
    },
  });
};

const handleSelectPosition = () => {
  showSelector({
    type: SelectorTypeEnum.position,
    // multiple: false,
    value: selectedData.position.value,
    callback: (value, data) => {
      selectedData.position = {
        value,
        data,
      };
    },
  });
};

const handleSelectSeparatedPerson = () => {
  showSelector({
    type: SelectorTypeEnum.separatedPerson,
    // multiple: false,
    value: selectedData.separatedPerson.value,
    disabledItemIds: ['1367766865382464085'],
    callback: (value, data) => {
      selectedData.separatedPerson = {
        value,
        data,
      };
    },
  });
};
</script>
