import { compact, flatten, map, uniq } from 'lodash-es';
import { ref } from 'vue';
import type { FieldsGroup, Group, TabsGroup } from '../types/schema';
import { getSelectOptions } from './api';

export const useDictionaries = (schema: Group[]) => {
  const dictionaries = ref<Record<string, any[]>>({});
  (async () => {
    const res = await getSelectOptions(
      compact(
        uniq(
          map(
            flatten(
              map(
                schema,
                g =>
                  (g as FieldsGroup).fields ||
                  flatten(map((g as TabsGroup).groups, g => g.fields)) ||
                  [],
              ),
            ),
            f => f.type === 'Select' && f.dictionary,
          ),
        ),
      ),
    );
    dictionaries.value = res;
  })();
  return dictionaries;
};
