import { useState } from 'react';
import { Tooltip } from '@radix-ui/themes';
import { GlobeIcon } from '@radix-ui/react-icons';
import PropTypes from 'prop-types';

export default function GoogleMapTooltip({ address }) {
    const [showMap, setShowMap] = useState(false);

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
        `${address.address}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`
    )}&output=embed`;

    const iframeTitle = `谷歌地图 - ${address.address}, ${address.city}`;

    return (
        <Tooltip
            open={showMap}
            onOpenChange={setShowMap}
            content={
                <div style={{ width: '300px', height: '200px', overflow: 'hidden' }}>
                    <iframe
                        title={iframeTitle}
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

GoogleMapTooltip.propTypes = {
    address: PropTypes.shape({
        address: PropTypes.string.isRequired,
        city: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        zipCode: PropTypes.string.isRequired,
        country: PropTypes.string.isRequired,
    }).isRequired,
};