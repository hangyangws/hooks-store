import React from 'react';

import { ProviderProps, StoreData } from './types';

declare const Provider: <State, Action>(props: ProviderProps<State, Action>) => JSX.Element;

export declare function useDispatch<Action>(): React.Dispatch<Action>;

export declare function useStore<State>(nameSpace?: string): State;

export declare type Middleware<Action> = ({ next, action, state }: {
  next: React.Dispatch<Action>;
  action: Action;
  state?: StoreData;
}) => void;

export declare type Reducer<State, Action> = (state: State, action: Action) => State | undefined;

export interface Store<State, Action> {
  name: string;
  initialState: State;
  reducer: Reducer<State, Action>;
}

export default Provider;
