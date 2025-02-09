"use client";

import {
  Dialog,
  Text,
  Button,
  ScrollArea,
  Tabs,
  Box,
  Flex,
  Card,
  Badge,
  Heading,
} from "@radix-ui/themes";
import { TempMailMessage } from "../types";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";

interface InboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  messages: TempMailMessage[];
  onMessageClick: (msg: TempMailMessage) => void;
  selectedMessage: TempMailMessage | null;
}

export function InboxDialog({
  open,
  onOpenChange,
  email,
  messages,
  onMessageClick,
  selectedMessage,
}: Readonly<InboxDialogProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: 1000, height: "80vh", padding: "24px" }}
      >
        <Dialog.Title className="sr-only">收信箱</Dialog.Title>
        <Flex direction="column" style={{ height: "100%" }}>
          {/* 顶部区域 */}
          <Flex justify="between" align="center" mb="4">
            <Flex align="center" gap="6">
              <Flex align="center" gap="2">
                <Heading as="h3" mr="2">
                  收信箱
                </Heading>
                <EnvelopeClosedIcon width="24" height="24" />
                <Text size="2" color="gray">
                  ·
                </Text>
                <Text size="2" weight="medium">
                  {email}
                </Text>
                <Badge size="1" color="green" radius="full">
                  在线
                </Badge>
              </Flex>
            </Flex>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                关闭
              </Button>
            </Dialog.Close>
          </Flex>

          {/* 主要内容区域 */}
          <Flex gap="4" style={{ flex: 1, minHeight: 0 }}>
            {/* 邮件列表 */}
            <Card style={{ width: "320px" }}>
              <ScrollArea
                type="hover"
                scrollbars="vertical"
                style={{ height: "100%" }}
              >
                <Flex direction="column" gap="2" style={{ minHeight: "100%" }}>
                  {messages.length === 0 ? (
                    <Flex
                      align="center"
                      justify="center"
                      style={{ flex: 1, minHeight: "100%" }}
                    >
                      <Text color="gray">暂无邮件</Text>
                    </Flex>
                  ) : (
                    messages.map((msg) => (
                      <Card
                        key={msg.id}
                        variant="surface"
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedMessage?.id === msg.id
                              ? "var(--accent-3)"
                              : undefined,
                        }}
                        onClick={() => onMessageClick(msg)}
                      >
                        <Flex direction="column" gap="2" p="2">
                          <Flex justify="between" align="center" gap="2">
                            <Text
                              weight="bold"
                              size="2"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {msg.subject || "无主题"}
                            </Text>
                          </Flex>
                          <Text size="1" color="gray">
                            {msg.from.name} ({msg.from.address})
                          </Text>
                          <Text size="1" color="gray">
                            {new Date(msg.createdAt).toLocaleString()}
                          </Text>
                        </Flex>
                      </Card>
                    ))
                  )}
                </Flex>
              </ScrollArea>
            </Card>

            {/* 邮件内容 */}
            <Card style={{ flex: 1 }}>
              {selectedMessage ? (
                <Tabs.Root defaultValue="html">
                  <Tabs.List>
                    {selectedMessage.html?.length > 0 && (
                      <Tabs.Trigger value="html">HTML</Tabs.Trigger>
                    )}
                    {selectedMessage.text && (
                      <Tabs.Trigger value="text">文本</Tabs.Trigger>
                    )}
                  </Tabs.List>

                  <Box py="3">
                    {selectedMessage.html?.length > 0 && (
                      <Tabs.Content value="html">
                        <ScrollArea
                          type="hover"
                          scrollbars="vertical"
                          style={{ height: "calc(80vh - 180px)" }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedMessage.html.join("\n"),
                            }}
                          />
                        </ScrollArea>
                      </Tabs.Content>
                    )}
                    {selectedMessage.text && (
                      <Tabs.Content value="text">
                        <ScrollArea
                          type="hover"
                          scrollbars="vertical"
                          style={{ height: "calc(80vh - 180px)" }}
                        >
                          <pre
                            style={{
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                              margin: 0,
                              fontFamily: "var(--font-mono)",
                              fontSize: "14px",
                            }}
                          >
                            {selectedMessage.text}
                          </pre>
                        </ScrollArea>
                      </Tabs.Content>
                    )}
                  </Box>
                </Tabs.Root>
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  style={{ height: "100%" }}
                >
                  <Text color="gray">选择一封邮件查看内容</Text>
                </Flex>
              )}
            </Card>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
