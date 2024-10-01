'use client';

import { Flex, Text } from '@radix-ui/themes';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAddress } from '../../contexts/AddressContext';
import { useAddressGenerator } from './useAddressGenerator';
import { AddressInput as IPInput } from './IPInput';
import { AddressTable } from './AddressTable';
import { SaveAddressButton } from './SaveAddressButton';

export default function AddressGenerator() {
    const { saveAddress } = useAddress();
    const { address, loading, error, generateAddress } = useAddressGenerator();
    const [ipInput, setIpInput] = useState('');
    const [tooltipStates, setTooltipStates] = useState({});
    const initialLoadRef = useRef(true);

    useEffect(() => {
        if (initialLoadRef.current) {
            generateAddress('');
            initialLoadRef.current = false;
        }
    }, [generateAddress]);

    const copyToClipboard = useCallback((text, key) => {
        navigator.clipboard.writeText(text).then(() => {
            setTooltipStates(prev => ({ ...prev, [key]: { content: "已复制!", visible: true } }));
            setTimeout(() => {
                setTooltipStates(prev => ({ ...prev, [key]: { ...prev[key], visible: false } }));
            }, 1000);
        }, (err) => {
            console.error('无法复制文本: ', err);
        });
    }, []);

    const handleTooltip = useCallback((key, visible, content = "点击复制") => {
        setTooltipStates(prev => ({ ...prev, [key]: { content, visible } }));
    }, []);

    return (
        <Flex direction="column" gap="4" style={{ height: '100%', padding: '16px' }}>
            <IPInput
                ipInput={ipInput}
                setIpInput={setIpInput}
                generateAddress={generateAddress}
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