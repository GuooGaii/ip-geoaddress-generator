import { useState, useEffect } from "react";
import { Box, Flex, Select, Button } from "@radix-ui/themes";
import * as Popover from "@radix-ui/react-popover";
import styles from "./AddressSelector.module.css";

type RegionData = {
  [country: string]: {
    [state: string]: string[];
  };
};

interface AddressSelectorProps {
  children: React.ReactNode;
  onSelect: (address: string) => void;
}

export function AddressSelector({
  children,
  onSelect,
}: Readonly<AddressSelectorProps>) {
  const [country, setCountry] = useState<string>("United States");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [regionData, setRegionData] = useState<RegionData>({
    "United States": {}, // 提供初始值
  });
  const [isLoading, setIsLoading] = useState(true);

  // 加载地理数据
  useEffect(() => {
    const loadRegionData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/data/regionData.json");
        const data = await response.json();
        setRegionData(data);
      } catch (error) {
        console.error("加载地理数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRegionData();
  }, []);

  useEffect(() => {
    setState("");
    setCity("");
  }, [country]);

  useEffect(() => {
    setCity("");
  }, [state]);

  const handleConfirm = () => {
    if (country && state && city) {
      onSelect(`${country}|${state}|${city}`);
      setOpen(false);
    }
  };

  // 延迟关闭 Popover，以便在移出时有时间移动到 Popover 内容上
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!hover) {
      timer = setTimeout(() => {
        setOpen(false);
      }, 200);
    } else {
      setOpen(true);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [hover]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Box
          style={{ flex: 1 }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {children}
        </Box>
      </Popover.Trigger>
      <Popover.Content
        align="center"
        sideOffset={4}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={styles.popoverContent}
      >
        <Box p="3">
          <Flex direction="column" gap="3">
            <Select.Root
              value={country}
              onValueChange={setCountry}
              defaultValue="United States"
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="United States">United States</Select.Item>
              </Select.Content>
            </Select.Root>

            <Select.Root value={state} onValueChange={setState}>
              <Select.Trigger
                placeholder={isLoading ? "加载中..." : "选择州"}
              />
              <Select.Content>
                {country &&
                  regionData[country] &&
                  Object.keys(regionData[country] || {})
                    .sort((a, b) => a.localeCompare(b))
                    .map((stateName) => (
                      <Select.Item key={stateName} value={stateName}>
                        {stateName}
                      </Select.Item>
                    ))}
              </Select.Content>
            </Select.Root>

            <Select.Root value={city} onValueChange={setCity}>
              <Select.Trigger
                placeholder={isLoading ? "加载中..." : "选择城市"}
              />
              <Select.Content>
                {country &&
                  state &&
                  [...(regionData[country]?.[state] || [])]
                    .sort((a, b) => a.localeCompare(b))
                    .map((cityName, index) => (
                      <Select.Item
                        key={`${state}-${cityName}-${index}`}
                        value={cityName}
                      >
                        {cityName}
                      </Select.Item>
                    ))}
              </Select.Content>
            </Select.Root>

            <Button
              onClick={handleConfirm}
              disabled={!country || !state || !city || isLoading}
            >
              {isLoading ? "加载中..." : "确认"}
            </Button>
          </Flex>
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
}
