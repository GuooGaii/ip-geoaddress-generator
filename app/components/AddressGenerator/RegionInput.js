import { Flex, Select, Button } from '@radix-ui/themes';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { REGION_DATA, COUNTRIES } from 'app/constants/regionData';

export function RegionInput({ loading, onGenerate }) {
    const [country, setCountry] = useState(COUNTRIES[0]);
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [availableStates, setAvailableStates] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);

    useEffect(() => {
        setAvailableStates(Object.keys(REGION_DATA[country]));
        setState('');
        setCity('');
    }, [country]);

    useEffect(() => {
        if (state) {
            setAvailableCities(REGION_DATA[country][state] || []);
            setCity('');
        }
    }, [country, state]);

    const handleGenerate = () => {
        onGenerate({ country, state, city });
    };

    return (
        <Flex direction="column" gap="2">
            <Select.Root value={country} onValueChange={setCountry}>
                <Select.Trigger placeholder="选择国家" />
                <Select.Content position="popper">
                    {COUNTRIES.map((c) => (
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

            <Button onClick={handleGenerate} disabled={loading || !country || !state || !city}>
                生成地址
            </Button>
        </Flex>
    );
}

RegionInput.propTypes = {
    loading: PropTypes.bool.isRequired,
    onGenerate: PropTypes.func.isRequired,
};