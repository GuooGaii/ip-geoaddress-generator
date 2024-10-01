'use client';

import { useState, useEffect } from 'react';
import { Text, Flex, Box } from '@radix-ui/themes';
import { addressService } from '../services/addressService';

export default function IPDisplay() {
    const [ipAddress, setIpAddress] = useState('');

    useEffect(() => {
        async function fetchIP() {
            try {
                const data = await addressService.getIPAndLocation();
                setIpAddress(data.ip);
            } catch (error) {
                console.error('获取IP地址时出错:', error);
                setIpAddress('无法获取IP地址');
            }
        }

        fetchIP();
    }, []);

    return (
        <Box mb="4">
            <Flex align="center" justify="center">
                <Text size="4">
                    您的当前IP地址为: <Text weight="bold" color="blue">{ipAddress}</Text>
                </Text>
            </Flex>
        </Box>
    );
}