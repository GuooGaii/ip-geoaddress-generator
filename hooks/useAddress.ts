import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/addressService";
import { addressSignal } from "@/signals/addressSignal";
import type { Address, Coordinates } from "@/app/types";

export default function useAddress(coordinates: Coordinates | null) {
  const addressQuery = useQuery<Address | null, Error>({
    queryKey: ["address", coordinates],
    queryFn: async () => {
      console.log("获取地址请求发起");
      if (coordinates) {
        const response = await addressService.getRandomAddress(coordinates);
        addressSignal.value = response;
        return response;
      }
      return null;
    },
    enabled: coordinates !== null,
    refetchOnWindowFocus: false,
  });

  return addressQuery;
}
