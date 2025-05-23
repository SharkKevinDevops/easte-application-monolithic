// lib/customBaseQuery.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "aws-amplify/auth";

const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  try {
    const session = await fetchAuthSession();
    const { idToken } = session.tokens ?? {};
    const role = idToken?.payload["custom:role"];

    // Chọn baseURL theo role
    let baseUrl = process.env.NEXT_PUBLIC_API_MANAGER_URL;
    if (role === "tenant") {
      baseUrl = process.env.NEXT_PUBLIC_API_TENANT_URL;
    }else {
      baseUrl = process.env.NEXT_PUBLIC_API_MANAGER_URL
    }

    const rawBaseQuery = fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers) => {
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
        return headers;
      },
    });

    return rawBaseQuery(args, api, extraOptions);
  } catch (error: any) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: error.message || "Could not set up baseQuery",
      },
    };
  }
};

export default customBaseQuery;
