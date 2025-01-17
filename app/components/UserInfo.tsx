"use client";

import { DataList, Text, Skeleton, IconButton, Flex } from "@radix-ui/themes";
import { User } from "../types";
import { CopyStatus } from "./CopyStatus";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

interface UserInfoProps {
  user: User | null;
  loading: boolean;
  copiedId: string;
  onCopy: (text: string, id: string) => void;
}

export function UserInfo({
  user,
  loading,
  copiedId,
  onCopy,
}: Readonly<UserInfoProps>) {
  if (loading) {
    return (
      <DataList.Root>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            <Text size="2">姓</Text>
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            <Text size="2">名</Text>
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            <Text size="2">电话</Text>
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            <Text size="2">SSN</Text>
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            <Text size="2">邮箱</Text>
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    );
  }

  if (!user) return null;

  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
          <Text size="2">姓</Text>
        </DataList.Label>
        <DataList.Value>
          <IconButton
            size="3"
            aria-label="复制"
            color="gray"
            variant="ghost"
            className="group"
            onClick={() => onCopy(user.name.last, "last")}
          >
            <Flex align="center" gap="2">
              <Text highContrast>{user.name.last}</Text>
              <CopyStatus isCopied={copiedId === "last"} />
            </Flex>
          </IconButton>
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
          <Text size="2">名</Text>
        </DataList.Label>
        <DataList.Value>
          <IconButton
            size="3"
            aria-label="复制"
            color="gray"
            variant="ghost"
            className="group"
            onClick={() => onCopy(user.name.first, "first")}
          >
            <Flex align="center" gap="2">
              <Text highContrast>{user.name.first}</Text>
              <CopyStatus isCopied={copiedId === "first"} />
            </Flex>
          </IconButton>
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
          <Text size="2">电话</Text>
        </DataList.Label>
        <DataList.Value>
          <IconButton
            size="3"
            aria-label="复制"
            color="gray"
            variant="ghost"
            className="group"
            onClick={() => onCopy(user.phone, "phone")}
          >
            <Flex align="center" gap="2">
              <Text highContrast>{user.phone}</Text>
              <CopyStatus isCopied={copiedId === "phone"} />
            </Flex>
          </IconButton>
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
          <Text size="2">SSN</Text>
        </DataList.Label>
        <DataList.Value>
          <IconButton
            size="3"
            aria-label="复制"
            color="gray"
            variant="ghost"
            className="group"
            onClick={() => onCopy(user.id.value || "暂无", "ssn")}
          >
            <Flex align="center" gap="2">
              <Text highContrast>{user.id.value || "暂无"}</Text>
              <CopyStatus isCopied={copiedId === "ssn"} />
            </Flex>
          </IconButton>
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
          <Text size="2">邮箱</Text>
        </DataList.Label>
        <DataList.Value>
          <Flex align="center" gap="3">
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy("123@mail.com", "email")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>123@mail.com</Text>
                <CopyStatus isCopied={copiedId === "email"} />
              </Flex>
            </IconButton>
            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={() => window.open("mailto:123@mail.com")}
            >
              <ExternalLinkIcon width="16" height="16" />
            </IconButton>
          </Flex>
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
