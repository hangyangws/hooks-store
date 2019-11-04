# hooks-store

[![](https://img.shields.io/badge/React-≥16.8.0-yellow.svg)](https://reactjs.org/docs/hooks-intro.html)
[![Build Status](https://travis-ci.com/hangyangws/hooks-store.svg?branch=master)](https://travis-ci.com/hangyangws/hooks-store)
[![npm downloads](https://img.shields.io/npm/dm/hooks-store)](https://www.npmjs.com/package/hooks-store)

**Language switching**：[English](https://github.com/hangyangws/hooks-store/blob/master/README.en.md)

## 目录

- [前言](https://github.com/hangyangws/hooks-store#前言)
- [安装](https://github.com/hangyangws/hooks-store#安装)
- [使用](https://github.com/hangyangws/hooks-store#使用)
  - [顶层容器](https://github.com/hangyangws/hooks-store#顶层容器)
  - [数据中心](https://github.com/hangyangws/hooks-store#数据中心)
  - [middlewara「中间件」](https://github.com/hangyangws/hooks-store#middlewara中间件)
  - [子组件](https://github.com/hangyangws/hooks-store#子组件)
- [Demo](https://github.com/hangyangws/hooks-store#demo)
- [API](https://github.com/hangyangws/hooks-store#api)
  - [Provider](https://github.com/hangyangws/hooks-store#provider)
  - [useDispatch](https://github.com/hangyangws/hooks-store#usedispatch)
  - [useStore](https://github.com/hangyangws/hooks-store#usestore)
- [Typescript 支持](https://github.com/hangyangws/hooks-store#typescript-支持)

## 前言

TL;DR

`hooks-store` 是使用 [React Hooks](https://zh-hans.reactjs.org/docs/hooks-intro.html) 给 React 应用提供多 store 全局数据管理方案的一种实现，使用方式上与 [Redux](https://github.com/reduxjs/redux) 类似。  
这一切的实现得益于 React Hooks 16.8 以后推出的两个 hooks：[useReducer](https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer)、[useContext](https://zh-hans.reactjs.org/docs/hooks-reference.html?#usecontext)。

在 hooks 问世之前，我尝试过使用 [Context.Provider](https://zh-hans.reactjs.org/docs/context.html#contextprovider) 配合 [Context.Consumer](https://zh-hans.reactjs.org/docs/context.html#contextconsumer) 以 [render props](https://zh-hans.reactjs.org/docs/render-props.html) 的方式实现全局数据管理。  
当然在实践中遇到很多弊端，所以也没有继续。

[useReducer](https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer) 和 [useContext](https://zh-hans.reactjs.org/docs/hooks-reference.html?#usecontext) 的出现，足足让我开心了一整天。  
它带来了与 Redux 类似的体验：store、dispatch、reducer。

我开始基于 hooks 实践数据管理模式，然后很容地发现了三个问题：
1. middleware「中间件」还没有优雅的实现方案
2. 如何实现多 store, 以便方便数据管理
3. 使用方式并不简单，且需要一定的理解成本

前期，我自以为实现了一个「完美」的方案：[使用 React Hooks 代替 Redux](https://zhuanlan.zhihu.com/p/66020264)。  
在这个方案里面，我使用多个 Provider 和多个 Context 实现了多 store 的方案。  
而且，我为这样的多 store 方案找到了优雅的 [整合模式](https://github.com/facebook/react/issues/14520)。  
直到现在我也很喜欢这种设计思路，但是基于项目开发的时候，它暴露出一个弊端：不同 store 之间不能共享数据，并且不方便实现 middlewara「中间件」的逻辑等等。

然后，在反复推敲后和实验后，我找到一个新的实践模式：  
只使用一个 Provider 就能实现多 store 的方案。

我为这个版本的数据管理方案抽离了 npm 包，诞生了现在的 [hooks-store](https://www.npmjs.com/package/hooks-store)。  
从原理和实现上，反而变得简单，并且消除我之前遇到的所有问题。

## 安装

> 依赖于 React 16.8 以上的版本

`npm i hooks-store`

## 使用

> 这里展示简单的 react todolist demo 搭建代码，具体实现可以参考 [Demo 章节](https://github.com/hangyangws/hooks-store#demo)

### 顶层容器

```jsx
/* index.jsx */

import React from "react";
import ReactDOM from "react-dom";
import Provider from "hooks-store";

import storeList from "./storeList";
import middlewaras from "./middlewares";
import App from "./App";

// 建议项目中使用如下依赖
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const Root = document.getElementById("root");

ReactDOM.render(
  <Provider stores={storeList} middlewares={middlewaras}>
    <App />
  </Provider>,
  Root
);
```

### 数据中心

```jsx
/* storeList.js */

// 为了方便，这里把两个 store 写在一个文件里面。实际开发中，不建议这样做。

// 使用 immutable 的 setIn 方法
import { setIn } from 'immutable';

// 第一个 Store：
// 管理全局通知状态，类似于是否出去加载中。

const noticeInitialState = {
  loading: false
};

// 注意：reducer 的 switch 不需要 default return
const noticeReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING_START': // 加载开始
      return setIn(state, ['loading'], true);
    case 'LOADING_STOP': // 加载结束
      return setIn(state, ['loading'], false);
  }
};

// 第二个 Store：
// todolist 数据列表。
const todolistInitialState = {
  data: []
};

const todolistReducer = (state, action) => {
  switch (action.type) {
    case 'TODOLIST_INIT': // 数据初始化
      return setIn(state, ['data'], action.payload);
    case 'TODOLIST_CLEAR': // 数据清空
      return setIn(state, ['data'], []);
  }
};

const noticeStore = {
  name: 'notice',
  initialState: noticeInitialState,
  reducer: noticeReducer
};

const todolistStore = {
  name: 'todolist',
  initialState: todolistInitialState,
  reducer: todolistReducer
};

const storeList = [todolistStore, noticeStore];

export default storeList;
```

### middlewara「中间件」

```jsx
/* middlewares.js */

// 第一个 middleware：
// 用来拦截 API 请求
const apiFetch = async ({ next, action }) => {
  // 如果 action 里面有 api 字段，则表示需要请求服务端数据作为 payload
  if (action.api) {
    // 数据请求前，全局通知进入 loading 状态
    next({ type: 'LOADING_START' });

    const serverResponse = await fetch(api.url, {
      method: api.method,
      ...(api.option)
    });

    // 数据请求后，关闭全局通知 loading 状态
    next({ type: 'LOADING_STOP' });

    const nextAction = {
      ...action,
      payload: action.payload || serverResponse.data
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
  console.log('发出 action：', action);
  console.log('当前数据状态是：', state);

  next(action);
};

const middlewaras = [actionLog, apiFetch];

export default middlewaras;
```

### 子组件

```jsx
/* App.jsx */

import React from "react";
import { useStore, useDispatch } from "hooks-store";

const Loading = () => {
  // 使用 useStore 方法得到对应的 state 数据
  const { loading } = useStore("notice");

  return loading ? "加载中..." : null;
};

const TodoList = () => {
  // 使用 useDispatch 的方法得到 dispatch，用来发送 action
  const dispatch = useDispatch();
  const todoList = useStore("todolist");

  React.useEffect(() => {
    // 组件挂载的时候开始请求数据
    dispatch({
      type: "TODOLIST_INIT",
      api: {
        url: "/todolist"
      }
    });

    return () => {
      // 组件卸载的时候清空数据
      dispatch({
        type: "TODOLIST_CLEAR"
      });
    };
  }, []);

  const handleDelete = (todo) => () => {
    dispatch({
      type: 'TODOLIST_DELETE',
      payload: todo
    });
  };

  return (
    <ul>
      {todoList.data.map(todo => (
        <li key={todo.id} onClick={handleDelete(todo)}>{todo.text}</li>
      ))}
    </ul>
  );
};

const App = () => (
  <>
    <Loading />
    <TodoList />
  </>
);

export default App;
```

## DEMO

- **codesandbox 项目**：[simple-todolist](https://codesandbox.io/s/silly-framework-byc3w)  
  基于 hooks-store 编写的简单版 todolist
- **github 项目**：[typescript-todo-list](https://github.com/hangyangws/react-todo-list)  
  基于 hooks-store 配合 typescript 写的 todoList 项目

## API

### Provider

Provider 作为整个 APP 的父元素。  
注：如果是 typescript 项目，需要传递开发者自定义的 State, Action 范形。

```typescript
const Provider: <State, Action>(props: ProviderProps<State, Action>) => JSX.Element
```

- ProviderProps

Provider 组建接收开发者自定义的 stores 和 middlewares 作为参数

```typescript
interface ProviderProps<State, Action> {
  stores: Store<State, Action>[]; // Store 数组
  middlewares?: Middleware<Action>[]; // Middleware 数组
  children: JSX.Element[] | JSX.Element | React.ReactNode; // 项目根组件
}
```

- Store

每一个 store 作为一个数据仓库，包含：  
1. name「唯一的名称」
2. initialState「初始化数据，可以是任何非 false 类型」
3. reducer「数据出处理中心」

```typescript
interface Store<State, Action> {
  name: string;
  initialState: State;
  reducer: Reducer<State, Action>;
}
```

- middleware

中间件作为一个函数，每一个 `dispatch(action)` 的发送都会经过中间件。
中间件函数接收有三个字段的对象：

1. next： 下一个中间件动作分发者。如果已经是最后一个则分发到 reducer
2. action：当前触发的 action
3. state：全局 store 的数据。注：是所有 store 的数据，而不是某一个 store 的数据，因此可以在中间件中根据全局 store 作出逻辑判断，再进行下一步操作

```typescript
type Middleware<Action> = ({ next, action, state }: {
  next: React.Dispatch<Action>;
  action: Action;
  state?: StoreData;
}) => void;
```

- Reducer

Reducer 作为数据处理器，接收 state「当前 store 的数据」、action「当前触发的 action」；  
返回一个新的 state，或者什么都不返回。  
注意：这里的 Reducer 和 Redux 的 reducer 不一样：如果 state 没有修改，则不需要返回原来的 state，或者返回 undeinfed。

```typescript
type Reducer<State, Action> = (state: State, action: Action) => State | undefined;
```

### useDispatch

在组件内部通过 useDispatch 得到 dispatch 方法，通过 `dispatch(Action)` 的可以触发一个 action。  
如果想实现异步 dispatch 建议在 middleware 中操作。

```typescript
function useDispatch<Action>(): React.Dispatch<Action>;
```

### useStore

在组件内部通过 useStore 得到任何一个 store 获取全局 store 的数据。  
useStore 接收一个 namespace 可选参数。  
namespace 即任何一个 store 的名称，如果没有传递 namespace 则表示获取所有 store 数据。

```typescript
function useStore<State>(nameSpace?: string): State;
```

## Typescript 支持

如果项目选择 typescript 静态类型校验，那么 hooks-store 将会友好的支持，这样会保障你的项目更健硕。  
要想 hooks-store 与你的 TS 项目友好相处，只需要准备两个类型作为范形「具体传递与使用方式见：[API 章节](https://github.com/hangyangws/hooks-store#api)」：

### 1. State

State 告诉 hooks-store，你的项目的数据是什么样子。  
比如：

```ts
interface StateOne {
  loading: boolean;
}

interface DataItem {
  id: number;
  name: string;
}

interface StateTwo {
  data: DataItem[];
}

// 最终范形 State 可以是多个 state 类型的整合
export type State = StateOne | StateTwo;
```

### 2. Action

Action 则告诉 hooks-store，你的项目中可能发触发什么样的 action，以便检识别出错误的 action。

比如：

```ts
interface IApi {
  method?: string;
  url: string;
}

type ActionOne =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_STOP' };

type ActionTwo =
  | { type: 'TODOLIST_INIT'; payload?: DataItem[]; api?: IApi }
  | { type: 'TODOLIST_CLEAR' };

// 最终范形 Action 可以是多个 action 类型的整合
export type Action = ActionOne | ActionTwo;
```

## License

[MIT](https://github.com/hangyangws/hooks-store/blob/master/LICENSE)
