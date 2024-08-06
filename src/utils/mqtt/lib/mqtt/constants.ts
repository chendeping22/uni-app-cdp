/*
 * @Author: linbin@leedarson.com
 * @Date: 2019-07-11 16:11:13
 * Copyright © Leedarson. All rights reserved.
 */

const TOPIC_HEADER = 'iot';
const TOPIC_VERSION = 'v1';
const TOPIC = {
  CLIENT: `${TOPIC_HEADER}/${TOPIC_VERSION}/c`,
  SERVER: `${TOPIC_HEADER}/${TOPIC_VERSION}/s`,
  BROADCAST: `${TOPIC_HEADER}/${TOPIC_VERSION}/cb`,
};

export default TOPIC;
