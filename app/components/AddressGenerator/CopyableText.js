import { Text, Tooltip } from '@radix-ui/themes';
import PropTypes from 'prop-types';
import { useTooltip } from './useTooltip';

export function CopyableText({ text, tooltipKey }) {
    const { tooltipStates, copyToClipboard, handleTooltip } = useTooltip();

    return (
        <Tooltip
            content={tooltipStates[tooltipKey]?.content || "点击复制"}
            open={tooltipStates[tooltipKey]?.visible}
            align="center"
            sideOffset={4}
        >
            <Text
                as="span"
                style={{
                    cursor: 'pointer',
                    width: 'auto',
                    display: 'inline-block',
                    position: 'relative'
                }}
                onClick={() => copyToClipboard(text, tooltipKey)}
                onMouseEnter={() => handleTooltip(tooltipKey, true)}
                onMouseLeave={() => handleTooltip(tooltipKey, false)}
            >
                {text}
            </Text>
        </Tooltip>
    );
}

CopyableText.propTypes = {
    text: PropTypes.string.isRequired,
    tooltipKey: PropTypes.string.isRequired,
};