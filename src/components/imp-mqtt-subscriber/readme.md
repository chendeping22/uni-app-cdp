## `imp-mqtt-subscriber` 组件使用说明

- 在模板中引入组件，传入要监听的 `topic` 数组
- 通过 `init` 事件回调获取相关方法
- 通过 `message` 事件回调接收 mq 推送的消息

```vue
<imp-mqtt-subscriber
  :topics="topics"
  @init="mqttInit"
  @message="onMessage"
></imp-mqtt-subscriber>

<script>
setup() {
    // init 事件接收参数包含这四个方法，与 react 中注入的同名方法使用一致
    const mqttInit = ({
      notifySubOrUnSubToEndApi,
      manualSubOrUnsub,
      end,
      connect,
    }) => {
      // ....
      notifySubOrUnSubToEndApi(true, {
        topic: MQTT_TOPICS.SPACE_DEVICE_STATUS,
        bid: 'xxx',
      });
    };

    // message 事件接收推送消息, 返回格式为 { message: any, topic: string };
    const onMessage = (message: any) => {
      console.log('接收到消息', message);
    };

  return {
    topics: [MQTT_TOPICS.SPACE_DEVICE_STATUS],
    mqttInit,
    onMessage,
  };
}
<script>
```
