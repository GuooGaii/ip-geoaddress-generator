import { Flex, Button, Select } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';
import { useState } from 'react';

// 这里应该是一个更完整的国家列表，这只是一个示例
const countries = ['中国', '美国', '日本', '英国', '加拿大', '澳大利亚'];

export function CountryCityInput({ loading, onGenerate }) {
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');

    return (
        <Flex align="center" justify="between" gap="3" style={{ width: '100%' }}>
            <Flex align="center" gap="3" style={{ flex: 1 }}>
                <Select.Root value={country} onValueChange={setCountry}>
                    <Select.Trigger placeholder="选择国家" size="3" />
                    <Select.Content position="popper">
                        {countries.map((c) => (
                            <Select.Item key={c} value={c}>
                                {c}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
                <Select.Root value={city} onValueChange={setCity}>
                    <Select.Trigger placeholder="选择城市（可选）" size="3" />
                    <Select.Content position="popper">
                        {/* 这里应该根据选择的国家动态加载城市列表 */}
                        <Select.Item value="beijing">北京</Select.Item>
                        <Select.Item value="shanghai">上海</Select.Item>
                        <Select.Item value="guangzhou">广州</Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>
            <Button
                size="3"
                disabled={loading || !country}
                onClick={() => onGenerate(country, city)}
            >
                <ReloadIcon size="3" />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

CountryCityInput.propTypes = {
    loading: PropTypes.bool.isRequired,
    onGenerate: PropTypes.func.isRequired
};