import {
  Text,
  Box,
  IconButton,
  Separator,
  ScrollArea,
  Badge,
  Button,
  Flex,
} from "@radix-ui/themes";
import {
  TrashIcon,
  DownloadIcon,
  StarIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import type { HistoryRecord } from "../types";
import WFDService from "../services/addressService";

interface HistoryListProps {
  history: HistoryRecord[];
  selectedHistory: string;
  onHistoryClick: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteAll: () => void;
  onToggleStarred: (id: string) => void;
}

export function HistoryList({
  history,
  selectedHistory,
  onHistoryClick,
  onDeleteRecord,
  onDeleteAll,
  onToggleStarred,
}: Readonly<HistoryListProps>) {
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRecord(id);
  };

  const handleToggleStarred = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStarred(id);
  };

  const handleExportJSON = () => {
    const service = new WFDService();
    const blob = service.exportHistory(history);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = service.getExportFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <Flex direction="column" style={{ position: "absolute", inset: 0 }}>
        <Text size="2" mb="2" color="gray">
          历史记录
        </Text>
        <ScrollArea type="hover" scrollbars="vertical" style={{ flex: 1 }}>
          <Flex direction="column" gap="2" pr="3">
            {history.length === 0 ? (
              <Box
                style={{
                  minHeight: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="2" color="gray" align="center">
                  当前没有任何生成的信息
                </Text>
              </Box>
            ) : (
              history.map((record) => (
                <Box
                  key={record.id}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor:
                      selectedHistory === record.id
                        ? "var(--gray-a6)"
                        : undefined,
                  }}
                  className="hover:bg-[var(--gray-a4)]"
                  onClick={() => onHistoryClick(record)}
                >
                  <Flex align="center" justify="between" gap="3">
                    <Flex
                      align="center"
                      gap="2"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Text
                        size="2"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.user.name.last} {record.user.name.first}
                      </Text>
                      <Badge size="1" variant="soft" color="gray">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </Badge>
                    </Flex>
                    <IconButton
                      size="1"
                      color="amber"
                      variant="ghost"
                      onClick={(e) => handleToggleStarred(record.id, e)}
                    >
                      {record.isStarred ? <StarFilledIcon /> : <StarIcon />}
                    </IconButton>
                    <IconButton
                      size="1"
                      color="red"
                      variant="ghost"
                      onClick={(e) => handleDeleteHistory(record.id, e)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Flex>
                </Box>
              ))
            )}
          </Flex>
        </ScrollArea>
        {history.length > 0 && (
          <>
            <Separator size="4" my="3" />
            <Flex justify="between" gap="3">
              <Button size="2" variant="soft" onClick={handleExportJSON}>
                <Text>导出JSON</Text>
                <DownloadIcon />
              </Button>
              <Button size="2" color="red" variant="soft" onClick={onDeleteAll}>
                <Text>删除全部</Text>
                <TrashIcon />
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
}
