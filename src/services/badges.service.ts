import { api } from "@/lib/api.axios";
import { AxiosErrorRes, Response } from "@/types/axios.types";
import { Badge } from "@/types/badge.types";
import { AxiosError } from "axios";

class BadgesService {
  async getBadges(): Promise<Response<Badge[]>> {
    try {
      const res = await api.get("/badges");
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

const badgesService = new BadgesService();
export default badgesService;
