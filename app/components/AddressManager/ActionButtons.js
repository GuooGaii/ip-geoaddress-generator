import { Button, Flex } from '@radix-ui/themes';
import { TrashIcon, DownloadIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

const buttonStyle = {
    minWidth: '120px',
    height: '40px',
    transition: 'none'
};

export default function ActionButtons({ addressCount, deleteAllAddresses, saveToTxtFile }) {
    const isDisabled = addressCount === 0;

    return (
        <Flex justify="center" gap="3" mt="3" style={{ flexShrink: 0 }}>
            <Button
                onClick={deleteAllAddresses}
                disabled={isDisabled}
                size="3"
                color="red"
                style={buttonStyle}
            >
                <TrashIcon />
                删除所有
            </Button>
            <Button
                onClick={saveToTxtFile}
                disabled={isDisabled}
                size="3"
                style={buttonStyle}
            >
                <DownloadIcon />
                保存为TXT
            </Button>
        </Flex>
    );
}

ActionButtons.propTypes = {
    addressCount: PropTypes.number.isRequired,
    deleteAllAddresses: PropTypes.func.isRequired,
    saveToTxtFile: PropTypes.func.isRequired
};