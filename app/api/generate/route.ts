import { NextResponse } from "next/server";
import WFDService from "@/app/services/addressService";

export const runtime = "edge";

const wfdService = new WFDService();

export async function POST(request: Request) {
  try {
    const { ip } = await request.json();
    
    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      );
    }

    const coordinates = await wfdService.getIPCoordinates(ip);
    const address = await wfdService.getRandomAddress(
      coordinates.latitude,
      coordinates.longitude
    );

    return NextResponse.json({
      ip,
      coordinates,
      address,
    });
  } catch (error) {
    console.error("Generate address error:", error);
    return NextResponse.json(
      { error: "Failed to generate address" },
      { status: 500 }
    );
  }
}
