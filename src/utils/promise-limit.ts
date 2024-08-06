import type { IUploadFileOptions } from '@/services/upload';
import { delay } from './tools';

/**
 * 通用泛型函数, 注意参数为数组
 * @param array 支持任意多个的参数
 * @description 若不超过2个参数时, 使用IFunction更方便, 若超过2个再使用此接口
 * @example IFunctionBase<[string, string, string],number>
 * @returns 泛型, 默认void
 */
declare interface IFunctionBase<T extends any[] = any, R = void> {
  (...args: T): R;
}

/**
 * 泛型函数, 常用于声明回调函数
 * @param (T,K) 最多支持两个参数
 * @description 可传0~2个参数
 * @extends IFunctionBase
 * @example IFunction, IFunction<string, number>
 * @returns void, 若有可自行转义
 */
export type IFunction<T = undefined, K = undefined> = T extends undefined
  ? IFunctionBase<[]>
  : K extends undefined
  ? IFunctionBase<[T]>
  : IFunctionBase<[T, K]>;

export interface IPromiseLimitRtn<T = any> {
  inx: number;
  code: number;
  res: T;
}

/**
 * 限制同类promise的并发请求, 如同时上传图片9张是会报429请求太频繁的
 * @param params 请求参数的数组
 * @param limit 同一时刻并行执行的上限, 默认1, 即上传图片的限制
 * @param excuteDelay 执行每个任务前的delay, 默认333, 即上传图片的delay
 * @param callFunc
 * @returns {PromiseLike} 所有执行结果, 不论成功或失败
 */
export const promiseLimit = async <T, K>(
  params: T[],
  callFunc: IFunctionBase<[T, number, any], Promise<IPromiseLimitRtn<K>>>,
  limit = 1,
  excuteDelay = 100,
  options?: IUploadFileOptions,
) => {
  let taskCount = 0;
  let finishCount = 0;
  let goingCount = 0;
  const res = [] as IPromiseLimitRtn<K>[];

  for (let i = 0; ; i++) {
    if (finishCount >= params.length) {
      break;
    }
    const rest = params.length - goingCount;
    if (taskCount < limit && rest > 0) {
      // 当前可执行任务数 = 任务池剩余可执行次数与任务的剩余数量的最小值
      const num = Math.min(limit - taskCount, rest);
      //   console.log('即将执行任务数量:', num);
      for (let j = 0; j < num; j++) {
        taskCount++;
        // console.log('当前执行:', goingCount);
        await delay(excuteDelay);
        callFunc(params[goingCount], goingCount, options || {})
          .then(r => {
            res.push(r);
            finishCount++;
            taskCount--;
            // console.log(`当前结束: ${r.inx}, 成功`);
          })
          .catch(c => {
            res.push(c);
            finishCount++;
            taskCount--;
            // console.error(`当前结束: ${c.inx}, 失败!!!!`);
          });
        goingCount++;
      }
    }
    await delay(30);
  }

  return res;
};
