'use client';

import { Flex, Text, Button } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';
import { useAddress } from 'app/contexts/AddressContext';
import { useAddressGenerator } from 'app/components/AddressGenerator/useAddressGenerator';
import { useTooltip } from 'app/components/AddressGenerator/useTooltip';
import { AddressInput } from 'app/components/AddressGenerator/IPInput';
import { AddressTable } from 'app/components/AddressGenerator/AddressTable';
import { PlusIcon } from '@radix-ui/react-icons';

export default function AddressGenerator() {
    const { saveAddress } = useAddress();
    const { address, loading, error, generateAddress } = useAddressGenerator();
    const { tooltipStates, copyToClipboard, handleTooltip } = useTooltip();
    const [ipInput, setIpInput] = useState('');
    const initialLoadRef = useRef(true);

    useEffect(() => {
        if (initialLoadRef.current) {
            generateAddress('');
            initialLoadRef.current = false;
        }
    }, [generateAddress]);

    return (
        <Flex direction="column" gap="4" style={{ height: '100%', padding: '16px' }}>
            <AddressInput
                ipInput={ipInput}
                setIpInput={setIpInput}
                onGenerateAddress={generateAddress}
                loading={loading}
            />
            {error && <Text color="red">{error}</Text>}
            <AddressTable
                address={address}
                copyToClipboard={copyToClipboard}
                handleTooltip={handleTooltip}
                tooltipStates={tooltipStates}
            />
            <Flex justify="center" mt="4">
                <Button size="3" onClick={() => saveAddress(address)}>
                    <PlusIcon />
                    保存地址
                </Button>
            </Flex>
        </Flex>
    );
}
