export interface User {
  name: {
    first: string;
    last: string;
  };
  phone: string;
  id: {
    name: string;
    value: string;
  };
}

export interface Address {
  road?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface HistoryRecord {
  id: string;
  user: User;
  address: Address;
  ip: string;
  timestamp: number;
}
