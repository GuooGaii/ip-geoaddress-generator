"use client";

import { DataList, Text, Skeleton, IconButton, Flex } from "@radix-ui/themes";
import { CopyStatus } from "./CopyStatus";
import { ReactNode } from "react";

interface InfoItemProps {
  label: string;
  value?: string;
  id: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string;
  loading?: boolean;
  extraIcon?: ReactNode;
  textSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export const InfoItem = ({
  label,
  value,
  id,
  onCopy,
  copiedId,
  loading,
  extraIcon,
  textSize = "2",
}: InfoItemProps) => {
  const labelContent = (
    <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
      <Flex align="center" gap="2">
        <Text size={textSize}>{label}</Text>
        {extraIcon}
      </Flex>
    </DataList.Label>
  );

  if (loading) {
    return (
      <DataList.Item>
        {labelContent}
        <DataList.Value>
          <Skeleton>
            <Text>Loading...</Text>
          </Skeleton>
        </DataList.Value>
      </DataList.Item>
    );
  }

  if (!value) return null;

  return (
    <DataList.Item>
      {labelContent}
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
};
