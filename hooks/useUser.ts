import { useState, useEffect, useCallback } from "react";
import { User } from "@/app/types";
import WFDService from "@/app/services/addressService";

export default function useUser(country: string) {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(() => {
    const service = new WFDService();
    service.getRandomUser(country).then((user) => {
      setUser(user.results[0]);
    });
  }, [country]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, setUser, fetchUser };
}
