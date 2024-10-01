'use client';

import { Container, Flex, Heading, Box, Section, Card, Theme } from '@radix-ui/themes';
import IPDisplay from './components/IPDisplay';
import AddressManager from './components/AddressManager';
import AddressGenerator from './components/AddressGenerator'; // 更新这一行
import TopBar from './components/TopBar';
import { AddressProvider } from './contexts/AddressContext';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(false);
  const [leftCardHeight, setLeftCardHeight] = useState('auto');
  const leftCardRef = useRef(null);

  const backgroundStyle = {
    background: `
      linear-gradient(90deg, var(--gray-a3) 1px, transparent 1px),
      linear-gradient(var(--gray-a3) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    backgroundColor: 'var(--gray-a2)',
  };

  const leftCardStyle = {
    ...cardStyle,
    flex: isMobile ? '0 0 auto' : '0 0 50%',
    height: 'auto',
  };

  const rightCardStyle = {
    ...cardStyle,
    flex: isMobile ? '0 0 auto' : '0 0 50%',
    height: isMobile ? leftCardHeight : 'auto',
    maxHeight: isMobile ? 'none' : leftCardHeight,
    overflowY: 'auto',
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const updateLeftCardHeight = () => {
      if (leftCardRef.current) {
        const height = `${leftCardRef.current.offsetHeight}px`;
        setLeftCardHeight(height);
      }
    };

    updateLeftCardHeight();
    window.addEventListener('resize', updateLeftCardHeight);

    const resizeObserver = new ResizeObserver(updateLeftCardHeight);
    const currentLeftCard = leftCardRef.current; // 捕获当前的 ref 值
    if (currentLeftCard) {
      resizeObserver.observe(currentLeftCard);
    }

    return () => {
      window.removeEventListener('resize', updateLeftCardHeight);
      if (currentLeftCard) { // 使用捕获的 ref 值
        resizeObserver.unobserve(currentLeftCard);
      }
    };
  }, []);

  useEffect(() => {
    // 从 localStorage 读取主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 修改 setTheme 函数
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Theme appearance={theme} accentColor="cyan">
      <AddressProvider>
        <Box style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          ...backgroundStyle
        }}>
          <TopBar theme={theme} setTheme={handleThemeChange} />
          <Container size="4" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Section size="3" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '16px' }}>
              <Flex direction="column" gap="2" style={{ height: '100%' }}>
                <Box>
                  <Heading size="8" align="center" mb="1">
                    基于IP的真实地址生器 🌍
                  </Heading>
                  <IPDisplay />
                </Box>
                <Box style={{ flex: 1, display: 'flex' }}>
                  <Flex
                    direction={isMobile ? 'column' : 'row'}
                    gap="4"
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <Card ref={leftCardRef} style={leftCardStyle}>
                      <AddressGenerator />
                    </Card>
                    <Card style={rightCardStyle}>
                      <AddressManager />
                    </Card>
                  </Flex>
                </Box>
              </Flex>
            </Section>
          </Container>
        </Box>
      </AddressProvider>
    </Theme>
  );
}
