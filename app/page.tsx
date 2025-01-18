"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { WFDService } from "./services/addressService";
import type { User, Address, HistoryRecord } from "./types";
import {
  Card,
  Text,
  Heading,
  Flex,
  Box,
  Code,
  IconButton,
  Separator,
  TextField,
  Button,
  Skeleton,
  SegmentedControl,
  ScrollArea,
  Badge,
} from "@radix-ui/themes";
import {
  MoonIcon,
  SunIcon,
  ReloadIcon,
  GitHubLogoIcon,
  TrashIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { ThemeContext } from "./theme-provider";
import { UserInfo } from "./components/UserInfo";
import { AddressInfo } from "./components/AddressInfo";
import { AddressSelector } from "./components/AddressSelector";

const generateId = () =>
  `history-${Date.now()}-${Math.random().toString(36).substring(2)}`;

interface UseAddressDataReturn {
  ip: string;
  setIp: (ip: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  user: User | null;
  address: Address | null;
  setAddress: (address: Address | null) => void;
  generateAddressData: (
    inputIp?: string
  ) => Promise<{ ip: string; address: Address; user: User } | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const useAddressData = (): UseAddressDataReturn => {
  const [ip, setIp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  // 核心方法：获取地址信息
  const generateAddressData = useCallback(async (inputIp?: string) => {
    setLoading(true);
    setError("");
    try {
      const service = new WFDService();
      let newIp: string;
      let coords;

      if (inputIp) {
        // 使用指定的IP
        newIp = inputIp;
        coords = await service.getIPCoordinates(inputIp);
      } else {
        // 获取当前IP
        const result = await service.getCurrentIP();
        newIp = result.ip;
        coords = await service.getIPCoordinates(newIp);
      }

      // 获取地址和用户信息
      const [addressData, userResult] = await Promise.all([
        service.getRandomAddress(coords.latitude, coords.longitude),
        service.getRandomUser("US"),
      ]);

      // 添加经纬度到地址信息中
      const addressWithCoords = {
        ...addressData,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      const newUser = userResult.results[0];

      // 更新状态
      setIp(newIp);
      setAddress(addressWithCoords);
      setUser(newUser);

      // 返回生成的数据
      return {
        ip: newIp,
        address: addressWithCoords,
        user: newUser,
      };
    } catch (err) {
      setError(inputIp ? "获取地址失败" : "获取 IP 地址失败");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ip,
    setIp,
    loading,
    setLoading,
    error,
    setError,
    user,
    address,
    setAddress,
    generateAddressData,
    setUser,
  };
};

const copyToClipboard = async (
  text: string,
  setCopiedId: (id: string) => void,
  id: string
) => {
  try {
    if (typeof window !== "undefined") {
      try {
        await window.navigator.clipboard.writeText(text);
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText =
          "position:fixed;pointer-events:none;opacity:0;";
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1000);
    }
  } catch (err) {
    console.error("复制失败:", err);
  }
};

export default function Home() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [copiedId, setCopiedId] = useState<string>("");
  const [inputIp, setInputIp] = useState<string>("");
  const [inputMode, setInputMode] = useState<string>("ip");
  const [selectedHistory, setSelectedHistory] = useState<string>("");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const {
    ip,
    setIp,
    loading,
    error,
    setError,
    user,
    address,
    setAddress,
    generateAddressData,
    setUser,
    setLoading,
  } = useAddressData();

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem("addressHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // 确保所有记录都有有效的 id
        const validHistory = parsedHistory.map((record: HistoryRecord) => ({
          ...record,
          id:
            record.id && record.id.startsWith("history-")
              ? record.id
              : generateId(),
        }));
        setHistory(validHistory);
      } catch (e) {
        console.error("Failed to parse history:", e);
        setHistory([]);
      }
    }
  }, []);

  // 初始化数据并添加到历史记录
  useEffect(() => {
    const initializeData = async () => {
      const result = await generateAddressData();
      if (result) {
        const timestamp = Date.now();
        const newRecord: HistoryRecord = {
          id: `history-${timestamp}-${Math.random().toString(36).substring(2)}`,
          user: result.user,
          address: result.address,
          ip: result.ip,
          timestamp: timestamp,
        };
        setHistory((prev) => {
          // 检查是否有重复的 id
          const isDuplicate = prev.some((record) => record.id === newRecord.id);
          if (isDuplicate) {
            newRecord.id = `history-${timestamp}-${Math.random()
              .toString(36)
              .substring(2)}`;
          }
          return [newRecord, ...prev.slice(0, 19)];
        });
        setSelectedHistory(newRecord.id);
      }
    };
    initializeData();
  }, [generateAddressData]);

  // 保存历史记录到 localStorage
  useEffect(() => {
    localStorage.setItem("addressHistory", JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleGenerateAddress = async () => {
    setLoading(true);
    try {
      if (inputMode === "address") {
        if (!inputIp) {
          setError("请选择地址");
          return;
        }
        const [country, state, city] = inputIp.split("|");
        try {
          const service = new WFDService();
          const coords = await service.getCoordinates(country, state, city);
          const [addressData, userResult] = await Promise.all([
            service.getRandomAddress(Number(coords.lat), Number(coords.lon)),
            service.getRandomUser("US"),
          ]);

          const addressWithCoords = {
            ...addressData,
            latitude: Number(coords.lat),
            longitude: Number(coords.lon),
          };

          const newUser = userResult.results[0];
          setAddress(addressWithCoords);
          setUser(newUser);

          const newRecord: HistoryRecord = {
            id: generateId(),
            user: newUser,
            address: addressWithCoords,
            ip: inputIp,
            timestamp: new Date().getTime(),
          };
          setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
          setSelectedHistory(newRecord.id);
        } catch (err) {
          setError("获取地址失败");
          console.error(err);
        }
        return;
      }

      const result = await generateAddressData(inputIp || undefined);

      if (result) {
        const newRecord: HistoryRecord = {
          id: generateId(),
          user: result.user,
          address: result.address,
          ip: result.ip,
          timestamp: new Date().getTime(),
        };
        setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
        setSelectedHistory(newRecord.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text, setCopiedId, id);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发选中事件
    setHistory((prev) => prev.filter((record) => record.id !== id));
    if (selectedHistory === id) {
      setSelectedHistory("");
    }
  };

  const handleDeleteAllHistory = () => {
    setHistory([]);
    setSelectedHistory("");
  };

  // 处理历史记录点击
  const handleHistoryClick = (record: HistoryRecord) => {
    setSelectedHistory(record.id);
    setUser(record.user);
    setAddress(record.address);
    if (!record.ip.includes("|")) {
      setIp(record.ip);
      // 如果地址中没有经纬度信息，则重新获取
      if (!record.address.latitude || !record.address.longitude) {
        const fetchCoordinates = async () => {
          try {
            const service = new WFDService();
            const coords = await service.getIPCoordinates(record.ip);
            const updatedAddress: Address = {
              ...record.address,
              latitude: coords.latitude,
              longitude: coords.longitude,
            };
            setAddress(updatedAddress);
          } catch (error) {
            console.error("获取坐标失败:", error);
          }
        };
        fetchCoordinates();
      }
    }
  };

  const handleExportJSON = () => {
    const service = new WFDService();
    const blob = service.exportHistory(history);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = service.getExportFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const backgroundStyle = {
    backgroundImage:
      theme === "dark"
        ? `linear-gradient(
          45deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0) 49%,
          rgba(255, 255, 255, 0.05) 49%,
          rgba(255, 255, 255, 0.05) 51%,
          rgba(255, 255, 255, 0) 51%,
          rgba(255, 255, 255, 0) 100%
        )`
        : `linear-gradient(
          45deg,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0) 49%,
          rgba(0, 0, 0, 0.08) 49%,
          rgba(0, 0, 0, 0.08) 51%,
          rgba(0, 0, 0, 0) 51%,
          rgba(0, 0, 0, 0) 100%
        )`,
    backgroundSize: "30px 30px",
  };

  return (
    <Box>
      {/* 导航栏 */}
      <Flex
        justify="end"
        align="center"
        px="6"
        py="4"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Flex gap="6" align="center">
          <IconButton
            size="4"
            variant="ghost"
            aria-label="GitHub"
            onClick={() =>
              window.open(
                "https://github.com/GuooGaii/ip-geoaddress-generator",
                "_blank"
              )
            }
            className="group flex items-center gap-2"
          >
            <Text
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-sm"
              highContrast
            >
              喜欢的话点个⭐吧~
            </Text>
            <GitHubLogoIcon width="24" height="24" />
          </IconButton>
          <IconButton
            size="4"
            variant="ghost"
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            {theme === "light" ? (
              <MoonIcon width="24" height="24" />
            ) : (
              <SunIcon width="24" height="24" />
            )}
          </IconButton>
        </Flex>
      </Flex>

      {/* 主要内容 */}
      <Flex
        className="min-h-screen"
        direction="column"
        align="center"
        justify="center"
        gap="4"
        style={{
          ...backgroundStyle,
          paddingTop: "60px", // 为固定导航栏留出空间
        }}
      >
        <Heading size="8">真实地址生成器 🌍</Heading>
        <Flex gap="2" align="center">
          <Text size="4" color="gray">
            您的当前 IP 地址为：
          </Text>
          {loading ? (
            <Skeleton>
              <Code size="4">loading...</Code>
            </Skeleton>
          ) : (
            <Code size="4">{ip}</Code>
          )}
        </Flex>

        <Flex
          gap="4"
          style={{ width: "100%", maxWidth: "900px" }}
          className="flex flex-col md:flex-row"
        >
          {/* 左侧卡片 */}
          <Card size="4" style={{ flex: 2 }} className="hidden md:flex">
            <Flex direction="column" gap="3" style={{ flex: 1 }}>
              <Box>
                <Flex gap="3">
                  <SegmentedControl.Root
                    defaultValue="ip"
                    onValueChange={(value) => {
                      setInputMode(value);
                      setInputIp(""); // 清空输入框内容
                    }}
                    size="2"
                  >
                    <SegmentedControl.Item value="ip">IP</SegmentedControl.Item>
                    <SegmentedControl.Item value="address">
                      地址
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                  {inputMode === "address" ? (
                    <Flex style={{ flex: 1 }}>
                      <AddressSelector onSelect={setInputIp}>
                        <TextField.Root
                          size="2"
                          placeholder="请选择地址"
                          value={inputIp}
                          onChange={(e) => setInputIp(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </AddressSelector>
                    </Flex>
                  ) : (
                    <TextField.Root
                      size="2"
                      placeholder={ip}
                      value={inputIp}
                      onChange={(e) => setInputIp(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  )}
                  <Button
                    size="2"
                    onClick={handleGenerateAddress}
                    disabled={loading}
                  >
                    <Text>{loading ? "生成中..." : "生成地址"}</Text>
                    <ReloadIcon className={loading ? "animate-spin" : ""} />
                  </Button>
                </Flex>
              </Box>
              <Separator size="4" />
              <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <Flex
                  direction="column"
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Text size="2" mb="2" color="gray">
                    历史记录
                  </Text>
                  <ScrollArea
                    type="hover"
                    scrollbars="vertical"
                    style={{ flex: 1 }}
                  >
                    <Flex direction="column" gap="2" pr="3">
                      {history.length === 0 ? (
                        <Box
                          style={{
                            minHeight: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text size="2" color="gray" align="center">
                            当前没有任何生成的信息
                          </Text>
                        </Box>
                      ) : (
                        history.map((record) => (
                          <Box
                            key={record.id}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                              backgroundColor:
                                selectedHistory === record.id
                                  ? "var(--gray-a6)"
                                  : undefined,
                            }}
                            className="hover:bg-[var(--gray-a4)]"
                            onClick={() => handleHistoryClick(record)}
                          >
                            <Flex align="center" justify="between" gap="3">
                              <Flex
                                align="center"
                                gap="2"
                                style={{ flex: 1, minWidth: 0 }}
                              >
                                <Text
                                  size="2"
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {record.user.name.last}{" "}
                                  {record.user.name.first}
                                </Text>
                                <Badge size="1" variant="soft" color="gray">
                                  {new Date(
                                    record.timestamp
                                  ).toLocaleDateString()}
                                </Badge>
                              </Flex>
                              <IconButton
                                size="1"
                                color="red"
                                variant="ghost"
                                onClick={(e) =>
                                  handleDeleteHistory(record.id, e)
                                }
                              >
                                <TrashIcon />
                              </IconButton>
                            </Flex>
                          </Box>
                        ))
                      )}
                    </Flex>
                  </ScrollArea>
                  {history.length > 0 && (
                    <>
                      <Separator size="4" my="3" />
                      <Flex justify="between" gap="3">
                        <Button
                          size="2"
                          variant="soft"
                          onClick={handleExportJSON}
                        >
                          <Text>导出JSON</Text>
                          <DownloadIcon />
                        </Button>
                        <Button
                          size="2"
                          color="red"
                          variant="soft"
                          onClick={handleDeleteAllHistory}
                        >
                          <Text>删除全部</Text>
                          <TrashIcon />
                        </Button>
                      </Flex>
                    </>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Card>

          {/* 右侧卡片 */}
          <Card size="4" style={{ flex: 1 }} className="flex-1 w-full">
            <Flex direction="column" gap="4">
              {error && <Text color="red">{error}</Text>}
              <Box style={{ width: "100%" }}>
                <Flex direction="column" gap="3">
                  <UserInfo
                    user={user}
                    loading={loading}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                  <Separator size="4" />
                  <AddressInfo
                    address={address}
                    loading={loading}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
}
