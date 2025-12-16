import { Heading, Flex, Text, Code, Skeleton } from "@radix-ui/themes";

interface HeaderProps {
  ipLoading: boolean;
  ipError: Error | null;
  detectedIp: string;
}

export const Header = ({ ipLoading, ipError, detectedIp }: HeaderProps) => {
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
          <Code size="4">{detectedIp}</Code>
        )}
      </Flex>
    </>
  );
};
