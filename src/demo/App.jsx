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

  return (
    <ul>

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
