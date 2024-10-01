import { TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

export default function SearchField({ searchQuery, setSearchQuery }) {
    return (
        <TextField.Root
            size="3"
            placeholder="搜索地址"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '16px' }}
        >
            <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
        </TextField.Root>
    );
}

SearchField.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
};