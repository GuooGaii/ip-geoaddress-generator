import { IconButton, Flex } from "@radix-ui/themes";
import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { ThemeChanger } from "./ThemeChanger";

const ICON_SIZE = 24;

interface TopBarProps {
  onInboxOpen: () => void;
}

export function TopBar({ onInboxOpen }: TopBarProps) {
  return (
    <Flex
      justify="end"
      align="center"
      px="6"
      py="4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Flex gap="6" align="center">
        <IconButton
          size="4"
          variant="ghost"
          aria-label="收信箱"
          onClick={onInboxOpen}
        >
          <EnvelopeClosedIcon width={ICON_SIZE} height={ICON_SIZE} />
        </IconButton>
        <IconButton
          size="4"
          variant="ghost"
          aria-label="GitHub"
          onClick={() =>
            window.open(
              "https://github.com/GuooGaii/ip-geoaddress-generator",
              "_blank"
            )
          }
        >
          <GitHubLogoIcon width={ICON_SIZE} height={ICON_SIZE} />
        </IconButton>
        <ThemeChanger iconSize={ICON_SIZE} />
      </Flex>
    </Flex>
  );
}
