import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { LogtoProvider, type LogtoConfig } from "@logto/react";

const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT;
const appId = import.meta.env.VITE_LOGTO_APP_ID;

const config: LogtoConfig = {
  endpoint: endpoint,
  appId: appId,
  scopes: ["profile", "email"],
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LogtoProvider config={config}>
      <App />
    </LogtoProvider>
  </React.StrictMode>
);