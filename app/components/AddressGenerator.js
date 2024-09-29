'use client';

import { Flex, TextField, Button, Table, Text, Tooltip, ScrollArea } from '@radix-ui/themes';
import { MagnifyingGlassIcon, ReloadIcon, PlusIcon } from '@radix-ui/react-icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAddress } from '../contexts/AddressContext';
import GoogleMapTooltip from './GoogleMapTooltip';

// 常量定义
const API_URLS = {
    LOCATION: 'https://ipapi.co/json/',
    NOMINATIM: 'https://nominatim.openstreetmap.org/reverse',
    RANDOM_USER: 'https://randomuser.me/api/'
};

const ADDRESS_FIELDS = ['lastName', 'firstName', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];

const LABELS = {
    firstName: '名',
    lastName: '姓',
    address: '地址',
    city: '城市',
    state: '州/省',
    zipCode: '邮编',
    country: '国家',
    phone: '电话'
};

// 自定义钩子
function useAddressGenerator() {
    const [address, setAddress] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateAddress = useCallback(async (customIP) => {
        setLoading(true);
        setError('');
        try {
            const locationData = await getIPAndLocation(customIP);
            const addressData = await getRandomAddress(locationData.latitude, locationData.longitude);
            const userData = await getRandomUserData();

            setAddress({
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: `${addressData.house_number || ''} ${addressData.road || ''}`.trim() || 'N/A',
                city: addressData.city || addressData.town || 'N/A',
                state: addressData.state || 'N/A',
                zipCode: addressData.postcode || 'N/A',
                country: addressData.country || 'N/A',
                phone: userData.phone
            });
        } catch (error) {
            setError('生成地址时出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, []);

    return { address, loading, error, generateAddress };
}

// API 调用函数
async function getIPAndLocation(customIP) {
    const url = customIP ? `https://ipapi.co/${customIP}/json/` : API_URLS.LOCATION;
    const response = await fetch(url);
    return await response.json();
}

async function getRandomAddress(lat, lon) {
    const radius = 0.01;
    const randomLat = lat + (Math.random() - 0.5) * radius;
    const randomLon = lon + (Math.random() - 0.5) * radius;

    const url = `${API_URLS.NOMINATIM}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`;
    const response = await fetch(url);
    const data = await response.json();
    return data.address;
}

async function getRandomUserData() {
    const englishCountries = ['us', 'gb', 'au', 'ca', 'nz'];
    const randomCountry = englishCountries[Math.floor(Math.random() * englishCountries.length)];

    const response = await fetch(`${API_URLS.RANDOM_USER}?nat=${randomCountry}`);
    const data = await response.json();
    const user = data.results[0];
    return {
        firstName: user.name.first,
        lastName: user.name.last,
        phone: user.phone
    };
}

// 主组件
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

    const buttonStyle = {
        minWidth: '120px',
        height: '40px',
        transition: 'none'
    };

    return (
        <Flex direction="column" gap="4" style={{ height: '100%', padding: '16px' }}>
            <AddressInput
                ipInput={ipInput}
                setIpInput={setIpInput}
                generateAddress={generateAddress}
                loading={loading}
                buttonStyle={buttonStyle}
            />
            {error && <Text color="red">{error}</Text>}
            <AddressTable
                address={address}
                copyToClipboard={copyToClipboard}
                handleTooltip={handleTooltip}
                tooltipStates={tooltipStates}
            />
            <SaveAddressButton saveAddress={() => saveAddress(address)} buttonStyle={buttonStyle} />
        </Flex>
    );
}

// 子组件
function AddressInput({ ipInput, setIpInput, generateAddress, loading, buttonStyle }) {
    return (
        <Flex gap="3" width="100%" height="40px" align="center">
            <TextField.Root
                size="3"
                placeholder="输入IP地址（可选）"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                style={{ flex: 1 }}
            >
                <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
            </TextField.Root>
            <Button
                size="3"
                onClick={() => generateAddress(ipInput)}
                disabled={loading}
                style={buttonStyle}
            >
                <ReloadIcon />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

function AddressTable({ address, copyToClipboard, handleTooltip, tooltipStates }) {
    return (
        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Table.Root>
                <Table.Body>
                    {ADDRESS_FIELDS.map((key) => (
                        <Table.Row key={key}>
                            <Table.Cell style={{ width: '20%', fontWeight: 'bold' }}>
                                {LABELS[key]}
                            </Table.Cell>
                            <Table.Cell style={{ width: '80%' }}>
                                <Flex align="center" gap="2">
                                    <Tooltip
                                        content={tooltipStates[key]?.content || "点击复制"}
                                        open={tooltipStates[key]?.visible}
                                        align="center" // 将 Tooltip 对齐到文本的中心
                                        sideOffset={4}  // 根据需要调整 tooltip 距离文本的偏移量
                                    >
                                        <Text
                                            as="span"
                                            style={{
                                                cursor: 'pointer',
                                                width: 'auto', // 让 Text 元素宽度自适应内容
                                                display: 'inline-block',
                                                position: 'relative'
                                            }}
                                            onClick={() => copyToClipboard(address[key], key)}
                                            onMouseEnter={() => handleTooltip(key, true)}
                                            onMouseLeave={() => handleTooltip(key, false)}
                                        >
                                            {address[key]}
                                        </Text>
                                    </Tooltip>
                                    {key === 'address' && <GoogleMapTooltip address={address} />}
                                </Flex>
                            </Table.Cell>

                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </ScrollArea>
    );
}

function SaveAddressButton({ saveAddress, buttonStyle }) {
    return (
        <Flex justify="center" mt="4">
            <Button
                size="3"
                onClick={saveAddress}
                style={buttonStyle}
            >
                <PlusIcon />
                保存地址
            </Button>
        </Flex>
    );
}
