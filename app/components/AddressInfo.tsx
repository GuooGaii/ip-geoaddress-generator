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

interface AddressField {
  id: keyof Address;
  label: string;
  value?: string;
}

const AddressLoadingItem = ({ label }: { label: string }) => (
  <DataList.Item>
    <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
      {label}
    </DataList.Label>
    <DataList.Value>
      <Skeleton>
        <Text>Loading...</Text>
      </Skeleton>
    </DataList.Value>
  </DataList.Item>
);

const AddressDataItem = ({
  label,
  value,
  id,
  onCopy,
  copiedId,
  showMap = false,
  mapUrl,
  address,
}: {
  label: string;
  value?: string;
  id: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string;
  showMap?: boolean;
  mapUrl?: string | null;
  address?: Address | null;
}) => {
  if (!value) return null;

  return (
    <DataList.Item>
      <DataList.Label minWidth="60px" style={{ marginLeft: "8px" }}>
        <Flex align="center" gap="2">
          {label}
          {showMap && mapUrl && address && (
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
                style={{
                  padding: "10px",
                  overflow: "hidden",
                  backgroundColor: "var(--gray-1)",
                  border: "1px solid var(--gray-6)",
                  borderRadius: "var(--radius-3)",
                  maxWidth: "500px",
                  width: "500px",
                }}
                align="start"
                side="top"
                sideOffset={5}
                avoidCollisions={true}
              >
                <Box
                  style={{
                    width: "100%",
                    height: "320px",
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: "var(--radius-3)",
                  }}
                  onClick={() => window.open(mapUrl, "_blank")}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      [
                        address.road,
                        address.city,
                        address.state,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    )}&output=embed&z=16`}
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

export function AddressInfo({
  address,
  loading,
  copiedId,
  onCopy,
}: Readonly<AddressInfoProps>) {
  const service = new WFDService();
  const mapUrl = address ? service.getGoogleMapUrl(address) : null;

  const addressFields: AddressField[] = [
    { id: "road", label: "街道" },
    { id: "city", label: "城市" },
    { id: "state", label: "州/省" },
    { id: "postcode", label: "邮编" },
    { id: "country", label: "国家" },
  ];

  if (loading) {
    return (
      <DataList.Root>
        {addressFields.map((field) => (
          <AddressLoadingItem key={field.id} label={field.label} />
        ))}
      </DataList.Root>
    );
  }

  if (!address) return null;

  return (
    <DataList.Root>
      {addressFields.map((field) => (
        <AddressDataItem
          key={field.id}
          label={field.label}
          value={address[field.id]?.toString()}
          id={field.id}
          onCopy={onCopy}
          copiedId={copiedId}
          showMap={field.id === "road"}
          mapUrl={mapUrl}
          address={address}
        />
      ))}
    </DataList.Root>
  );
}
