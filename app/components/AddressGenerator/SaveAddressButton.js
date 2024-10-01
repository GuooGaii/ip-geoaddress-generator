import { Flex, Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';

export function SaveAddressButton({ saveAddress }) {
    return (
        <Flex justify="center" mt="4">
            <Button
                size="3"
                onClick={saveAddress}
            >
                <PlusIcon />
                保存地址
            </Button>
        </Flex>
    );
}