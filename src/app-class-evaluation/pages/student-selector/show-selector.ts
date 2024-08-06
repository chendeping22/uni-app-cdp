import { useStudentSelectorStore } from '../../store/student-selector';
import { Student } from '../../types/student-selector';

interface ShowSelectorParams {
  value?: Student[];
  callback: (value: { isSelectedAll: boolean; value: Student[] }) => void;
}

export function selectStudent({ value, callback }: ShowSelectorParams) {
  const store = useStudentSelectorStore();
  const selectedValue: Record<string, Student[]> = {};

  if (value) {
    value.forEach(item => {
      selectedValue[item.clazzId] = selectedValue[item.clazzId]
        ? selectedValue[item.clazzId].concat(item)
        : [item];
    });
  }

  store.$setSelectedMap({ value: selectedValue });

  uni.navigateTo({
    url: '/app-class-evaluation/pages/student-selector/index',
    events: {
      acceptDataFromStudentSelectorPage: (data: { isSelectedAll: boolean; value: Student[] }) => {
        if (typeof callback === 'function') {
          callback(data);
        }
      },
    },
  });
}
