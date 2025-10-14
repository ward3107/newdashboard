import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const studentAPI = {
  getAllStudents: async () => {
    try {
      const response = await api.get("", {
        params: { action: "getAllStudents" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  getStudent: async (studentId) => {
    try {
      const response = await api.get("", {
        params: {
          action: "getStudent",
          studentId: studentId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching student:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("", {
        params: { action: "getStats" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },
};
