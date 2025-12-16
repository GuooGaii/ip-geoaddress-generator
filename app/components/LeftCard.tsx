import {
  Card,
  Text,
  Flex,
  Box,
  TextField,
  Button,
  SegmentedControl,
  Separator,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AddressSelector } from "./AddressSelector";
import { HistoryList } from "./HistoryList";
import { HistoryRecord } from "../types";
import { detectedIpSignal } from "@/signals/ipSignal";

interface LeftCardProps {
  inputIp: string;
  inputMode: string;
  isLoading: boolean;
  history: HistoryRecord[];
  selectedHistory: string | null;
  setInputIp: (value: string) => void;
  setInputMode: (value: string) => void;
  handleGenerateAddress: () => Promise<void>;
  onHistoryClick: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteAll: () => void;
  onToggleStarred: (id: string) => void;
}

export const LeftCard = ({
  inputIp,
  inputMode,
  isLoading,
  history,
  selectedHistory,
  setInputIp,
  setInputMode,
  handleGenerateAddress,
  onHistoryClick,
  onDeleteRecord,
  onDeleteAll,
  onToggleStarred,
}: LeftCardProps) => {
  return (
    <Card size="4" style={{ flex: 2 }} className="hidden md:flex">
      <Flex direction="column" gap="3" style={{ flex: 1 }}>
        <Box>
          <Flex gap="3">
            <SegmentedControl.Root
              defaultValue="ip"
              onValueChange={(value) => {
                setInputMode(value);
                setInputIp("");
              }}
              size="2"
            >
              <SegmentedControl.Item value="ip">IP</SegmentedControl.Item>
              <SegmentedControl.Item value="address">
                地址
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            {inputMode === "address" ? (
              <Flex style={{ flex: 1 }}>
                <AddressSelector onSelect={setInputIp}>
                  <TextField.Root
                    size="2"
                    placeholder="请选择地址"
                    value={inputIp}
                    onChange={(e) => setInputIp(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </AddressSelector>
              </Flex>
            ) : (
              <TextField.Root
                size="2"
                placeholder={detectedIpSignal.value}
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                style={{ flex: 1 }}
              />
            )}
            <Button
              size="2"
              onClick={handleGenerateAddress}
              disabled={isLoading}
            >
              <Text>{isLoading ? "生成中..." : "生成地址"}</Text>
              <ReloadIcon className={isLoading ? "animate-spin" : ""} />
            </Button>
          </Flex>
        </Box>
        <Separator size="4" />
        <HistoryList
          history={history}
          selectedHistory={selectedHistory}
          onHistoryClick={onHistoryClick}
          onDeleteRecord={onDeleteRecord}
          onDeleteAll={onDeleteAll}
          onToggleStarred={onToggleStarred}
        />
      </Flex>
    </Card>
  );
};
