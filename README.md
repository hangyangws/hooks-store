# hooks-store

[![](https://img.shields.io/badge/React-≥16.8.0-brightgreen.svg)](https://reactjs.org/docs/hooks-intro.html) [![Build Status](https://travis-ci.com/hangyangws/hooks-store.svg?branch=master)](https://travis-ci.com/hangyangws/hooks-store)

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
- [Typescript 支持](https://github.com/hangyangws/hooks-store#typescript支持)

## 前言

TL;DR

`hooks-store` 是使用 [React Hooks](https://zh-hans.reactjs.org/docs/hooks-intro.html) 给 React 应用提供多 store 全局数据管理方案的一种实现，使用方式上与 [Redux](https://github.com/reduxjs/redux) 类似。

这一切的实现得益于 React Hooks 16.8 以后推出的两个 hooks：useReducer、useContext。

在 hooks 问世之前，我尝试过使用 Context.Provider 配合 Context.Consumer 以 render props 的方式实现全局数据管理。  
当然在实践中遇到很多弊端，所以也没有继续。

useReducer 和 useContext 的出现，足足让我开心了一整天。  
它带来了与 Redux 类似的体验：store、dispatch、reducer。

我开始基于 hooks 实践数据管理模式，然后很容地发现了三个问题：
1. middleware「中间件」还没有优雅的实现方案
2. 如何实现 **多 store**, 以便方便数据管理
3. 使用方式并不简单，且需要一定的理解成本

前期，我自以为实现了一个「完美」的方案：[使用 React Hooks 代替 Redux](https://zhuanlan.zhihu.com/p/66020264)。  
在这个方案里面，我使用多个 Provider 和多个 Context 实现了多 store 的方案。  
而且，我为这样的多 store 方案找到了优雅的 [整合模式](https://github.com/facebook/react/issues/14520)。  
直到现在我也很喜欢这种设计思路，但是基于项目开发的时候，它暴露出一个弊端：不同 store 之间不能共享数据，并且不方便实现 middlewara「中间件」的逻辑等等。

然后，在反复推敲后和实验后，我找到一个新的实践模式：  
只使用一个 Provider 实现多 store 的方案。

我为这版的新的数据管理抽离了 npm 包，诞生了现在的 hooks-store。  
从原理和实现上，反而变得简单，并且消除我之前遇到的所有问题。

## 安装

> 只支持 React 16.8 以上的版本

`npm i hooks-store`

## 使用

### 顶层容器

```jsx
/* index.jsx */

import React from 'react';
import ReactDOM from 'react-dom';
import Provider from 'hooks-store';

import storeList from './storeList';
import middlewaras from './middlewares';
import App from './App';

const Root = document.getElementById('Root');

// 使用 Provider 作为整个应用的父组件
// 给 Provider 提供 stores、middlewares 参数
ReactDOM.render(
  <Provider stores={storeList} middlewares={middlewaras}>
    <App />
  </Provider>,
  Root
);
```

### 数据中心

```jsx
/* storeList.jsx */

// 为了方便，这里把两个 store 写在一个文件里面。实际开发中，不建议这样做。

// 使用 immutable 的 setIn 方法
import { setIn } from 'immutable';

// 第一个 Store：
// 管理全局通知状态，类似于是否出去加载中。

const noticeInitialState = {
  loading: false
};

// 注意：reducer 的 switch 不需要 default return
const noticeReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING_START': // 加载开始
      return setIn(state, ['loading'], true);
    case 'LOADING_STOP': // 加载结束
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
/* middlewares.jsx */

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

import React from 'react';
import { useStore, useDispatch } from 'hooks-store';

const Loading = () => {
  // 使用 useStore 方法得到对应的 state 数据
  const { loading } = useStore('notice');

  return loading ? '加载中...' : null;
};

const TodoList = () => {
  // 使用 useDispatch 的方法得到 dispatch，用来发送 action
  const dispatch = useDispatch();
  const todoList = useStore('todolist');

  React.useEffect(() => {
    // 组件挂载的时候开始请求数据
    dispatch({
      type: 'TODOLIST_INIT',
      api: {
        url: '/todolist'
      }
    });

    return () => {
      // 组件卸载的时候清空数据
      dispatch({
        type: 'TODOLIST_CLEAR'
      });
    };
  }, []);

  return (
    <ul>
      {!todoList.data.length && <li>没有数据</li>}
      {todoList.data.map(todo => (
        <li key={todo.id}>{todo.text}</li>
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

- 在线 demo - [simple-todolist](https://codesandbox.io/s/silly-framework-byc3w)
- 使用 typescript 写的 todoList - [typescript-todo-list](https://github.com/hangyangws/react-todo-list)

## API

### Provider

### useDispatch

### useStore

## Typescript 支持


## License

[MIT](https://github.com/hangyangws/hooks-store/blob/master/LICENSE)
