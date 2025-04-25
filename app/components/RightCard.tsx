import { Card, Text, Flex, Box, Separator } from "@radix-ui/themes";
import { UserInfo } from "./UserInfo";
import { AddressInfo } from "./AddressInfo";
import { Signal } from "@preact/signals-react";
import type { User, Address } from "../types";

interface RightCardProps {
  userSignal: Signal<User | null>;
  addressSignal: Signal<Address | null>;
  isLoading: boolean;
  error: string;
  addressError: Error | null;
  tempEmail: string;
}

export const RightCard = ({
  userSignal,
  addressSignal,
  isLoading,
  error,
  addressError,
  tempEmail,
}: RightCardProps) => {
  return (
    <Card size="4" style={{ flex: 1 }} className="flex-1 w-full">
      <Flex direction="column" gap="4">
        {(error || addressError) && (
          <Text color="red">
            {error || (addressError?.message ?? String(addressError))}
          </Text>
        )}
        <Box style={{ width: "100%" }}>
          <Flex direction="column" gap="3">
            <UserInfo
              userSignal={userSignal}
              loading={isLoading}
              email={tempEmail}
            />
            <Separator size="4" />
            <AddressInfo addressSignal={addressSignal} loading={isLoading} />
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};
