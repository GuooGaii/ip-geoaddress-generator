"use client";

import { DataList, Text, Skeleton, Flex } from "@radix-ui/themes";
import { ReactNode } from "react";
import { CopyWrapper } from "./CopyWrapper";

interface InfoItemProps {
  label: string;
  value?: string;
  loading?: boolean;
  extraIcon?: ReactNode;
  textSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export const InfoItem = ({
  label,
  value,
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
        <CopyWrapper value={value}>
          <Text highContrast>{value}</Text>
        </CopyWrapper>
      </DataList.Value>
    </DataList.Item>
  );
};
