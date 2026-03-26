// import { create } from "zustand";
// import axiosInstance from "../services/axiosInstance";

// const savedUser = localStorage.getItem("user");
// const parsedUser =
//   savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;

// export const useAuthStore = create((set) => ({
//   user: JSON.parse(localStorage.getItem("user")) || null,
//   token: localStorage.getItem("token") || null,
//   isLoading: false,
//   isCheckingAuth: false,

//   register: async (formData) => {
//     try {
//       set({ isLoading: true });
//       const res = await axiosInstance.post("/auth/register", formData);
//       return res;
//     } finally {
//       set({ isLoading: false });
//     }
//   },

//   login: async (formData) => {
//     try {
//       set({ isLoading: true });

//       const res = await axiosInstance.post("/auth/login", formData);
//       const user = res?.data?.data;
//       const token = res?.data?.token;

//       set({ user, token });

//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       return res;
//     } finally {
//       set({ isLoading: false });
//     }
//   },

//   logout: async () => {
//     try {
//       set({ isLoading: true });
//       await axiosInstance.post("/auth/logout");

//       set({
//         user: null,
//         token: null,
//       });

//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       set({ user: null, token: null });
//     } finally {
//       set({ isLoading: false });
//     }
//   },

//   fetchMe: async () => {
//     try {
//       set({ isCheckingAuth: true });

//       const res = await axiosInstance.get("/auth/me");
//       const user = res?.data?.data;

//       set({
//         user,
//         isCheckingAuth: false,
//       });

//       localStorage.setItem("user", JSON.stringify(user));
//     } catch (error) {
//       set({
//         user: null,
//         token: null,
//         isCheckingAuth: false,
//       });

//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     }
//   },
// }));

import { create } from "zustand";
import axiosInstance from "../services/axiosInstance";

const savedUser = localStorage.getItem("user");
const parsedUser =
  savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;

export const useAuthStore = create((set) => ({
  user: parsedUser,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  isCheckingAuth: false,

  register: async (formData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post("/auth/register", formData);
      return res;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (formData) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.post("/auth/login", formData);
      const user = res?.data?.data;
      const token = res?.data?.token;

      set({ user, token });

      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }

      return res;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await axiosInstance.post("/auth/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      set({
        user: null,
        token: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ isCheckingAuth: true });

      const res = await axiosInstance.get("/auth/me");
      const user = res?.data?.data;

      set({
        user,
        isCheckingAuth: false,
      });

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      set({
        user: null,
        token: null,
        isCheckingAuth: false,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
}));