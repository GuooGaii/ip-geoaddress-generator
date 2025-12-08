export interface IPResponse {
  ip: string;
}

class IPService {
  async fetchIP(): Promise<IPResponse> {
    const response = await fetch("/api/ip");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const ipService = new IPService();
