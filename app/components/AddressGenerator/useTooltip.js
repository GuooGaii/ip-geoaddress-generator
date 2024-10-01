import { useState, useCallback } from 'react';

export function useTooltip() {
    const [tooltipStates, setTooltipStates] = useState({});

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

    return { tooltipStates, copyToClipboard, handleTooltip };
}