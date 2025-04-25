import axios from "axios";
import type { User } from "@/app/types";

export interface UserResponse {
  results: User[];
}

class UserService {
  async fetchUser(country: string): Promise<User> {
    const response = await axios.get<UserResponse>(
      `https://randomuser.me/api/?nat=${country}&inc=name,phone,id`
    );
    return response.data.results[0];
  }
}

export const userService = new UserService();
