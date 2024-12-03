/**
 * IPDisplay 组件
 * 
 * 一个用于显示用户当前IP地址的React组件。
 * 组件在加载时会自动从addressService获取用户的IP地址，
 * 并将其显示在页面上。如果获取失败，会显示错误信息。
 * 
 * 使用了Radix UI的主题组件进行样式设置。
 */

'use client';

import { useState, useEffect } from 'react';
import { Text, Flex, Box } from '@radix-ui/themes';
import { addressService } from 'app/services/addressService';

export default function IPDisplay() {
    const [ipAddress, setIpAddress] = useState('');

    useEffect(() => {
        addressService.getCurrentIP()
            .then(ip => setIpAddress(ip))
            .catch(error => {
                console.error('获取IP地址时出错:', error);
                setIpAddress('无法获取IP地址');
            });
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