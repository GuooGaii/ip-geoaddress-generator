"use client";

import { useState, useEffect } from "react";
import WFDService from "./services/addressService";
import useIP from "@/hooks/useIP";
import useUser from "@/hooks/useUser";
import useAddress from "@/hooks/useAddress";
import useHistory from "@/hooks/useHistory";
import useMail from "@/hooks/useMail";
import type { HistoryRecord, TempMailMessage } from "./types";
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
import { Toast } from "./components/Toast";

export default function Home() {
  const { ip, isLoading: ipLoading, error: ipError } = useIP();
  const {
    user,
    isLoading: userLoading,
    error: userError,
    fetchUser,
    setUser,
  } = useUser("US");
  const [inputIp, setInputIp] = useState<string>("");
  const [inputMode, setInputMode] = useState<string>("ip");
  const {
    address,
    setAddress,
    coordinates,
    setCoordinates,
    loading: addressLoading,
    error: addressError,
  } = useAddress(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    history,
    selectedHistory,
    setSelectedHistory,
    addHistoryRecord,
    deleteHistoryRecord,
    deleteAllHistory,
    toggleStarred,
  } = useHistory();
  const {
    tempEmail,
    emailLoading,
    messages,
    selectedMessage,
    toastMessage,
    setSelectedMessage,
    setToastMessage,
    handleMessageClick,
  } = useMail();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [shouldAddToHistory, setShouldAddToHistory] = useState(false);

  // 计算总的加载状态
  const isLoading =
    loading || emailLoading || addressLoading || ipLoading || userLoading;

  // 监听数据变化，添加到历史记录
  useEffect(() => {
    if (!shouldAddToHistory) return;
    if (coordinates && user && address && ip) {
      addHistoryRecord({ user, address, ip });
      setShouldAddToHistory(false);
    }
  }, [coordinates, user, address, ip, shouldAddToHistory]);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      if (!ip) return;
      setLoading(true);
      try {
        const service = new WFDService();
        const coords = await service.getIPCoordinates(ip);
        setCoordinates(coords);
        setShouldAddToHistory(true);
      } catch (err) {
        setError("获取地址失败");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [ip]);

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
          setCoordinates({
            latitude: Number(coords.lat),
            longitude: Number(coords.lon),
          });
          await fetchUser();
          setShouldAddToHistory(true);
        } catch (err) {
          setError("获取地址失败");
          console.error(err);
        }
        return;
      }

      // IP 模式下的处理
      const targetIp = inputIp || ip;
      if (targetIp) {
        try {
          const service = new WFDService();
          const coords = await service.getIPCoordinates(targetIp);
          setCoordinates(coords);
          await fetchUser();
          setShouldAddToHistory(true);
        } catch (err) {
          setError("获取地址失败");
          console.error(err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (record: HistoryRecord) => {
    setSelectedHistory(record.id);
    // 直接使用历史记录中的数据，不触发任何请求
    setAddress(record.address);
    setUser(record.user);
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
          {ipLoading ? (
            <Skeleton>
              <Code size="4">loading...</Code>
            </Skeleton>
          ) : ipError ? (
            <Text color="red">获取IP失败</Text>
          ) : (
            <Code size="4">{ip}</Code>
          )}
        </Flex>

        {userError && <Text color="red">获取用户信息失败</Text>}

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
                    disabled={isLoading}
                  >
                    <Text>{isLoading ? "生成中..." : "生成地址"}</Text>
                    <ReloadIcon className={isLoading ? "animate-spin" : ""} />
                  </Button>
                </Flex>
              </Box>
              <Separator size="4" />
              <HistoryList
                history={history}
                selectedHistory={selectedHistory}
                onHistoryClick={handleHistoryClick}
                onDeleteRecord={deleteHistoryRecord}
                onDeleteAll={deleteAllHistory}
                onToggleStarred={toggleStarred}
              />
            </Flex>
          </Card>

          {/* 右侧卡片 */}
          <Card size="4" style={{ flex: 1 }} className="flex-1 w-full">
            <Flex direction="column" gap="4">
              {(error || addressError) && (
                <Text color="red">{error || addressError}</Text>
              )}
              <Box style={{ width: "100%" }}>
                <Flex direction="column" gap="3">
                  <UserInfo user={user} loading={isLoading} email={tempEmail} />
                  <Separator size="4" />
                  <AddressInfo address={address} loading={isLoading} />
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
