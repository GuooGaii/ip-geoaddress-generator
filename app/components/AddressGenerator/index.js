'use client';

import { Flex, Text, Button, Tabs } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';
import { useAddress } from 'app/contexts/AddressContext';
import { useAddressGenerator } from 'app/components/AddressGenerator/useAddressGenerator';
import { useTooltip } from 'app/components/AddressGenerator/useTooltip';
import { AddressInput } from 'app/components/AddressGenerator/IPInput';
import { CountryCityInput } from 'app/components/AddressGenerator/CountryCityInput';
import { AddressTable } from 'app/components/AddressGenerator/AddressTable';
import { PlusIcon } from '@radix-ui/react-icons';

export default function AddressGenerator() {
    const { saveAddress } = useAddress();
    const { address, loading, error, generateAddress, generateAddressByCountryCity } = useAddressGenerator();
    const { tooltipStates, copyToClipboard, handleTooltip } = useTooltip();
    const [ipInput, setIpInput] = useState('');
    const initialLoadRef = useRef(true);

    useEffect(() => {
        if (initialLoadRef.current) {
            generateAddress('');
            initialLoadRef.current = false;
        }
    }, [generateAddress]);

    const handleCountryCityGenerate = (country, city) => {
        generateAddressByCountryCity(country, city);
    };

    return (
        <Flex direction="column" gap="4" style={{ height: '100%', padding: '16px' }}>
            <Tabs.Root defaultValue="ip">
                <Tabs.List>
                    <Tabs.Trigger value="ip">IP地址</Tabs.Trigger>
                    <Tabs.Trigger value="country">国家/城市</Tabs.Trigger>
                </Tabs.List>

                <Flex mt="4">
                    <Tabs.Content value="ip" style={{ width: '100%' }}>
                        <AddressInput
                            ipInput={ipInput}
                            setIpInput={setIpInput}
                            onGenerateAddress={generateAddress}
                            loading={loading}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="country" style={{ width: '100%' }}>
                        <CountryCityInput
                            loading={loading}
                            onGenerate={handleCountryCityGenerate}
                        />
                    </Tabs.Content>
                </Flex>
            </Tabs.Root>

            {error && <Text color="red">{error}</Text>}
            <AddressTable
                address={address}
                copyToClipboard={copyToClipboard}
                handleTooltip={handleTooltip}
                tooltipStates={tooltipStates}
            />
            <Flex justify="center" mt="4">
                <Button size="3" onClick={() => saveAddress(address)}>
                    <PlusIcon size="3" />
                    保存地址
                </Button>
            </Flex>
        </Flex>
    );
}
