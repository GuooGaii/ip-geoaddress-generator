import { useQuery } from "@tanstack/react-query";
import { addressSignal, coordinatesSignal } from "@/signals/addressSignal";
import { qualitySignal } from "@/signals/qualitySignal";
import type { Address } from "@/app/types";
import type { IPQualityResult } from "@/app/types/ipQuality";

interface GenerateResponse {
  ip: string;
  coordinates: {
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    country: string;
  };
  address: Address;
  quality?: IPQualityResult;
}

export default function useAddress(ip: string | null) {
  const query = useQuery<GenerateResponse | null, Error>({
    queryKey: ["generate", ip],
    queryFn: async () => {
      if (!ip) return null;
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate address");
      }
      
      const data = await response.json();
      
      // 更新 signals
      coordinatesSignal.value = data.coordinates;
      addressSignal.value = data.address;
      
      // 更新 quality signal
      if (data.quality) {
        qualitySignal.value = data.quality;
      }
      
      return data;
    },
    enabled: ip !== null && ip !== "",
    refetchOnWindowFocus: false,
  });

  return {
    isLoading: query.isLoading,
    error: query.error,
    addressRefetch: query.refetch,
  };
}