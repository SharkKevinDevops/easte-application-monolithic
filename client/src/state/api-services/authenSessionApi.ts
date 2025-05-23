import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant,
} from "@/types/prismaTypes";
import { createNewUserInDatabase } from "@/lib/utils"; // Đảm bảo đúng đường dẫn
import { FiltersState } from "..";

// 👉 Hàm phụ xử lý logic fetch hoặc tạo user
const fetchOrCreateUser = async (
  user: any,
  idToken: any,
  userRole: string,
  fetchWithBQ: any
) => {
  const userId = idToken?.payload["sub"]; // 👉 Lấy userId chuẩn
  const baseUrl =
    userRole === "manager"
      ? process.env.NEXT_PUBLIC_API_MANAGER_URL
      : process.env.NEXT_PUBLIC_API_TENANT_URL;

  const endpoint =
    userRole === "manager"
      ? `${baseUrl}/managers/${userId}`
      : `${baseUrl}/tenants/${userId}`;

  let userDetailsResponse = await fetchWithBQ(endpoint);

  if (userDetailsResponse.error?.status === 404) {
    userDetailsResponse = await createNewUserInDatabase(
      user,
      idToken,
      userRole,
      fetchWithBQ
    );

    if (userDetailsResponse.error) {
      throw new Error("Failed to create user in database.");
    }
  }

  return userDetailsResponse;
};

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_AUTH_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "authApi",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
  ],
  endpoints: (build) => ({
    getAuthUser: build.query<
      {
        cognitoInfo: any;
        userInfo: Tenant | Manager;
        userRole: string;
      },
      void
    >({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const userDetailsResponse = await fetchOrCreateUser(
            user,
            idToken,
            userRole,
            fetchWithBQ
          );

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error.message || "Could not fetch user data",
            },
          };
        }
      },
    }),
  }),
});

export const { useGetAuthUserQuery } = authApi;
