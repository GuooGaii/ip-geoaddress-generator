"use client";

import { DataList, Text, Skeleton, IconButton, Flex } from "@radix-ui/themes";
import { Address } from "../types";
import { CopyStatus } from "./CopyStatus";

interface AddressInfoProps {
  address: Address | null;
  loading: boolean;
  copiedId: string;
  onCopy: (text: string, id: string) => void;
}

export function AddressInfo({
  address,
  loading,
  copiedId,
  onCopy,
}: Readonly<AddressInfoProps>) {
  if (loading) {
    return (
      <DataList.Root>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            街道
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            城市
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            州/省
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            邮编
          </DataList.Label>
          <DataList.Value>
            <Skeleton>
              <Text>Loading...</Text>
            </Skeleton>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            国家
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

  if (!address) return null;

  return (
    <DataList.Root>
      {address.road && (
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            街道
          </DataList.Label>
          <DataList.Value>
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy(address.road ?? "", "road")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>{address.road}</Text>
                <CopyStatus isCopied={copiedId === "road"} />
              </Flex>
            </IconButton>
          </DataList.Value>
        </DataList.Item>
      )}
      {address.city && (
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            城市
          </DataList.Label>
          <DataList.Value>
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy(address.city ?? "", "city")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>{address.city}</Text>
                <CopyStatus isCopied={copiedId === "city"} />
              </Flex>
            </IconButton>
          </DataList.Value>
        </DataList.Item>
      )}
      {address.state && (
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            州/省
          </DataList.Label>
          <DataList.Value>
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy(address.state ?? "", "state")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>{address.state}</Text>
                <CopyStatus isCopied={copiedId === "state"} />
              </Flex>
            </IconButton>
          </DataList.Value>
        </DataList.Item>
      )}
      {address.postcode && (
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            邮编
          </DataList.Label>
          <DataList.Value>
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy(address.postcode ?? "", "postcode")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>{address.postcode}</Text>
                <CopyStatus isCopied={copiedId === "postcode"} />
              </Flex>
            </IconButton>
          </DataList.Value>
        </DataList.Item>
      )}
      {address.country && (
        <DataList.Item>
          <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
            国家
          </DataList.Label>
          <DataList.Value>
            <IconButton
              size="3"
              aria-label="复制"
              color="gray"
              variant="ghost"
              className="group"
              onClick={() => onCopy(address.country ?? "", "country")}
            >
              <Flex align="center" gap="2">
                <Text highContrast>{address.country}</Text>
                <CopyStatus isCopied={copiedId === "country"} />
              </Flex>
            </IconButton>
          </DataList.Value>
        </DataList.Item>
      )}
    </DataList.Root>
  );
}
