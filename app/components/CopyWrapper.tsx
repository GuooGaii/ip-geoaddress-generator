"use client";

import { IconButton, Flex } from "@radix-ui/themes";
import { CopyStatus } from "./CopyStatus";
import { ReactNode, useState } from "react";

interface CopyWrapperProps {
  children: ReactNode;
  value: string;
}

export const CopyWrapper = ({ children, value }: CopyWrapperProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <IconButton
      size="3"
      aria-label="复制"
      color="gray"
      variant="ghost"
      className="group"
      onClick={handleCopy}
    >
      <Flex align="center" gap="2">
        {children}
        <CopyStatus isCopied={isCopied} />
      </Flex>
    </IconButton>
  );
};
