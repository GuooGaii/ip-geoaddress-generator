"use client";

import {
  DataList,
  Text,
  Skeleton,
  IconButton,
  Flex,
  HoverCard,
  Box,
} from "@radix-ui/themes";
import { Address } from "../types";
import { CopyStatus } from "./CopyStatus";
import { GlobeIcon } from "@radix-ui/react-icons";
import { WFDService } from "../services/addressService";

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
  const service = new WFDService();
  const mapUrl =
    address?.latitude && address?.longitude
      ? service.getGoogleMapUrl(address.latitude, address.longitude)
      : null;

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
            <Flex align="center" gap="2">
              街道
              {mapUrl && address.latitude && address.longitude && (
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <IconButton
                      size="1"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => window.open(mapUrl, "_blank")}
                    >
                      <GlobeIcon />
                    </IconButton>
                  </HoverCard.Trigger>
                  <HoverCard.Content
                    style={{ padding: 0 }}
                    align="center"
                    side="top"
                    sideOffset={5}
                  >
                    <Box
                      style={{
                        width: "500px",
                        height: "300px",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(mapUrl, "_blank")}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                          address.longitude - 0.02
                        }%2C${address.latitude - 0.02}%2C${
                          address.longitude + 0.02
                        }%2C${address.latitude + 0.02}&layer=mapnik&marker=${
                          address.latitude
                        }%2C${address.longitude}`}
                      />
                    </Box>
                  </HoverCard.Content>
                </HoverCard.Root>
              )}
            </Flex>
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
