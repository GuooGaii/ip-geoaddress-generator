"use client";

import { useState, useEffect, useCallback } from "react";
import { WFDService } from "./services/addressService";
import type {
  User,
  Address,
  HistoryRecord,
  TempMailMessage,
  MailEvent,
} from "./types";
import {
  Card,
  Text,
  Heading,
  Flex,
  Box,
  Code,
  TextField,
  Button,
  Skeleton,
  SegmentedControl,
  Separator,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { UserInfo } from "./components/UserInfo";
import { AddressInfo } from "./components/AddressInfo";
import { AddressSelector } from "./components/AddressSelector";
import { InboxDialog } from "./components/InboxDialog";
import { HistoryList } from "./components/HistoryList";
import { TopBar } from "./components/TopBar";
import Mailjs from "@cemalgnlts/mailjs";
import { Toast } from "./components/Toast";

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

export default function Home() {
  const [inputIp, setInputIp] = useState<string>("");
  const [inputMode, setInputMode] = useState<string>("ip");
  const [selectedHistory, setSelectedHistory] = useState<string>("");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const {
    ip,
    setIp,
    loading: addressLoading,
    error,
    setError,
    user,
    address,
    setAddress,
    generateAddressData,
    setUser,
    setLoading: setAddressLoading,
  } = useAddressData();
  const [tempEmail, setTempEmail] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [messages, setMessages] = useState<TempMailMessage[]>([]);
  const [mailjs] = useState(new Mailjs());
  const [inboxOpen, setInboxOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<TempMailMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<TempMailMessage | null>(
    null
  );

  // 计算总的加载状态
  const loading = addressLoading || emailLoading;

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

  useEffect(() => {
    const createTempEmail = async () => {
      setEmailLoading(true);
      try {
        const account = await mailjs.createOneAccount();
        if (account.status) {
          setTempEmail(account.data.username);
          await mailjs.login(account.data.username, account.data.password);
          mailjs.on("arrive", async (message: MailEvent) => {
            const fullMessage = await mailjs.getMessage(message.id);
            if (fullMessage.status) {
              const source = await mailjs.getSource(message.id);
              const messageData = {
                ...fullMessage.data,
                source: {
                  id: source.data.id,
                  data: source.data.data,
                  downloadUrl: source.data.downloadUrl,
                },
              } as TempMailMessage;
              setMessages((prev) => [...prev, messageData]);
              setToastMessage(messageData);
            }
          });
        }
      } catch (error) {
        console.error("创建临时邮箱失败:", error);
      } finally {
        setEmailLoading(false);
      }
    };

    if (!tempEmail) {
      createTempEmail();
    }

    return () => {
      mailjs.off();
    };
  }, []);

  const handleGenerateAddress = async () => {
    setAddressLoading(true);
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
      setAddressLoading(false);
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

  const handleMessageClick = async (msg: TempMailMessage) => {
    if (!msg.source) {
      try {
        const fullMessage = await mailjs.getMessage(msg.id);
        if (fullMessage.status) {
          const source = await mailjs.getSource(msg.id);
          const messageData = {
            ...fullMessage.data,
            source: {
              id: source.data.id,
              data: source.data.data,
              downloadUrl: source.data.downloadUrl,
            },
          } as TempMailMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? messageData : m))
          );
          setSelectedMessage(messageData);
        }
      } catch (error) {
        console.error("获取邮件内容失败:", error);
      }
    } else {
      setSelectedMessage(msg);
    }
  };

  const handleToastClick = (message: TempMailMessage) => {
    setInboxOpen(true);
    setSelectedMessage(message);
  };

  return (
    <Box>
      <TopBar onInboxOpen={() => setInboxOpen(true)} />

      {/* 主要内容 */}
      <Flex
        className="min-h-screen"
        direction="column"
        align="center"
        justify="center"
        gap="4"
        style={{
          backgroundImage: "var(--background-image)",
          backgroundSize: "var(--background-size)",
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
              <HistoryList
                history={history}
                selectedHistory={selectedHistory}
                onHistoryClick={handleHistoryClick}
                onDeleteHistory={(id) => {
                  setHistory((prev) =>
                    prev.filter((record) => record.id !== id)
                  );
                  if (selectedHistory === id) {
                    setSelectedHistory("");
                  }
                }}
                onDeleteAllHistory={handleDeleteAllHistory}
                onExportJSON={handleExportJSON}
              />
            </Flex>
          </Card>

          {/* 右侧卡片 */}
          <Card size="4" style={{ flex: 1 }} className="flex-1 w-full">
            <Flex direction="column" gap="4">
              {error && <Text color="red">{error}</Text>}
              <Box style={{ width: "100%" }}>
                <Flex direction="column" gap="3">
                  <UserInfo user={user} loading={loading} email={tempEmail} />
                  <Separator size="4" />
                  <AddressInfo address={address} loading={loading} />
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Flex>
        <InboxDialog
          open={inboxOpen}
          onOpenChange={setInboxOpen}
          email={tempEmail}
          messages={messages}
          onMessageClick={handleMessageClick}
          selectedMessage={selectedMessage}
        />
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            onClick={() => handleToastClick(toastMessage)}
          />
        )}
      </Flex>
    </Box>
  );
}
