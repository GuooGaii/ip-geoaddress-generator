import axios from "axios";

export interface IPResponse {
  ip: string;
}

class IPService {
  async fetchIP(): Promise<IPResponse> {
    const response = await axios.get<IPResponse>(
      "https://api.ipify.org?format=json"
    );
    return response.data;
  }
}

export const ipService = new IPService();
