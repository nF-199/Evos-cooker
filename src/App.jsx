import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { OrdersProvider } from "./context/OrdersContext";

const App = () => {
  return (
    <OrdersProvider>
      <div className="flex h-screen overflow-hidden bg-base-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </OrdersProvider>
  );
};

export default App;