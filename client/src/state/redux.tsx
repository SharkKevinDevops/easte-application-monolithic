"use client";

import { useRef } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import globalReducer from "@/state";

// import APIs
import {applicationApi} from "@/state/api-services/applicationApiService";
import { leaseApi } from "./api-services/leaseApiService";
import { managerApi } from "./api-services/managerApiService";
import { paymentApi } from "./api-services/paymentApiService";
import { propertyApi } from "./api-services/propertyApiService";
import { tenantApi } from "./api-services/tenantApiService";
import { authApi } from "./api-services/authenSessionApi";

/* REDUX STORE */
// const rootReducers = combineReducers({
//   global: globalReducer,
//   [api.reducerPath]: api.reducer,
// });

const rootReducer = combineReducers({
  global: globalReducer,
  [authApi.reducerPath]: authApi.reducer,
  [applicationApi.reducerPath]: applicationApi.reducer,
  [propertyApi.reducerPath]: propertyApi.reducer,
  [leaseApi.reducerPath]: leaseApi.reducer,
  [tenantApi.reducerPath]: tenantApi.reducer,
  [managerApi.reducerPath]: managerApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
})



// export const makeStore = () => {
//   return configureStore({
//     reducer: rootReducer,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware().concat(api.middleware),
//   });
// };

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(applicationApi.middleware)
        .concat(propertyApi.middleware)
        .concat(leaseApi.middleware)
        .concat(tenantApi.middleware)
        .concat(managerApi.middleware)
        .concat(paymentApi.middleware)
        .concat(authApi.middleware),
  });
};

/* REDUX TYPES */
// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore["getState"]>;
// export type AppDispatch = AppStore["dispatch"];
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
// export default function StoreProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const storeRef = useRef<AppStore | null>(null);
//   if (!storeRef.current) {
//     storeRef.current = makeStore();
//     setupListeners(storeRef.current.dispatch);
//   }
//   return <Provider store={storeRef.current}>{children}</Provider>;
// }

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}