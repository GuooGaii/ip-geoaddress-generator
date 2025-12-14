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
  const isLoading =
    loading || emailLoading || addressLoading || ipLoading || userLoading;

  const hasAddedInitialHistory = useRef(false);

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
    addressSignal.value = record.address;
    userSignal.value = record.user;
  };

  const handleToastClick = (message: TempMailMessage) => {
    setInboxOpen(true);
    setSelectedMessage(message);
  };

  const getRiskColor = (score: number | undefined): "gray" | "green" | "yellow" | "orange" | "red" => {
    if (score === undefined) return "gray";
    if (score <= 25) return "green";
    if (score <= 50) return "yellow";
    if (score <= 75) return "orange";
    return "red";
  };

  const getRiskLevel = (score: number | undefined): string => {
    if (score === undefined) return "未知";
    if (score <= 25) return "低风险";
    if (score <= 50) return "中等风险";
    if (score <= 75) return "较高风险";
    return "高风险";
  };

  // 类型安全的取值函数
  const q = qualitySignal.value;
  const getNum = (val: unknown): number | undefined => typeof val === "number" ? val : undefined;
  const getStr = (val: unknown): string => (val !== null && val !== undefined) ? String(val) : "N/A";
  const getBool = (val: unknown): boolean => Boolean(val);

  return (
    <Box>
      <TopBar onInboxOpen={() => setInboxOpen(true)} />

      <Flex
        className="min-h-screen"
        direction="column"
        align="center"
        justify="center"
        gap="4"
        style={{
          backgroundImage: "var(--background-image)",
          backgroundSize: "var(--background-size)",
          paddingTop: "60px",
        }}
      >
        <Header ipLoading={ipLoading} ipError={ipError} ipSignal={ipSignal} />

        {userError && <Text color="red">用户信息暂不可用</Text>}

        <Flex
          gap="4"
          style={{ width: "100%", maxWidth: "900px" }}
          className="flex flex-col md:flex-row"
        >
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
          ) : q ? (
            <Flex direction="column" gap="4">
              {/* 风险评分概览 */}
              <Flex gap="4" wrap="wrap">
                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="1">欺诈评分 (Fraud Score)</Text>
                  <Flex align="center" gap="2">
                    <Text size="5" weight="bold">
                      {getStr(q.fraudScore)}
                    </Text>
                    {getNum(q.fraudScore) !== undefined && (
                      <Badge color={getRiskColor(getNum(q.fraudScore))}>
                        {getRiskLevel(getNum(q.fraudScore))}
                      </Badge>
                    )}
                  </Flex>
                  {getNum(q.fraudScore) !== undefined && (
                    <Progress 
                      value={getNum(q.fraudScore)} 
                      max={100}
                      color={getRiskColor(getNum(q.fraudScore))}
                      style={{ marginTop: "8px" }}
                    />
                  )}
                </Box>

                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="1">滥用评分 (Abuse Score)</Text>
                  <Flex align="center" gap="2">
                    <Text size="5" weight="bold">
                      {getStr(q.abuseScore)}
                    </Text>
                    {getNum(q.abuseScore) !== undefined && (
                      <Badge color={getRiskColor(getNum(q.abuseScore))}>
                        {getRiskLevel(getNum(q.abuseScore))}
                      </Badge>
                    )}
                  </Flex>
                  {getNum(q.abuseScore) !== undefined && (
                    <Progress 
                      value={getNum(q.abuseScore)} 
                      max={100}
                      color={getRiskColor(getNum(q.abuseScore))}
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
                    {getStr(q.ipType) || "未知"}
                  </Badge>
                </Box>

                <Box style={{ flex: "1", minWidth: "200px" }}>
                  <Text size="2" color="gray" mb="2">网络信息</Text>
                  <Flex direction="column" gap="1">
                    <Text size="2">{`ISP: ${getStr(q.isp)}`}</Text>
                    <Text size="2">{`ASN: ${getStr(q.asn || q.ASN)}`}</Text>
                  </Flex>
                </Box>
              </Flex>

              {/* 威胁标记 */}
              <Box>
                <Text size="2" color="gray" mb="2">威胁标记</Text>
                <Flex gap="2" wrap="wrap">
                  <Badge color={q.isVpn === true ? "red" : "green"}>
                    {`VPN: ${q.isVpn === true ? "是" : "否"}`}
                  </Badge>
                  <Badge color={q.isProxy === true ? "red" : "green"}>
                    {`代理: ${q.isProxy === true ? "是" : "否"}`}
                  </Badge>
                  <Badge color={q.isTor === true ? "red" : "green"}>
                    {`Tor: ${q.isTor === true ? "是" : "否"}`}
                  </Badge>
                  <Badge color={q.isHosting === true ? "orange" : "green"}>
                    {`托管/数据中心: ${q.isHosting === true ? "是" : "否"}`}
                  </Badge>
                </Flex>
              </Box>

              {/* 原生 IP 检测 */}
              <Flex gap="4" wrap="wrap">
                <Box>
                  <Text size="2" color="gray" mb="2">原生 IP</Text>
                  <Badge color={q.isNative === true ? "green" : "orange"}>
                    {q.isNative === true ? "是 (原生)" : "否 (广播)"}
                  </Badge>
                </Box>

                <Box>
                  <Text size="2" color="gray" mb="2">双 ISP</Text>
                  <Badge color={q.isDualIsp === true ? "orange" : "green"}>
                    {q.isDualIsp === true ? "是" : "否"}
                  </Badge>
                </Box>
              </Flex>

              {/* Cloudflare ASN Bot 检测 */}
              {(getNum(q.cf_asn_bot_pct) !== undefined || getNum(q.cf_asn_human_pct) !== undefined) && (
                <Box>
                  <Text size="2" color="gray" mb="2">Cloudflare ASN 流量分析</Text>
                  <Flex gap="3" align="center">
                    <Text size="2">
                      {`Bot 流量: ${getNum(q.cf_asn_bot_pct)?.toFixed(1) ?? "N/A"}%`}
                    </Text>
                    <Text size="2">
                      {`人类流量: ${getNum(q.cf_asn_human_pct)?.toFixed(1) ?? "N/A"}%`}
                    </Text>
                    {q.cf_asn_likely_bot === true && (
                      <Badge color="red">高风险 ASN</Badge>
                    )}
                  </Flex>
                </Box>
              )}

              {/* 数据来源 */}
              {q.sources && Array.isArray(q.sources) && q.sources.length > 0 && (
                <Box>
                  <Text size="2" color="gray" mb="2">数据来源</Text>
                  <Flex gap="1" wrap="wrap">
                    {(q.sources as string[]).map((source) => (
                      <Badge key={source} variant="outline" color="gray">
                        {source}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              )}

              {/* AI 分析报告 */}
              {q.aiReasoning && (
                <Box>
                  <Text size="2" color="gray" mb="2">AI 分析报告</Text>
                  <Card style={{ backgroundColor: "var(--gray-2)", padding: "12px" }}>
                    <Text size="2" style={{ whiteSpace: "pre-wrap" }}>
                      {String(q.aiReasoning)}
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