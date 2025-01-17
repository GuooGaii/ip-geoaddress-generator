"use client";

import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

interface CopyStatusProps {
  isCopied: boolean;
}

export function CopyStatus({ isCopied }: Readonly<CopyStatusProps>) {
  return (
    <span className="relative inline-flex">
      <span
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isCopied ? "opacity-100" : "opacity-0"
        }`}
      >
        <CheckIcon className="text-green-500" />
      </span>
      <span
        className={`transition-opacity duration-300 ease-in-out ${
          isCopied ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <CopyIcon />
      </span>
    </span>
  );
}
