'use client';

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const AddressContext = createContext();

export function AddressProvider({ children }) {
    const [savedAddresses, setSavedAddresses] = useState([]);

    // 从 localStorage 加载保存的地址
    useEffect(() => {
        const storedAddresses = localStorage.getItem('savedAddresses');
        if (storedAddresses) {
            setSavedAddresses(JSON.parse(storedAddresses));
        }
    }, []);

    // 修改 saveAddress 函数
    const saveAddress = useCallback((newAddress) => {
        setSavedAddresses(prev => {
            const updatedAddresses = [{ ...newAddress, id: Date.now() }, ...prev];
            localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
            return updatedAddresses;
        });
    }, []);

    // 从 state 和 localStorage 删除地址
    const deleteAddress = useCallback((id) => {
        setSavedAddresses(prev => {
            const updatedAddresses = prev.filter(addr => addr.id !== id);
            localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
            return updatedAddresses;
        });
    }, []);

    // 删除所有地址
    const deleteAllAddresses = useCallback(() => {
        setSavedAddresses([]);
        localStorage.removeItem('savedAddresses');
    }, []);

    // 保存为 TXT 文件
    const saveToTxtFile = useCallback(() => {
        const content = savedAddresses.map(addr =>
            `${addr.lastName},${addr.firstName},${addr.address},${addr.city},${addr.state},${addr.zipCode},${addr.country},${addr.phone}`
        ).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'saved_addresses.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [savedAddresses]);

    return (
        <AddressContext.Provider value={{ savedAddresses, saveAddress, deleteAddress, deleteAllAddresses, saveToTxtFile }}>
            {children}
        </AddressContext.Provider>
    );
}

export function useAddress() {
    return useContext(AddressContext);
}