import { Flex, Select, Button } from '@radix-ui/themes';
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
    availableStates,
    availableCities
}) {
    return (
        <Flex direction="column" gap="2">
            <Select.Root value={country} onValueChange={setCountry}>
                <Select.Trigger placeholder="选择国家" />
                <Select.Content position="popper">
                    {countries.map((c) => (
                        <Select.Item key={c} value={c}>
                            {c}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>

            <Select.Root value={state} onValueChange={setState}>
                <Select.Trigger placeholder="选择州/省" />
                <Select.Content position="popper">
                    {availableStates.map((s) => (
                        <Select.Item key={s} value={s}>
                            {s}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>

            <Select.Root value={city} onValueChange={setCity}>
                <Select.Trigger placeholder="选择城市" />
                <Select.Content position="popper">
                    {availableCities.map((c) => (
                        <Select.Item key={c} value={c}>
                            {c}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>

            <Button onClick={onGenerate} disabled={loading || !country || !state || !city}>
                生成地址
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
    availableStates: PropTypes.arrayOf(PropTypes.string).isRequired,
    availableCities: PropTypes.arrayOf(PropTypes.string).isRequired,
};