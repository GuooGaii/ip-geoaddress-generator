"use client";

import { useEffect, useState } from "react";
import { Card, Flex, Text, IconButton } from "@radix-ui/themes";
import { EnvelopeClosedIcon, Cross2Icon } from "@radix-ui/react-icons";
import { TempMailMessage } from "../types";

interface ToastProps {
  message: TempMailMessage;
  onClose: () => void;
  onClick: () => void;
  duration?: number;
}

export function Toast({
  message,
  onClose,
  onClick,
  duration = 5000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待动画结束后再关闭
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <Card
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        width: "360px",
        cursor: "pointer",
        zIndex: 1000,
        animation: "slideIn 0.3s ease-out",
      }}
      className="hover:brightness-95 transition-all"
    >
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <Flex gap="3" align="center" p="2">
        <EnvelopeClosedIcon width="16" height="16" />
        <Flex direction="column" gap="1" style={{ flex: 1 }}>
          <Text weight="medium">{message.subject || "新邮件"}</Text>
          <Text size="1" color="gray">
            来自: {message.from.name} ({message.from.address})
          </Text>
        </Flex>
        <IconButton
          size="1"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <Cross2Icon />
        </IconButton>
      </Flex>
    </Card>
  );
}
