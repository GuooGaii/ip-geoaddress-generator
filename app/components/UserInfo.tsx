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

interface UserField {
  id: string;
  label: string;
  getValue: (user: User, email: string) => string;
}

const UserLoadingItem = ({ label }: { label: string }) => (
  <DataList.Item>
    <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
      <Text size="2">{label}</Text>
    </DataList.Label>
    <DataList.Value>
      <Skeleton>
        <Text>Loading...</Text>
      </Skeleton>
    </DataList.Value>
  </DataList.Item>
);

const UserDataItem = ({
  label,
  value,
  id,
  onCopy,
  copiedId,
}: {
  label: string;
  value: string;
  id: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string;
}) => (
  <DataList.Item>
    <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
      <Text size="2">{label}</Text>
    </DataList.Label>
    <DataList.Value>
      <IconButton
        size="3"
        aria-label="复制"
        color="gray"
        variant="ghost"
        className="group"
        onClick={() => onCopy(value, id)}
      >
        <Flex align="center" gap="2">
          <Text highContrast>{value}</Text>
          <CopyStatus isCopied={copiedId === id} />
        </Flex>
      </IconButton>
    </DataList.Value>
  </DataList.Item>
);

export function UserInfo({
  user,
  loading,
  copiedId,
  onCopy,
  email,
}: Readonly<UserInfoProps>) {
  const userFields: UserField[] = [
    {
      id: "last",
      label: "姓",
      getValue: (user) => user.name.last,
    },
    {
      id: "first",
      label: "名",
      getValue: (user) => user.name.first,
    },
    {
      id: "phone",
      label: "电话",
      getValue: (user) => user.phone,
    },
    {
      id: "ssn",
      label: "SSN",
      getValue: (user) => user.id.value || "暂无",
    },
    {
      id: "email",
      label: "邮箱",
      getValue: (_, email) => email,
    },
  ];

  if (loading) {
    return (
      <DataList.Root>
        {userFields.map((field) => (
          <UserLoadingItem key={field.id} label={field.label} />
        ))}
      </DataList.Root>
    );
  }

  if (!user) return null;

  return (
    <DataList.Root>
      {userFields.map((field) => (
        <UserDataItem
          key={field.id}
          label={field.label}
          value={field.getValue(user, email)}
          id={field.id}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      ))}
    </DataList.Root>
  );
}
