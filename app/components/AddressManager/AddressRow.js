import { Button, Text, Table } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { ADDRESS_FIELDS } from 'app/constants/addressFields';
import PropTypes from 'prop-types';

export default function AddressRow({ addr, deleteAddress }) {
    return (
        <Table.Row>
            <Table.Cell style={{ width: '80%' }}>
                <Text size="2">
                    {ADDRESS_FIELDS.map(field => addr[field]).join(',')}
                </Text>
            </Table.Cell>
            <Table.Cell style={{ width: '20%' }}>
                <Button variant="soft" color="red" onClick={() => deleteAddress(addr.id)} size="2">
                    <TrashIcon size="3" />
                    删除
                </Button>
            </Table.Cell>
        </Table.Row>
    );
}

AddressRow.propTypes = {
    addr: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
    deleteAddress: PropTypes.func.isRequired,
};