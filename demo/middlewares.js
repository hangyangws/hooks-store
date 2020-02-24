// 第一个 middleware：
// 用来拦截 API 请求
const apiFetch = async ({ next, action }) => {
  // 如果 action 里面有 api 字段，则表示需要请求服务端数据作为 payload
  if (action.api) {
    // 数据请求前，全局通知进入 loading 状态
    next({ type: "LOADING_START" });

    // 由于没有 mock 服务端，这里采用假数据
    // const serverResponse = await fetch(action.api.url, {
    //   method: action.api.method,
    //   ...action.api.option
    // });

    const serverResponse = await new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            text: "又是美好的一天",
            createTime: 1564392621791
          },
          {
            id: 2,
            text: "吃早饭",
            createTime: 1561219200000
          }
        ]);
      }, 1000);
    });

    // 数据请求后，关闭全局通知 loading 状态
    next({ type: "LOADING_STOP" });

    const nextAction = {
      ...action,
      payload: action.payload || serverResponse
    };

    delete nextAction.api;

    // 以新的数据触发一下个 action
    next(nextAction);
  } else {
    next(action);
  }
};

// 第二个 middleware：
// 用来打印日志
const actionLog = ({ next, action, state }) => {
  const log = {
    action,
    state
  };

  console.table(log);

  next(action);
};

const middlewares = [apiFetch, actionLog];

export default middlewares;
