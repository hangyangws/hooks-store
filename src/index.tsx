import React from 'react';

import { StoreData, ProviderProps, DispatchCtxType } from './types';
import { getInitialState, getComdbinedReducer } from './utils';
import { applyMiddleware } from './middleware';

let storeCxt: React.Context<StoreData>;
let dispatchCtx: DispatchCtxType<any>;

const Provider = <State, Action>(props: ProviderProps<State, Action>) => {
  const initialState: StoreData = React.useMemo(
    () => getInitialState(props.stores),
    [props.stores]
  );

  storeCxt = React.useMemo(() => React.createContext<StoreData>(initialState), [
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
      <storeCxt.Provider value={state}>{props.children}</storeCxt.Provider>
    </dispatchCtx.Provider>
  );
};

export function useDispatch<Action>() {
  return React.useContext(dispatchCtx as DispatchCtxType<Action>);
}

export function useStore<State>(nameSpace?: string) {
  const store = React.useContext(storeCxt);
  const state: State = nameSpace ? store[nameSpace] : store;

  return state;
}

export default Provider;
