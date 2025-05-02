import { api } from "@/lib/api.axios";
import { AxiosErrorRes, Response } from "@/types/axios.types";
import { UserDashboardData } from "@/types/dashboard.types";
import { User } from "@/types/user.types";
import { AxiosError } from "axios";

class UsersService {
  async getUserData(): Promise<Response<User>> {
    try {
      const res = await api.get("/users/info");
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      const data = (error as AxiosError).response?.data as AxiosErrorRes;
      return {
        success: false,
        data: data,
      };
    }
  }

  async getUserDataByName(username: string): Promise<Response<User>> {
    try {
      const res = await api.get(`/users/public/${username}`);
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      const data = (error as AxiosError).response?.data as AxiosErrorRes;
      return {
        success: false,
        data: data,
      };
    }
  }

  async getDashboardData(): Promise<Response<UserDashboardData>> {
    try {
      const res = await api.get(`/users/dashboard-info`);
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      const data = (error as AxiosError).response?.data as AxiosErrorRes;
      return {
        success: false,
        data: data,
      };
    }
  }
}

const usersService = new UsersService();
export default usersService;
