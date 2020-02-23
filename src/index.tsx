import React from 'react';

import { StoreData, ProviderProps, DispatchCtxType, Middleware } from './types';
import { getInitialState, getComdbinedReducer } from './utils';
import { applyMiddleware } from './middleware';

let storeCtx: React.Context<StoreData>;
let dispatchCtx: DispatchCtxType<any>;

const Provider = <State, Action>(props: ProviderProps<State, Action>) => {
  const initialState: StoreData = React.useMemo(
    () => getInitialState(props.stores),
    [props.stores]
  );

  storeCtx = React.useMemo(() => React.createContext<StoreData>(initialState), [
    initialState
  ]);
  dispatchCtx = React.useMemo(
    () => React.createContext<React.Dispatch<Action>>(() => 0),
    []
  );

  const combinedReducer = React.useMemo(
    () => getComdbinedReducer(props.stores),
    [props.stores]
  );

  const [state, dispatch] = React.useReducer(combinedReducer, initialState);

  // 让 dispatch 支持 middlewares
  const enhancedDispatch =
    props.middlewares && props.middlewares.length
      ? applyMiddleware<Action>(state, dispatch, props.middlewares)
      : dispatch;

  return (
    <dispatchCtx.Provider value={enhancedDispatch}>
      <storeCtx.Provider value={state}>{props.children}</storeCtx.Provider>
    </dispatchCtx.Provider>
  );
};

export function useDispatch<Action>() {
  return React.useContext(dispatchCtx as DispatchCtxType<Action>);
}

export function useStore<State>(nameSpace?: string) {
  const store = React.useContext(storeCtx);
  const state: State = nameSpace ? store[nameSpace] : store;

  return state;
}

// ----------------------------------------------------------------------

// TODO: add dispatch type
interface HookProviderProps {
  value: [StoreData, any];
  children: JSX.Element[] | JSX.Element | React.ReactNode;
}

let hookStoreCtx: React.Context<[StoreData, any]>;

// use a more hook&redux-like method to create store
// state can be used combineReducer method in somewhere else
// middlewares are optional
export const createHookStore = <State, Action>(
  reducer: (state: StoreData, action: Action) => StoreData,
  initialState: State,
  middlewares?: Middleware<Action>[]
) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const enhancedDispatch =
    middlewares && middlewares.length
      ? applyMiddleware(state, dispatch, middlewares)
      : dispatch;

  return [state, enhancedDispatch];
};

// can pass both state, and dispatch(with middleware) as one param to context provider, no need use two context
export const HookStoreProvider = (props: HookProviderProps) => {
  const [state, dispatch] = props.value;

  hookStoreCtx = React.useMemo(
    () => React.createContext<[StoreData, any]>([state, dispatch]),
    [state]
  );

  return (
    <hookStoreCtx.Provider value={[state, dispatch]}>
      {props.children}
    </hookStoreCtx.Provider>
  );
};

export function useHookDispatch() {
  const [, dispatch] = React.useContext(hookStoreCtx);
  return dispatch;
}

// maybe a callback like redux?
export function useHookStore<State>(selector: (state: StoreData) => any) {
  const [store] = React.useContext(hookStoreCtx);

  return selector(store);
}

// ----------------------------------------------------------------------

export default Provider;
