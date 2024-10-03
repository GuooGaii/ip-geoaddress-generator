import { useState } from 'react';

export function useAddressGenerator() {
    const [address, setAddress] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    return { address, setAddress, loading, setLoading, error, setError };
}