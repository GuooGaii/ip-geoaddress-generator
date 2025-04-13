import { useState, useCallback, useEffect } from "react";
import { Address } from "@/app/types";
import WFDService from "@/app/services/addressService";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function useAddress(ip: string | null) {
  const [address, setAddress] = useState<Address | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchCoordinates = useCallback(async (targetIp: string) => {
    setLoading(true);
    try {
      const service = new WFDService();
      const coords = await service.getIPCoordinates(targetIp);
      setCoordinates(coords);
      return coords;
    } catch (err) {
      setError("获取坐标失败");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAddress = useCallback(async (coords: Coordinates) => {
    setLoading(true);
    try {
      const service = new WFDService();
      const addressData = await service.getRandomAddress(
        coords.latitude,
        coords.longitude
      );
      const addressWithCoords = {
        ...addressData,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      setAddress(addressWithCoords);
    } catch (err) {
      setError("获取地址失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 当 IP 变化时，获取新的坐标
  useEffect(() => {
    if (!ip) {
      setCoordinates(null);
      setAddress(null);
      return;
    }
    fetchCoordinates(ip);
  }, [ip, fetchCoordinates]);

  // 当坐标变化时，获取新的地址
  useEffect(() => {
    if (!coordinates) return;
    fetchAddress(coordinates);
  }, [coordinates, fetchAddress]);

  return {
    address,
    setAddress,
    coordinates,
    setCoordinates,
    loading,
    error,
  };
}
