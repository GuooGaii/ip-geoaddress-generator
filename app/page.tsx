"use client";

import { useState, useRef } from "react";

import useIP from "@/hooks/useIP";
import useUser from "@/hooks/useUser";
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
import { ipSignal } from "@/signals/ipSignal";
import { addressSignal, coordinatesSignal } from "@/signals/addressSignal";

export default function Home() {
  const {
    isLoading: addressLoading,
    error: addressError,
    addressRefetch: fetchAddress,
  } = useAddress(ipSignal.value);
  const { isLoading: ipLoading, error: ipError } = useIP();
  const {
    isLoading: userLoading,
    error: userError,
    refetch: fetchUser,
  } = useUser("US");

  const [inputIp, setInputIp] = useState<string>("");
  const [inputMode, setInputMode] = useState<string>("ip");
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
  // 计算总的加载状态
  const isLoading =
    loading || emailLoading || addressLoading || ipLoading || userLoading;

  const hasAddedInitialHistory = useRef(false);

  // 使用 signal 的 effect 监听数据变化
  effect(() => {
    if (
      !hasAddedInitialHistory.current &&
      !ipLoading &&
      !userLoading &&
      !addressLoading &&
      ipSignal.value &&
      userSignal.value &&
      addressSignal.value
    ) {
      addHistoryRecord({
        user: userSignal.value,
        address: addressSignal.value,
        ip: ipSignal.value,
      });
      hasAddedInitialHistory.current = true;
    }
  });

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
          const coordinates = await addressService.getCoordinates(
            country,
            state,
            city
          );
          coordinatesSignal.value = coordinates;
          await fetchUser();
          await fetchAddress();
          if (userSignal.value && addressSignal.value && ipSignal.value) {
            addHistoryRecord({
              user: userSignal.value,
              address: addressSignal.value,
              ip: ipSignal.value,
            });
          }
        } catch (err) {
          setError("获取地址失败");
          console.error(err);
        }
        return;
      }

      // IP 模式下的处理
      const targetIp = inputIp || ipSignal.value;
      if (targetIp) {
        try {
          await fetchAddress();
          await fetchUser();
          if (userSignal.value && addressSignal.value && ipSignal.value) {
            addHistoryRecord({
              user: userSignal.value,
              address: addressSignal.value,
              ip: ipSignal.value,
            });
          }
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
        <Header ipLoading={ipLoading} ipError={ipError} ipSignal={ipSignal} />

        {userError && <Text color="red">用户信息暂不可用</Text>}

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
