import { Box, Link, Button, Flex, DropdownMenu } from '@radix-ui/themes';
import { MoonIcon, SunIcon, GlobeIcon, GitHubLogoIcon } from '@radix-ui/react-icons';
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
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                            <GlobeIcon size="3" />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="center" sideOffset={5}>
                        <DropdownMenu.Item>中文</DropdownMenu.Item>
                        <DropdownMenu.Item>English</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
                <Link href="https://github.com/GuooGaii/ip-geoaddress-generator" target="_blank" rel="noopener noreferrer">
                    <Button variant="soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                        <GitHubLogoIcon size="3" />
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
}

TopBar.propTypes = {
    theme: PropTypes.oneOf(['light', 'dark']).isRequired,
    setTheme: PropTypes.func.isRequired,
};
