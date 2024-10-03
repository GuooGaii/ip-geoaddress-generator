import { Flex, Button, Select } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

export function RegionInput({
    loading,
    onGenerate,
    country,
    setCountry,
    state,
    setState,
    city,
    setCity,
    countries,
    usStates,
    availableCities
}) {
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
                <Select.Root value={state} onValueChange={setState}>
                    <Select.Trigger placeholder="选择州" size="3" />
                    <Select.Content position="popper">
                        {usStates.map((s) => (
                            <Select.Item key={s} value={s}>
                                {s}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
                <Select.Root value={city} onValueChange={setCity}>
                    <Select.Trigger placeholder="选择城市" size="3" />
                    <Select.Content position="popper">
                        {availableCities.map((c) => (
                            <Select.Item key={c} value={c}>
                                {c}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </Flex>
            <Button
                size="3"
                disabled={loading || !country || !state || !city}
                onClick={onGenerate}
            >
                <ReloadIcon size="3" />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

RegionInput.propTypes = {
    loading: PropTypes.bool.isRequired,
    onGenerate: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    setCountry: PropTypes.func.isRequired,
    state: PropTypes.string.isRequired,
    setState: PropTypes.func.isRequired,
    city: PropTypes.string.isRequired,
    setCity: PropTypes.func.isRequired,
    countries: PropTypes.arrayOf(PropTypes.string).isRequired,
    usStates: PropTypes.arrayOf(PropTypes.string).isRequired,
    availableCities: PropTypes.arrayOf(PropTypes.string).isRequired
};