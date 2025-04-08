"use client";

import { IconButton, Flex } from "@radix-ui/themes";
import { CopyStatus } from "./CopyStatus";
import { ReactNode } from "react";

interface CopyWrapperProps {
  children: ReactNode;
  value: string;
  id: string;
  copiedId: string;
  onCopy: (text: string, id: string) => void;
}

export const CopyWrapper = ({
  children,
  value,
  id,
  copiedId,
  onCopy,
}: CopyWrapperProps) => {
  return (
    <IconButton
      size="3"
      aria-label="复制"
      color="gray"
      variant="ghost"
      className="group"
      onClick={() => onCopy(value, id)}
    >
      <Flex align="center" gap="2">
        {children}
        <CopyStatus isCopied={copiedId === id} />
      </Flex>
    </IconButton>
  );
};
