'use client';

import { Flex, TextField, Button } from '@radix-ui/themes';
import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';
import { useState } from 'react';

export function IPInput({ onGenerate, loading }) {
    const [ipInput, setIpInput] = useState('');

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
                onClick={() => onGenerate(ipInput)}
                disabled={loading}
            >
                <ReloadIcon size="3" />
                {loading ? '生成中...' : '生成地址'}
            </Button>
        </Flex>
    );
}

IPInput.propTypes = {
    onGenerate: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};