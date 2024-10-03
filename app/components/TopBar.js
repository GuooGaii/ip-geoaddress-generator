import { Box, Link, Button, Flex } from '@radix-ui/themes';
import { FaGithub } from 'react-icons/fa';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

export default function TopBar({ theme, setTheme }) {
    const topBarStyle = {
        height: '60px',
        backgroundColor: 'var(--color-background-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        padding: '0 20px',
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Box style={topBarStyle}>
            <Flex align="center" gap="4">
                <Button variant="soft" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    {theme === 'light' ? <MoonIcon size="3" /> : <SunIcon size="3" />}
                </Button>
                <Link href="https://github.com/GuooGaii/ip-geoaddress-generator" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <FaGithub size={24} color="var(--color-foreground)" />
                </Link>
            </Flex>
        </Box>
    );
}

TopBar.propTypes = {
    theme: PropTypes.oneOf(['light', 'dark']).isRequired,
    setTheme: PropTypes.func.isRequired,
};