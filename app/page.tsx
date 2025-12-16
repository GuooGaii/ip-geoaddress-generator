"use client";

import { useEffect, useRef, useState } from "react";

import useIP from "@/hooks/useIP";
import useUser from "@/hooks/useUser";
import useCoordinates from "@/hooks/useCoordinates";
import useAddress from "@/hooks/useAddress";
import useHistory from "@/hooks/useHistory";
import useMail from "@/hooks/useMail";

import type { HistoryRecord, TempMailMessage } from "@/app/types";

import { Text, Flex, Box } from "@radix-ui/themes";
import { InboxDialog } from "./components/InboxDialog";
import { TopBar } from "./components/TopBar";
import { Toast } from "./components/Toast";
import { Header } from "./components/Header";
import { LeftCard } from "./components/LeftCard";
import { RightCard } from "./components/RightCard";

import { effect } from "@preact/signals-react";
import { addressService } from "@/services/addressService";

import { userSignal } from "@/signals/userSignal";
import { detectedIpSignal, queryIpSignal } from "@/signals/ipSignal";
import { addressSignal, coordinatesSignal } from "@/signals/addressSignal";

export default function Home() {
  const queryIp = queryIpSignal.value;
  const {
    isLoading: coordinatesLoading,
    // error: coordinatesError,
    data: coordinates,
  } = useCoordinates(queryIp);
  const coordinatesForAddress =
    coordinatesLoading || !coordinates ? null : coordinates;
  const {
    isLoading: addressLoading,
    error: addressError,
    refetch: fetchAddress,
    data: addressData,
    dataUpdatedAt: addressUpdatedAt,
  } = useAddress(coordinatesForAddress);
  const { isLoading: ipLoading, error: ipError } = useIP();
  const {
    isLoading: userLoading,
    error: userError,
    refetch: fetchUser,
    data: userData,
    dataUpdatedAt: userUpdatedAt,
  } = useUser("US");
  const [inputIp, setInputIp] = useState<string>("");
  const [inputMode, setInputMode] = useState<string>("ip");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingIpGeneration, setPendingIpGeneration] = useState<{
    ip: string;
    requestedAt: number;
  } | null>(null);
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
  // 计算总的加载状态
  const isLoading =
    loading ||
    emailLoading ||
    addressLoading ||
    ipLoading ||
    userLoading ||
    coordinatesLoading;

  const hasAddedInitialHistory = useRef(false);

  // 使用 signal 的 effect 监听数据变化
  effect(() => {
    if (
      !hasAddedInitialHistory.current &&
      !ipLoading &&
      !userLoading &&
      !addressLoading &&
      detectedIpSignal.value &&
      userSignal.value &&
      addressSignal.value
    ) {
      addHistoryRecord({
        user: userSignal.value,
        address: addressSignal.value,
        ip: detectedIpSignal.value,
      });
      hasAddedInitialHistory.current = true;
    }
  });

  useEffect(() => {
    if (!pendingIpGeneration) return;
    if (inputMode !== "ip") return;
    if (coordinatesLoading || addressLoading || userLoading) return;
    if (!addressData || !userData) return;
    if (addressUpdatedAt < pendingIpGeneration.requestedAt) return;
    if (userUpdatedAt < pendingIpGeneration.requestedAt) return;

    addHistoryRecord({
      user: userData,
      address: addressData,
      ip: pendingIpGeneration.ip,
    });
    setPendingIpGeneration(null);
  }, [
    pendingIpGeneration,
    inputMode,
    coordinatesLoading,
    addressLoading,
    userLoading,
    addressData,
    userData,
    addressUpdatedAt,
    userUpdatedAt,
    addHistoryRecord,
  ]);

  const handleGenerateAddress = async () => {
    setLoading(true);
    setError("");
    try {
      if (inputMode === "address") {
        if (!inputIp) {
          setError("请选择地址");
          return;
        }
        const [country, state, city] = inputIp.split("|");
        try {
          const coordinates = await addressService.getCoordinates(
            country,
            state,
            city
          );
          coordinatesSignal.value = coordinates;
          await fetchUser();
          await fetchAddress();
          if (userSignal.value && addressSignal.value && detectedIpSignal.value) {
            addHistoryRecord({
              user: userSignal.value,
              address: addressSignal.value,
              ip: detectedIpSignal.value,
            });
          }
        } catch (err) {
          setError("获取地址失败");
          console.error(err);
        }
        return;
      }

      // IP 模式下的处理
      const targetIp = inputIp || detectedIpSignal.value;
      if (!targetIp) {
        setError("请输入IP");
        return;
      }

      queryIpSignal.value = targetIp;
      setPendingIpGeneration({ ip: targetIp, requestedAt: Date.now() });

      try {
        await fetchUser();
      } catch (err) {
        setError("获取用户信息失败");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (record: HistoryRecord) => {
    setSelectedHistory(record.id);
    // 直接使用历史记录中的数据，不触发任何请求
    addressSignal.value = record.address;
    userSignal.value = record.user;
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
        <Header
          ipLoading={ipLoading}
          ipError={ipError}
          detectedIp={detectedIpSignal.value}
        />

        {userError && <Text color="red">获取用户信息失败</Text>}

        <Flex
          gap="4"
          style={{ width: "100%", maxWidth: "900px" }}
          className="flex flex-col md:flex-row"
        >
          {/* 左侧卡片 */}
          <LeftCard
            inputIp={inputIp}
            inputMode={inputMode}
            isLoading={isLoading}
            history={history}
            selectedHistory={selectedHistory}
            setInputIp={setInputIp}
            setInputMode={setInputMode}
            handleGenerateAddress={handleGenerateAddress}
            onHistoryClick={handleHistoryClick}
            onDeleteRecord={deleteHistoryRecord}
            onDeleteAll={deleteAllHistory}
            onToggleStarred={toggleStarred}
          />

          {/* 右侧卡片 */}
          <RightCard
            userSignal={userSignal}
            addressSignal={addressSignal}
            isLoading={isLoading}
            error={error}
            addressError={addressError}
            tempEmail={tempEmail}
          />
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
