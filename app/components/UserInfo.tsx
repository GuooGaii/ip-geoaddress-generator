"use client";

import { DataList, Text, Skeleton, IconButton, Flex } from "@radix-ui/themes";
import { User } from "../types";
import { CopyStatus } from "./CopyStatus";

interface UserInfoProps {
  user: User | null;
  loading: boolean;
  copiedId: string;
  onCopy: (text: string, id: string) => void;
  email: string;
}

export function UserInfo({
  user,
  loading,
  copiedId,
  onCopy,
  email,
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
          <IconButton
            size="3"
            aria-label="复制"
            color="gray"
            variant="ghost"
            className="group"
            onClick={() => onCopy(email, "email")}
          >
            <Flex align="center" gap="2">
              <Text highContrast>{email}</Text>
              <CopyStatus isCopied={copiedId === "email"} />
            </Flex>
          </IconButton>
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
