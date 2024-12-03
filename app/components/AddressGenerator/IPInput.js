'use client';

import { Flex, TextField, Button, Text } from '@radix-ui/themes';
import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { addressService } from 'app/services/addressService';

export function IPInput({ onAddressGenerated, loading, setLoading, setError }) {
    const [ipInput, setIpInput] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            // 如果是首次加载（ipInput 为空），就不传入 ipInput
            const coordinates = await addressService.getIPCoordinates(ipInput || undefined);

            if (coordinates) {
                const addressData = await addressService.getRandomAddress(coordinates.latitude, coordinates.longitude);
                const userData = await addressService.getRandomUserData(addressData.country);

                const newAddress = {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    address: `${addressData.house_number || ''} ${addressData.road || ''}`.trim() || 'N/A',
                    city: addressData.city || addressData.town || 'N/A',
                    state: addressData.state || 'N/A',
                    zipCode: addressData.postcode || 'N/A',
                    country: addressData.country || 'N/A',
                    phone: userData.phone,
                    ssn: userData.ssn
                };

                onAddressGenerated(newAddress);
            }
        } catch (error) {
            console.error("生成地址时出错:", error);
            setError('生成地址时出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex gap="3" width="100%" align="center">
            <TextField.Root
                size="3"
                placeholder="输入IP地址（可选）"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                style={{ flex: 1 }}
            >
                <TextField.Slot>
                    <MagnifyingGlassIcon size="3" />
                </TextField.Slot>
            </TextField.Root>
            <Button
                size="3"
                onClick={handleGenerate}
                disabled={loading}
            >
                <ReloadIcon size="3" />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

IPInput.propTypes = {
    onAddressGenerated: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    setLoading: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired
};