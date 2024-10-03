'use client';

import { useAddress } from 'app/contexts/AddressContext';
import { Flex, Box } from '@radix-ui/themes';
import { useState, useMemo } from 'react';
import SearchField from 'app/components/AddressManager/SearchField';
import AddressList from 'app/components/AddressManager/AddressList';
import ActionButtons from 'app/components/AddressManager/ActionButtons';

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
            <Box style={{ flex: 1, minHeight: '200px', overflowY: 'auto' }}>
                <AddressList filteredAddresses={filteredAddresses} deleteAddress={deleteAddress} />
            </Box>
            <ActionButtons
                addressCount={savedAddresses.length}
                deleteAllAddresses={deleteAllAddresses}
                saveToTxtFile={saveToTxtFile}
            />
        </Flex>
    );
}