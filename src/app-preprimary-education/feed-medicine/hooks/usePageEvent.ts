import { onBeforeMount, onBeforeUnmount } from 'vue';

export default (eventName: string, eventFunc: (res: any) => void) => {
  onBeforeMount(() => {
    uni.$on(eventName, eventFunc);
  });
  onBeforeUnmount(() => {
    uni.$off(eventName, eventFunc);
  });
};
