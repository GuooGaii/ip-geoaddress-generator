import { useState, useCallback } from 'react';
import { addressService } from '../../services/addressService';

export function useAddressGenerator() {
    const [address, setAddress] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateAddress = useCallback(async (customIP) => {
        setLoading(true);
        setError('');
        try {
            const locationData = await addressService.getIPAndLocation(customIP);
            const addressData = await addressService.getRandomAddress(locationData.latitude, locationData.longitude);
            const userData = await addressService.getRandomUserData(addressData.country);

            setAddress({
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: `${addressData.house_number || ''} ${addressData.road || ''}`.trim() || 'N/A',
                city: addressData.city || addressData.town || 'N/A',
                state: addressData.state || 'N/A',
                zipCode: addressData.postcode || 'N/A',
                country: addressData.country || 'N/A',
                phone: userData.phone,
                ssn: userData.ssn
            });
        } catch (error) {
            console.error("生成地址时出错:", error);
            setError('生成地址时出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, []);

    return { address, loading, error, generateAddress };
}