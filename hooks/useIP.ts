import { useState, useEffect } from "react";
import WFDService from "@/app/services/addressService";

export default function useIP() {
  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    const service = new WFDService();
    service.getCurrentIP().then((result: { ip: string }) => {
      setIp(result.ip);
    });
  });

  return { ip, setIp };
}
