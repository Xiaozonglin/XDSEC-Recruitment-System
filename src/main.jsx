import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

if (typeof window !== "undefined") {
  console.log(String.raw`
   ______                            __ __      _ 
  / ____/___  ____  ____  ___  _____/ //_/___  (_)
 / /   / __ \/ __ \/ __ \/ _ \/ ___/ ,< / __ \/ / 
/ /___/ /_/ / /_/ / /_/ /  __/ /  / /| / /_/ / /  
\____/\____/ .___/ .___/\___/_/  /_/ |_\____/_/   
          /_/   /_/                               
  `);
}

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
