import { useState, useCallback } from 'react';

export function useTooltip() {
    const [tooltipStates, setTooltipStates] = useState({});

    const updateTooltipState = useCallback((key, content, visible) => {
        setTooltipStates(prev => ({ ...prev, [key]: { content, visible } }));
    }, []);

    const hideTooltip = useCallback((key) => {
        updateTooltipState(key, "", false);
    }, [updateTooltipState]);

    const copyToClipboard = useCallback((text, key) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                updateTooltipState(key, "已复制!", true);
                setTimeout(() => hideTooltip(key), 1000);
            })
            .catch((err) => {
                console.error('无法复制文本: ', err);
            });
    }, [updateTooltipState, hideTooltip]);

    const handleTooltip = useCallback((key, visible, content = "点击复制") => {
        updateTooltipState(key, content, visible);
    }, [updateTooltipState]);

    return { tooltipStates, copyToClipboard, handleTooltip };
}