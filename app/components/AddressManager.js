'use client';

import { useAddress } from '../contexts/AddressContext';
import { Button, ScrollArea, Flex, Text, Table, TextField } from '@radix-ui/themes';
import { TrashIcon, DownloadIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState, useMemo } from 'react';

const buttonStyle = {
    minWidth: '120px',
    height: '40px',
    transition: 'none'
};

export default function AddressManager() {
    const { savedAddresses = [], deleteAddress, saveToTxtFile, deleteAllAddresses } = useAddress();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAddresses = useMemo(() => {
        return savedAddresses.filter(addr =>
            Object.values(addr).some(value =>
                typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [savedAddresses, searchQuery]);

    return (
        <Flex direction="column" style={{ height: '100%', padding: '16px' }}>
            <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <AddressList filteredAddresses={filteredAddresses} deleteAddress={deleteAddress} />
            <ActionButtons
                addressCount={savedAddresses.length}
                deleteAllAddresses={deleteAllAddresses}
                saveToTxtFile={saveToTxtFile}
            />
        </Flex>
    );
}

function SearchField({ searchQuery, setSearchQuery }) {
    return (
        <TextField.Root
            size="3"
            placeholder="搜索地址"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '16px' }}
        >
            <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
        </TextField.Root>
    );
}

function AddressList({ filteredAddresses, deleteAddress }) {
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

function AddressRow({ addr, deleteAddress }) {
    return (
        <Table.Row>
            <Table.Cell style={{ width: '80%' }}>
                <Text size="2">
                    {`${addr.lastName},${addr.firstName},${addr.address},${addr.city},${addr.state},${addr.zipCode},${addr.country},${addr.phone}`}
                </Text>
            </Table.Cell>
            <Table.Cell style={{ width: '20%' }}>
                <Button variant="soft" color="red" onClick={() => deleteAddress(addr.id)} size="2">
                    <TrashIcon />
                    删除
                </Button>
            </Table.Cell>
        </Table.Row>
    );
}

function ActionButtons({ addressCount, deleteAllAddresses, saveToTxtFile }) {
    const isDisabled = addressCount === 0;

    return (
        <Flex justify="center" gap="3" mt="3" style={{ flexShrink: 0 }}>
            <Button
                onClick={deleteAllAddresses}
                disabled={isDisabled}
                size="3"
                color="red"
                style={buttonStyle}
            >
                <TrashIcon />
                删除所有
            </Button>
            <Button
                onClick={saveToTxtFile}
                disabled={isDisabled}
                size="3"
                style={buttonStyle}
            >
                <DownloadIcon />
                保存为TXT
            </Button>
        </Flex>
    );
}