import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "@/app/types";

export default function useUser(country: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", country],
    queryFn: async () => {
      const response = await axios.get<{ results: User[] }>(
        `https://randomuser.me/api/?nat=${country}&inc=name,phone,id`
      );
      return response.data.results[0];
    },
    enabled: !!country,
    staleTime: 0, // 每次请求都获取新数据
    gcTime: 0, // 不缓存数据（新版本中 cacheTime 改为 gcTime）
  });

  return {
    user: data || null,
    isLoading,
    error,
    fetchUser: refetch,
  };
}
