"use client";

import { useState, useRef } from "react";

import useIP from "@/hooks/useIP";
import useUser from "@/hooks/useUser";
import useAddress from "@/hooks/useAddress";
import useHistory from "@/hooks/useHistory";
import useMail from "@/hooks/useMail";

import type { HistoryRecord, TempMailMessage } from "@/app/types";

import { Text, Flex, Box, Card, Heading, Badge, Progress } from "@radix-ui/themes";
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
import { qualitySignal } from "@/signals/qualitySignal";

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

  // 获取风险等级颜色
  const getRiskColor = (score: number | undefined) => {
    if (score === undefined) return "gray";
    if (score <= 25) return "green";
    if (score <= 50) return "yellow";
    if (score <= 75) return "orange";
    return "red";
  };

  // 获取风险等级文字
  const getRiskLevel = (score: number | undefined) => {
    if (score === undefined) return "未知";
    if (score <= 25) return "低风险";
    if (score <= 50) return "中等风险";
    if (score <= 75) return "较高风险";
    return "高风险";
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

        {/* IP 质量检测面板 */}
        <Card style={{ width: "100%", maxWidth: "900px", padding: "20px" }}>
          <Heading size="4" mb="4">IP 质量检测</Heading>
          
          {isLoading ? (
            <Flex align="center" justify="center" py="6">
              <Text color="gray">正在检测...</Text>
            </Flex>
          ) : qualitySignal.value ? (
            <Flex direction="column" gap="4">
              {/* 风险评分概览 */}
              <Flex gap="4" wrap="wrap">
                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="1">欺诈评分 (Fraud Score)</Text>
                  <Flex align="center" gap="2">
                    <Text size="5" weight="bold">
                      {qualitySignal.value.fraudScore ?? "N/A"}
                    </Text>
                    {qualitySignal.value.fraudScore !== undefined && (
                      <Badge color={getRiskColor(qualitySignal.value.fraudScore as number)}>
                        {getRiskLevel(qualitySignal.value.fraudScore as number)}
                      </Badge>
                    )}
                  </Flex>
                  {qualitySignal.value.fraudScore !== undefined && (
                    <Progress 
                      value={qualitySignal.value.fraudScore as number} 
                      max={100}
                      color={getRiskColor(qualitySignal.value.fraudScore as number)}
                      style={{ marginTop: "8px" }}
                    />
                  )}
                </Box>

                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="1">滥用评分 (Abuse Score)</Text>
                  <Flex align="center" gap="2">
                    <Text size="5" weight="bold">
                      {qualitySignal.value.abuseScore ?? "N/A"}
                    </Text>
                    {qualitySignal.value.abuseScore !== undefined && (
                      <Badge color={getRiskColor(qualitySignal.value.abuseScore as number)}>
                        {getRiskLevel(qualitySignal.value.abuseScore as number)}
                      </Badge>
                    )}
                  </Flex>
                  {qualitySignal.value.abuseScore !== undefined && (
                    <Progress 
                      value={qualitySignal.value.abuseScore as number} 
                      max={100}
                      color={getRiskColor(qualitySignal.value.abuseScore as number)}
                      style={{ marginTop: "8px" }}
                    />
                  )}
                </Box>
              </Flex>

              {/* IP 类型和网络信息 */}
              <Flex gap="4" wrap="wrap">
                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="2">IP 类型</Text>
                  <Badge size="2" color="blue">
                    {qualitySignal.value.ipType || "未知"}
                  </Badge>
                </Box>

                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="2">网络信息</Text>
                  <Flex direction="column" gap="1">
                    <Text size="2">ISP: {qualitySignal.value.isp || "N/A"}</Text>
                    <Text size="2">ASN: {qualitySignal.value.asn || qualitySignal.value.ASN || "N/A"}</Text>
                  </Flex>
                </Box>
              </Flex>

              {/* 威胁标记 */}
              <Box>
                <Text size="2" color="gray" mb="2">威胁标记</Text>
                <Flex gap="2" wrap="wrap">
                  <Badge color={qualitySignal.value.isVpn ? "red" : "green"}>
                    VPN: {qualitySignal.value.isVpn ? "是" : "否"}
                  </Badge>
                  <Badge color={qualitySignal.value.isProxy ? "red" : "green"}>
                    代理: {qualitySignal.value.isProxy ? "是" : "否"}
                  </Badge>
                  <Badge color={qualitySignal.value.isTor ? "red" : "green"}>
                    Tor: {qualitySignal.value.isTor ? "是" : "否"}
                  </Badge>
                  <Badge color={qualitySignal.value.isHosting ? "orange" : "green"}>
                    托管/数据中心: {qualitySignal.value.isHosting ? "是" : "否"}
                  </Badge>
                </Flex>
              </Box>

              {/* 原生 IP 检测 */}
              <Flex gap="4" wrap="wrap">
                <Box>
                  <Text size="2" color="gray" mb="2">原生 IP</Text>
                  <Badge color={qualitySignal.value.isNative ? "green" : "orange"}>
                    {qualitySignal.value.isNative ? "是 (原生)" : "否 (广播)"}
                  </Badge>
                </Box>

                <Box>
                  <Text size="2" color="gray" mb="2">双 ISP</Text>
                  <Badge color={qualitySignal.value.isDualIsp ? "orange" : "green"}>
                    {qualitySignal.value.isDualIsp ? "是" : "否"}
                  </Badge>
                </Box>
              </Flex>

              {/* Cloudflare ASN Bot 检测 */}
              {(qualitySignal.value.cf_asn_bot_pct !== undefined || qualitySignal.value.cf_asn_human_pct !== undefined) && (
                <Box>
                  <Text size="2" color="gray" mb="2">Cloudflare ASN 流量分析</Text>
                  <Flex gap="3" align="center">
                    <Text size="2">
                      Bot 流量: {qualitySignal.value.cf_asn_bot_pct?.toFixed(1) ?? "N/A"}%
                    </Text>
                    <Text size="2">
                      人类流量: {qualitySignal.value.cf_asn_human_pct?.toFixed(1) ?? "N/A"}%
                    </Text>
                    {qualitySignal.value.cf_asn_likely_bot && (
                      <Badge color="red">高风险 ASN</Badge>
                    )}
                  </Flex>
                </Box>
              )}

              {/* 数据来源 */}
              {qualitySignal.value.sources && qualitySignal.value.sources.length > 0 && (
                <Box>
                  <Text size="2" color="gray" mb="2">数据来源</Text>
                  <Flex gap="1" wrap="wrap">
                    {qualitySignal.value.sources.map((source: string) => (
                      <Badge key={source} variant="outline" color="gray">
                        {source}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              )}

              {/* AI 分析报告 */}
              {qualitySignal.value.aiReasoning && (
                <Box>
                  <Text size="2" color="gray" mb="2">AI 分析报告</Text>
                  <Card style={{ backgroundColor: "var(--gray-2)", padding: "12px" }}>
                    <Text size="2" style={{ whiteSpace: "pre-wrap" }}>
                      {qualitySignal.value.aiReasoning}
                    </Text>
                  </Card>
                </Box>
              )}
            </Flex>
          ) : (
            <Flex align="center" justify="center" py="6">
              <Text color="gray">暂无 IP 质量数据</Text>
            </Flex>
          )}
        </Card>

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