import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// virtual开头的这一段ID代表一个虚拟模块，插件内部会通过这个虚拟模块加载成一段脚本，把svg插入到dom树。
import 'virtual:svg-icons-register';
import fib from 'virtual:fib';
import env from 'virtual:env';
console.log(env);
alert(`结果: ${fib(10)}`);
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
