import { Flex, Table, ScrollArea } from '@radix-ui/themes';
import PropTypes from 'prop-types';
import GoogleMapTooltip from 'app/components/AddressGenerator/GoogleMapTooltip';
import { ADDRESS_FIELDS, LABELS } from 'app/constants/addressFields';
import { CopyableText } from './CopyableText';

export function AddressTable({ address }) {
    return (
        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Table.Root>
                <Table.Body>
                    {ADDRESS_FIELDS.map((key) => (
                        <Table.Row key={key}>
                            <Table.Cell style={{ width: '20%', fontWeight: 'bold' }}>
                                {LABELS[key]}
                            </Table.Cell>
                            <Table.Cell style={{ width: '80%' }}>
                                <Flex align="center" gap="2">
                                    <CopyableText text={address[key]} tooltipKey={key} />
                                    {key === 'address' && <GoogleMapTooltip address={address} />}
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </ScrollArea>
    );
}

AddressTable.propTypes = {
    address: PropTypes.shape({
        address: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zipCode: PropTypes.string,
        country: PropTypes.string,
    }).isRequired,
};