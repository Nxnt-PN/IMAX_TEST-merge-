import axios from 'axios';
import { store } from '@/stores/store';
import { config } from '@/config/config';
import Swal from 'sweetalert2';
import i18n from '@/i18n';
import { toast } from 'react-toastify';


const axiosInstance = axios.create({
    baseURL: config.apiBaseURL,
    headers: {
        'Content-Type': 'application/json', // ตั้งค่า content-type
    },
});

axiosInstance.interceptors.request.use((request) => {
    const state = store.getState();
    const token = state?.auth.userData?.token;
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }

    request.params = request.params || {};
    return request;
},
(error)=>{
    return Promise.reject(error);
});


/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const t = i18n.t.bind(i18n);
    const status = error?.response?.status;
    const currentPath = globalThis.location.pathname;

    if (!status) {
      if (globalThis.navigator.onLine === false) {
        toast.error(t("common:error.no-internet")); // "ไม่มีการเชื่อมต่ออินเทอร์เน็ต"
      } else {
        toast.error(t("common:error.server-unavailable")); // "เซิร์ฟเวอร์ไม่พร้อมใช้งาน"
      }
    }
    if (status === 401 && currentPath === '/login') {
      toast.error(error.response.data.message)
    }

    if (status === 401 && currentPath !== '/login') {
        const result = await Swal.fire({
          title: t(`common:error.unauthorized`),
          text: t(`common:error.unauthorized-subtitle`),
          icon: "warning",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: t(`common:button.ok`)
        })
        if(result.isConfirmed) {
          globalThis.location.href = '/login';
        }
    }

    if (status === 403) {
      globalThis.location.href = '/status-403';
    }

    if (status === 500 ) {
      toast.error(t("common:error.internal-server"));
    }

    throw error;
  }
);

export default axiosInstance;
