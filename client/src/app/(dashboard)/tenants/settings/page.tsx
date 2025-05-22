"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useUpdateTenantSettingsMutation,
} from "@/state/api-services/tenantApiService";
import React from "react";
import { useGetAuthUserQuery } from "@/state/api-services/authenSessionApi";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateTenant] = useUpdateTenantSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.userInfo.name,
    email: authUser?.userInfo.email,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateTenant({
      cognitoId: authUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
    />
  );
};

export default TenantSettings;
