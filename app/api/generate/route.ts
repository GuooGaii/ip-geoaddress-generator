import { NextResponse } from "next/server";
import WFDService from "@/app/services/addressService";
import { IPQualityService } from "@/app/services/ipQualityService";
import type { IPQualityResult } from "@/app/types/ipQuality";

export const runtime = "edge";

const wfdService = new WFDService();
const ipQualityService = new IPQualityService();

export async function POST(request: Request) {
  try {
    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 },
      );
    }

    const [coordinates, qualityResult] = await Promise.all([
      wfdService.getIPCoordinates(ip),
      ipQualityService.check(ip).catch((error: Error) => {
        console.warn("IP quality check failed:", error.message);
        return null;
      }),
    ]);

    const address = await wfdService.getRandomAddress(
      coordinates.latitude,
      coordinates.longitude,
    );

    let user = null;
    let warning = null;

    try {
      const userData = await wfdService.getRandomUser();
      user = userData.results[0];
    } catch (error) {
      console.warn("用户数据获取失败，继续返回地址信息:", error);
      warning = "User data unavailable";
    }

    const responsePayload: {
      ip: string;
      coordinates: typeof coordinates;
      address: typeof address;
      user: typeof user;
      quality?: IPQualityResult | null;
      warning?: string | null;
    } = {
      ip,
      coordinates,
      address,
      user,
      warning,
    };

    if (qualityResult) {
      responsePayload.quality = qualityResult;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("地址生成错误:", error);
    return NextResponse.json(
      { error: "Failed to generate address" },
      { status: 500 },
    );
  }
}
