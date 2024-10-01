import { Flex, Table, Text, Tooltip, ScrollArea } from '@radix-ui/themes';
import PropTypes from 'prop-types';
import GoogleMapTooltip from '../GoogleMapTooltip';
import { ADDRESS_FIELDS, LABELS } from 'app/constants/addressFields';

export function AddressTable({ address, copyToClipboard, handleTooltip, tooltipStates }) {
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
                                    <Tooltip
                                        content={tooltipStates[key]?.content || "点击复制"}
                                        open={tooltipStates[key]?.visible}
                                        align="center"
                                        sideOffset={4}
                                    >
                                        <Text
                                            as="span"
                                            style={{
                                                cursor: 'pointer',
                                                width: 'auto',
                                                display: 'inline-block',
                                                position: 'relative'
                                            }}
                                            onClick={() => copyToClipboard(address[key], key)}
                                            onMouseEnter={() => handleTooltip(key, true)}
                                            onMouseLeave={() => handleTooltip(key, false)}
                                        >
                                            {address[key]}
                                        </Text>
                                    </Tooltip>
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
    copyToClipboard: PropTypes.func.isRequired,
    handleTooltip: PropTypes.func.isRequired,
    tooltipStates: PropTypes.object.isRequired,
};