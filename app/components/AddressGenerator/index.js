'use client';

import { Flex, Text } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';
import { useAddress } from '../../contexts/AddressContext';
import { useAddressGenerator } from './useAddressGenerator';
import { useTooltip } from './useTooltip';
import { AddressInput } from './IPInput';
import { AddressTable } from './AddressTable';
import { SaveAddressButton } from './SaveAddressButton';

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
            <SaveAddressButton saveAddress={() => saveAddress(address)} />
        </Flex>
    );
}