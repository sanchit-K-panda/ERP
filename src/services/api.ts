import axios from "axios";
import { useContextStore } from "@/store/contextStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { activeCompany, activeHub } = useContextStore.getState();
  const nextHeaders = axios.AxiosHeaders.from(config.headers);

  if (activeCompany?.id) {
    nextHeaders.set("X-Company-ID", activeCompany.id);
  }

  if (activeHub?.id) {
    nextHeaders.set("X-Hub-ID", activeHub.id);
  }

  config.headers = nextHeaders;
  return config;
});

export default api;
