import React from 'react';

let storeCxt: React.Context<number>;

const Provider = (number: number) => {
  storeCxt = React.useMemo(
    () => React.createContext<number>(number),
    []
  );
  return (
    <storeCxt.Provider value={1}>hello world!</storeCxt.Provider>
  );
};

export const useStore = () => React.useContext(storeCxt);

export default Provider;
