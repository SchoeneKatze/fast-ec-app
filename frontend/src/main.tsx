import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { LogtoProvider, type LogtoConfig } from "@logto/react";

const config: LogtoConfig = {
  endpoint: "https://xtt3qa.logto.app/",
  appId: "wo9cmk4r0ex6oaqe51w8w",
  scopes: ['email', 'profile'],
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LogtoProvider config={config}>
      <App />
    </LogtoProvider>
  </React.StrictMode>
);