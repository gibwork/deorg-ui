import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL, // Your API base URL
});

api.interceptors.request.use(
  async (config) => {
    const { getToken } = auth();
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
