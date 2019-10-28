import React from 'react';

import { StoreData, Middleware } from './types';

export const applyMiddleware = <Action>(
  state: StoreData,
  dispatch: React.Dispatch<Action>,
  middlewares: Middleware<Action>[]
) => (action: Action) => {
  middlewares.forEach(middleware => {
    middleware({ next: dispatch, action, state });
  });
};
