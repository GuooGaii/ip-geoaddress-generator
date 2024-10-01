import { useState } from 'react';
import { Tooltip } from '@radix-ui/themes';
import { GlobeIcon } from '@radix-ui/react-icons';

export default function GoogleMapTooltip({ address }) {
    const [showMap, setShowMap] = useState(false);

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
        `${address.address}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`
    )}&output=embed`;

    return (
        <Tooltip
            open={showMap}
            onOpenChange={setShowMap}
            content={
                <div style={{ width: '300px', height: '200px', overflow: 'hidden' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={mapUrl}
                    />
                </div>
            }
        >
            <GlobeIcon
                style={{ cursor: 'pointer', color: 'var(--accent-9)' }}
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(false)}
            />
        </Tooltip>
    );
}