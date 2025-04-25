import { Heading, Flex, Text, Code, Skeleton } from "@radix-ui/themes";
import { Signal } from "@preact/signals-react";

interface HeaderProps {
  ipLoading: boolean;
  ipError: Error | null;
  ipSignal: Signal<string>;
}

export const Header = ({ ipLoading, ipError, ipSignal }: HeaderProps) => {
  return (
    <>
      <Heading size="8">真实地址生成器 🌍</Heading>
      <Flex gap="2" align="center">
        <Text size="4" color="gray">
          您的当前 IP 地址为：
        </Text>
        {ipLoading ? (
          <Skeleton>
            <Code size="4">loading...</Code>
          </Skeleton>
        ) : ipError ? (
          <Text color="red">获取IP失败</Text>
        ) : (
          <Code size="4">{ipSignal.value}</Code>
        )}
      </Flex>
    </>
  );
};
