'use client';

import { Flex, Text, Button, Tabs } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import { useAddress } from 'app/contexts/AddressContext';
import { useAddressGenerator } from 'app/components/AddressGenerator/useAddressGenerator';
import { useTooltip } from 'app/components/AddressGenerator/useTooltip';
import { IPInput } from 'app/components/AddressGenerator/IPInput';
import { RegionInput } from 'app/components/AddressGenerator/RegionInput';
import { InfoTable } from '@/app/components/AddressGenerator/InfoTable';
import { PlusIcon } from '@radix-ui/react-icons';
import { addressService } from 'app/services/addressService';
import { REGION_DATA, COUNTRIES } from 'app/constants/regionData';

const formatAddressData = (addressData, userData) => ({
    firstName: userData.firstName,
    lastName: userData.lastName,
    address: `${addressData.house_number || ''} ${addressData.road || ''}`.trim() || 'N/A',
    city: addressData.city || addressData.town || 'N/A',
    state: addressData.state || 'N/A',
    zipCode: addressData.postcode || 'N/A',
    country: addressData.country || 'N/A',
    phone: userData.phone,
    ssn: userData.ssn
});

export default function AddressGenerator() {
    const { saveAddress } = useAddress();
    const { address, setAddress, loading, setLoading, error, setError } = useAddressGenerator();
    const { tooltipStates, copyToClipboard, handleTooltip } = useTooltip();

    const [batchCount, setBatchCount] = useState(1);
    const [batchLoading, setBatchLoading] = useState(false);

    useEffect(() => {
        const initialGenerate = async () => {
            setLoading(true);
            try {
                const coordinates = await addressService.getIPCoordinates();
                if (coordinates) {
                    const addressData = await addressService.getRandomAddress(coordinates.latitude, coordinates.longitude);
                    const userData = await addressService.getRandomUserData(addressData.country);
                    setAddress(formatAddressData(addressData, userData));
                }
            } catch (error) {
                console.error("初始地址生成出错:", error);
                setError('生成地址时出错，请稍后再试');
            } finally {
                setLoading(false);
            }
        };
        initialGenerate();
    }, []);

    const handleBatchGenerate = async () => {
        setBatchLoading(true);
        setError('');
        try {
            for (let i = 0; i < batchCount; i++) {
                let coordinates = await addressService.getIPCoordinates();

                if (coordinates) {
                    const addressData = await addressService.getRandomAddress(coordinates.latitude, coordinates.longitude);
                    const userData = await addressService.getRandomUserData(addressData.country);

                    await saveAddress(formatAddressData(addressData, userData));
                }
            }
        } catch (error) {
            console.error("批量生成地址时出错:", error);
            setError('批量生成地址时出错，请稍后再试');
        } finally {
            setBatchLoading(false);
        }
    };

    const handleIPGenerate = async (ipInput) => {
        setLoading(true);
        setError('');
        try {
            const coordinates = await addressService.getIPCoordinates(ipInput || undefined);
            if (coordinates) {
                const addressData = await addressService.getRandomAddress(coordinates.latitude, coordinates.longitude);
                const userData = await addressService.getRandomUserData(addressData.country);

                setAddress(formatAddressData(addressData, userData));
            }
        } catch (error) {
            console.error("生成地址时出错:", error);
            setError('生成地址时出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const handleRegionGenerate = async ({ country, state, city }) => {
        setLoading(true);
        setError('');
        try {
            const coordinates = await addressService.getCityCenterCoordinates(country, state, city);
            const addressData = await addressService.getRandomAddress(coordinates.latitude, coordinates.longitude);
            const userData = await addressService.getRandomUserData(country);
            setAddress(formatAddressData(addressData, userData));
        } catch (error) {
            console.error("生成地址时出错:", error);
            setError('生成地址时出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const renderAddressInfo = () => (
        <>
            {error && <Text color="red">{error}</Text>}
            <InfoTable
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
        </>
    );

    return (
        <Flex direction="column" gap="4" style={{ height: '100%', padding: '16px' }}>
            <Tabs.Root defaultValue="ip">
                <Tabs.List>
                    <Tabs.Trigger value="ip">IP地址</Tabs.Trigger>
                    <Tabs.Trigger value="country">国家/城市</Tabs.Trigger>
                    <Tabs.Trigger value="experimental">实验性功能</Tabs.Trigger>
                </Tabs.List>

                <Flex mt="4" direction="column" style={{ width: '100%' }}>
                    <Tabs.Content value="ip" style={{ width: '100%' }}>
                        <Flex direction="column" gap="4">
                            <IPInput
                                onGenerate={handleIPGenerate}
                                loading={loading}
                            />
                            {renderAddressInfo()}
                        </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="country" style={{ width: '100%' }}>
                        <Flex direction="column" gap="4">
                            <RegionInput
                                loading={loading}
                                onGenerate={handleRegionGenerate}
                            />
                            {renderAddressInfo()}
                        </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="experimental" style={{ width: '100%' }}>
                        <Flex direction="column" gap="3" align="center">
                            <Text size="2" color="gray">
                                批量生成地址功能
                            </Text>
                            <Flex gap="3" align="center">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={batchCount}
                                    onChange={(e) => setBatchCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                    placeholder="输入生成数量（1-100）"
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--gray-6)',
                                        width: '200px'
                                    }}
                                />
                                <Button
                                    size="2"
                                    onClick={handleBatchGenerate}
                                    disabled={batchLoading}
                                >
                                    {batchLoading ? '生成中...' : '批量生成并保存'}
                                </Button>
                            </Flex>
                            {error && <Text color="red" size="1">{error}</Text>}
                            <Text size="1" color="gray" style={{ marginTop: '8px' }}>
                                生成的地址将直接保存到右侧列表
                            </Text>
                        </Flex>
                    </Tabs.Content>
                </Flex>
            </Tabs.Root>
        </Flex>
    );
}
