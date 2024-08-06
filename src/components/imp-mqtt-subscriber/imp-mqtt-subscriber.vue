<template>
  <view class="hidden"></view>
</template>

<script lang="ts">
// import { useStore } from '@/store/old';
import { map } from '@/utils/lodash-es';
import { Callback } from '@/utils/mqtt/lib/mqtt/types';
import mqttApplication from '@/utils/mqtt/mqttApplication';
import { defineComponent, onBeforeUnmount, onUpdated, PropType } from 'vue';

export default defineComponent({
  props: {
    topics: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    mqttActions: {
      type: Object as PropType<Record<string, Callback>>,
      default: () => ({}),
    },
  },
  emits: ['init', 'message'],
  setup(props, ctx) {
    const connectMqttSuccess = () => {};
    const end = () => {
      mqttApplication.mqttServiceInstance.end({
        force: true,
        options: {},
      });
    };
    const connect = () => {
      mqttApplication.mqttSubscribe(
        {
          topics: props.topics,
          mqttActions: props.mqttActions,
          isConnect: false,
        },
        connectMqttSuccess,
      );
    };
    const manualSubOrUnsub = (...args: any) => {
      if (!mqttApplication.getStoreMqttInfo().accessToken) {
        return;
      }
      (mqttApplication.manualSubOrUnsub as any)(...args);
    };
    const unsubscribeTopics = map(props.topics, topic => {
      return mqttApplication.mqttStateObservable.subscribe(
        topic,
        message => {
          if (!message) return;
          ctx.emit('message', { message, topic });
        },
        false,
      );
    });

    const unsubscribeIsConnected = mqttApplication.mqttStateObservable.subscribeIsConnected(b => {
      if (!b) {
        return;
      }
      console.log('<imp-mqtt-subscriber> 已连接。');
      connect();
      ctx.emit('init', {
        notifySubOrUnSubToEndApi: mqttApplication.notifySubOrUnSubToEndApi,
        manualSubOrUnsub,
        end,
        connect,
      });
    });

    onUpdated(() => {
      console.log('mqtt onUpdated');
      mqttApplication.checkMqttStatusOfRetryMqtt(3000);
    });

    onBeforeUnmount(() => {
      unsubscribeIsConnected?.();
      unsubscribeTopics.forEach(cb => {
        return cb?.();
      });
      // @todo
      mqttApplication.clearInterval();
    });
  },
});
</script>
<style lang="scss" scoped>
.hidden {
  display: none;
}
</style>
