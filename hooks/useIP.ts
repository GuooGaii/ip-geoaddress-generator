import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useIP() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ip"],
    queryFn: async () => {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data;
    },
  });

  return {
    ip: data?.ip || "",
    isLoading,
    error,
  };
}
