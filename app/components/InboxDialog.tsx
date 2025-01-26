"use client";

import {
  Dialog,
  Text,
  Button,
  ScrollArea,
  Tabs,
  Box,
  Flex,
} from "@radix-ui/themes";
import { TempMailMessage } from "../types";

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
      <Dialog.Content style={{ maxWidth: 800, maxHeight: "80vh" }}>
        <Dialog.Title>临时邮箱</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          您的临时邮箱地址: {email}
        </Dialog.Description>

        <Flex gap="3" style={{ height: "60vh" }}>
          {/* 邮件列表 */}
          <ScrollArea
            style={{ width: "300px", borderRight: "1px solid var(--gray-6)" }}
          >
            <Flex direction="column" gap="2">
              {messages.length === 0 ? (
                <Text>暂无邮件</Text>
              ) : (
                messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    direction="column"
                    gap="1"
                    p="2"
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedMessage?.id === msg.id
                          ? "var(--gray-3)"
                          : undefined,
                      borderRadius: "var(--radius-2)",
                    }}
                    onClick={() => onMessageClick(msg)}
                  >
                    <Text weight="bold">{msg.subject || "无主题"}</Text>
                    <Text size="1" color="gray">
                      {msg.from.name} ({msg.from.address})
                    </Text>
                    <Text size="1" color="gray">
                      {new Date(msg.createdAt).toLocaleString()}
                    </Text>
                  </Flex>
                ))
              )}
            </Flex>
          </ScrollArea>

          {/* 邮件内容 */}
          <ScrollArea style={{ flex: 1 }}>
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
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedMessage.html.join("\n"),
                        }}
                      />
                    </Tabs.Content>
                  )}
                  {selectedMessage.text && (
                    <Tabs.Content value="text">
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                        }}
                      >
                        {selectedMessage.text}
                      </pre>
                    </Tabs.Content>
                  )}
                </Box>
              </Tabs.Root>
            ) : (
              <Text color="gray">选择一封邮件查看内容</Text>
            )}
          </ScrollArea>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              关闭
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
