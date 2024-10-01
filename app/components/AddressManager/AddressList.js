import { ScrollArea, Flex, Text, Table } from '@radix-ui/themes';
import AddressRow from 'app/components/AddressManager/AddressRow';
import PropTypes from 'prop-types';

export default function AddressList({ filteredAddresses, deleteAddress }) {
    if (filteredAddresses.length === 0) {
        return (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Text align="center" color="gray">暂无匹配的地址</Text>
            </Flex>
        );
    }

    return (
        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Table.Root>
                <Table.Body>
                    {filteredAddresses.map((addr) => (
                        <AddressRow key={addr.id} addr={addr} deleteAddress={deleteAddress} />
                    ))}
                </Table.Body>
            </Table.Root>
        </ScrollArea>
    );
}

AddressList.propTypes = {
    filteredAddresses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
    })).isRequired,
    deleteAddress: PropTypes.func.isRequired,
};