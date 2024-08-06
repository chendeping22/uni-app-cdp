import { request } from '@/utils/request';
import { compact, flatten, map, uniq } from 'lodash-es';
import { ref } from 'vue';

type FieldsGroup = any;
type Group = any;
type TabsGroup = any;

function getSelectOptions(codes: string[]) {
  return request(`/dictionaries/query?entryCodes=${codes?.join(',')}`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
}

export const useDictionaries = (schema: Group[]) => {
  const dictionaries = ref<Record<string, any[]>>({});
  (async () => {
    const res: any = await getSelectOptions(
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
