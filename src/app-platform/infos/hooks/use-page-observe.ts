import { getCurrentInstance, onBeforeMount, onBeforeUnmount, ref } from 'vue';

function usePageObserve(eventName: string) {
  const scrollTop = ref(0);
  const callback = ref<() => void>();

  const vm = getCurrentInstance();
  const _on = uni.$on.bind(vm);
  const _off = uni.$off.bind(vm);

  function wrapRefreshCallback() {
    callback.value = () => {
      console.log('>>LL>>> ~ publish过来的事件，scroll-view scrollTop重置:', callback);
      scrollTop.value = scrollTop.value === 0 ? -0.1 : 0;
      callback.value = undefined;
    };
  }

  onBeforeMount(() => {
    _on(eventName, wrapRefreshCallback);
  });

  onBeforeUnmount(() => {
    _off(eventName, wrapRefreshCallback);
  });

  return [scrollTop, callback] as const;
}

export default usePageObserve;
