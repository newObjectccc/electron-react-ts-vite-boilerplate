import axios, { AxiosRequestConfig, Method } from 'axios';
import { useMemo, useReducer, useRef } from 'react';
// eslint-disable-next-line import/no-named-as-default-member
const CancelToken = axios.CancelToken;
const getCancelCtx = () => CancelToken.source();
const BASEURL_ENV_MAP: { [key: string]: string } = {
  production: 'http://47.108.164.241/api',
  development: 'https://rysyclub.com/api'
};
const _axios = axios.create({
  baseURL: BASEURL_ENV_MAP[process.env.NODE_ENV ?? 'development']
});

const ACTION_TYPE = {
  LOADING: 'loading' as const,
  ERROR: 'error' as const,
  DATA: 'data' as const
};

const cacheMap = new Map();

interface IState {
  loading: boolean;
  error: unknown;
  data: unknown;
}
interface IAction {
  type: 'loading' | 'error' | 'data';
  value: unknown;
}
const reducer = (state: IState, action: IAction) => {
  const mergedState = { ...state };
  switch (action.type) {
    case ACTION_TYPE.LOADING:
      mergedState.loading = action.value as boolean;
      break;
    case ACTION_TYPE.ERROR:
      mergedState.error = action.value;
      break;
    case ACTION_TYPE.DATA:
      mergedState.data = action.value;
      break;
    default:
      break;
  }
  return mergedState;
};

/**
 * [useAxios description]
 *
 * @param   {AxiosRequestConfig}  options         [options 同axios config]
 * @param   {string|symbol}  cacheKey        [cacheKey 如果传入则视为需要缓存请求结果，优先使用缓存结果，默认不使用缓存]
 * @param   {boolean}  cancelPrevious  [cancelPrevious 是否取消上一次请求，默认不取消]
 *
 * @return  {{loading,err,data,cancel,update,request}}                  [return 返回一个对象，包含 loading, error, data, request, update, cancel 6个属性]
 */
export const useAxios = <P extends object, R extends object>(
  options: AxiosRequestConfig = {},
  cacheKey: string | symbol,
  cancelPrevious: boolean
) => {
  const [state, dispatch] = useReducer(reducer, { error: null, loading: false, data: null });
  const cancelCtx = useRef(null);

  const httpReq: (
    params: P | undefined,
    owOptions: AxiosRequestConfig,
    flushCache: boolean
  ) => Promise<R | undefined> = async (params, owOptions = {}, flushCache) => {
    let res = null;

    // merge options
    let mergedOptions = {
      ...options,
      ...owOptions
    };
    // start request
    dispatch({ type: ACTION_TYPE.LOADING, value: true });
    try {
      // check cache if needed
      if (cacheKey && !flushCache) {
        const cached = cacheMap.get(cacheKey);
        dispatch({ type: ACTION_TYPE.DATA, value: cached });
        return cached;
      }
      // cancel previous request if needed
      cancelPrevious && cancelCtx.current?.cancel('cancel previous request');
      // get cancel token and set to ref controller
      const ctl = getCancelCtx();
      cancelCtx.current = ctl;
      mergedOptions.cancelToken = ctl.token;
      // merge params
      if (params) {
        mergedOptions = {
          ...mergedOptions,
          ...normalizedParamsByMethod(options.method as Method, params)
        };
      }
      res = await _axios.request(mergedOptions);
    } catch (err) {
      console.error(err);
      res = err.response?.data ?? err;
    }
    dispatch({ type: ACTION_TYPE.LOADING, value: false });
    if (res.data?.code === '000') {
      dispatch({ type: ACTION_TYPE.DATA, value: res.data?.data });
      // cache data if needed
      cacheKey && cacheMap.set(cacheKey, res.data?.data);
      return res.data?.data;
    }
    dispatch({ type: ACTION_TYPE.ERROR, value: res });
  };

  return {
    ...state,
    request: (p: P | undefined, opt: AxiosRequestConfig, flush: boolean) => httpReq(p, opt, flush),
    update: (val: unknown) => dispatch({ type: ACTION_TYPE.DATA, value: val }),
    cancel: (msg: string) => cancelCtx.current?.cancel(msg)
  };
};

/**
 * [generateAxiosHook 生成useAxios的Hoc函数]
 *
 * @param   {string}  method          [method 请求方法]
 * @param   {string}  url             [url 请求地址]
 * @param   {AxiosRequestConfig}  options         [options 同axios config]
 * @param   {string|symbol}  cacheKey        [cacheKey 如果传入则视为需要缓存请求结果，优先使用缓存结果，默认不使用缓存]
 * @param   {boolean}  cancelPrevious  [cancelPrevious 是否取消上一次请求，默认不取消]
 *
 * @return  {useAxios()}                  [return 返回useAxios]
 */
export const generateAxiosHook =
  <P extends object, R extends object>(
    method: Method,
    url: string,
    options = {},
    cacheKey: string | symbol,
    cancelPrevious: boolean
  ) =>
  (params: P) => {
    const allOpts = useMemo(() => {
      const normalized = { method, url, ...options };
      normalizedParamsByMethod(method, params);
      return normalized;
    }, [params]);
    return useAxios<P, R>(allOpts, cacheKey, cancelPrevious);
  };

/**
 * [normalizedParamsByMethod description]
 *
 * @param   {'post'|'get'|'delete'|'patch'|'option'|'put'}  method  [method 请求方法]
 * @param   {T extends Object}  params  [params 请求的参数]
 *
 * @return  {{params: any, data: any}}          [return description]
 */
const normalizedParamsByMethod = <T extends object>(method: Method, params: T) => {
  const normalized: { params?: unknown; data?: unknown } = {};
  const hasData = ['post', 'put', 'patch'].includes(method);
  const hasParams = ['get', 'delete', 'head', 'option'].includes(method);
  if (hasParams) normalized.params = params;
  if (hasData) normalized.data = params;
  return normalized;
};
