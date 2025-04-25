import type { Address, Coordinates } from "@/app/types";
import axios from "axios";

type CoordinatesResponse = Coordinates;
type AddressResponse = {
  address: Address;
};

class AddressService {
  async getIPCoordinates(ip: string): Promise<CoordinatesResponse> {
    const response = await axios.get<CoordinatesResponse>(
      `https://ipapi.co/${ip}/json/`
    );
    return response.data;
  }

  async getRandomAddress(coordinates: Coordinates): Promise<Address> {
    const response = await axios.get<AddressResponse>(
      `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&format=json&accept-language=en`
    );
    return response.data.address;
  }

  getGoogleMapUrl(address: Address): string {
    const addressString = [
      address.road,
      address.city,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addressString
    )}`;
  }
}

export const addressService = new AddressService();
