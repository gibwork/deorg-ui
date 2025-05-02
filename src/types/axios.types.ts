export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type AxiosErrorRes = {
  status_code: number;
  message: string;
};

export type ErrorResponse = {
  success: false;
  data: AxiosErrorRes;
};

export type Response<T> = SuccessResponse<T> | ErrorResponse;
