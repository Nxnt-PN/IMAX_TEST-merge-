import React,{ Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './stores/store';
import { ToastContainer } from 'react-toastify';
import router from './routes/router';
import axiosInstance from '@/services/axiosInstance';
import "./i18n"

// Import Toastify CSS
import "react-toastify/dist/ReactToastify.css";
// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Import Bootstrap JS (ถ้าต้องการ JS)
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/css/index.css";

globalThis.$axios = axiosInstance;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
        <RouterProvider router={router}/>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}/>
    </Provider>
  </React.StrictMode>
);

