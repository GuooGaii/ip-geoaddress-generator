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

    // 获取坐标和地址（必须成功）
    const coordinates = await wfdService.getIPCoordinates(ip);
    const address = await wfdService.getRandomAddress(
      coordinates.latitude,
      coordinates.longitude
    );

    // 尝试获取用户数据（允许失败）
    let user = null;
    let warning = null;
    
    try {
      const userData = await wfdService.getRandomUser();
      user = userData.results[0];
    } catch (error) {
      console.warn("用户数据获取失败，继续返回地址信息:", error);
      warning = "User data unavailable";
    }

    return NextResponse.json({
      ip,
      coordinates,
      address,
      user,
      ...(warning && { warning })
    });
  } catch (error) {
    console.error("地址生成错误:", error);
    return NextResponse.json(
      { error: "Failed to generate address" },
      { status: 500 }
    );
  }
}