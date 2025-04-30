import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import type { User } from "@/app/types";
import { userSignal } from "@/signals/userSignal";
export default function useUser(country: string) {
  const userQuery = useQuery<User, Error>({
    queryKey: ["user", country],
    queryFn: async () => {
      console.log("用户请求发起");
      const response = await userService.fetchUser(country);
      userSignal.value = response;
      return response;
    },
    enabled: !!country,
    refetchOnWindowFocus: false, // 在窗口重新聚焦时不要重新获取数据
  });

  return userQuery;
}
