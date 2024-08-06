import { ref, onUnmounted } from 'vue';

const useCountDown = (count: number) => {
  const timer = ref<any>(null);
  const time = ref(0);

  const handleStart = () => {
    time.value = count;
    timer.value = setInterval(() => {
      if (time.value) {
        time.value--;
      } else {
        clearInterval(timer.value);
      }
    }, 1000);
  };

  const handleEnd = () => {
    time.value = 0;
    timer.value && clearInterval(timer.value);
  };

  onUnmounted(() => {
    timer.value && clearInterval(timer.value);
  });

  return { time, handleStart, handleEnd };
};

export default useCountDown;
