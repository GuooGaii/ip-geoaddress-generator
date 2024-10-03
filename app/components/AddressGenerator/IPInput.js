import { Flex, TextField, Button } from '@radix-ui/themes';
import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

export function AddressInput({ ipInput, setIpInput, onGenerateAddress, loading }) {
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
                onClick={() => onGenerateAddress(ipInput)}
                disabled={loading}
            >
                <ReloadIcon size="3" />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

AddressInput.propTypes = {
    ipInput: PropTypes.string.isRequired,
    setIpInput: PropTypes.func.isRequired,
    onGenerateAddress: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};