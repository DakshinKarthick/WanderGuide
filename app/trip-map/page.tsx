'use client';
import dynamic from 'next/dynamic';

const TripMapClient = dynamic(() => import('./TripMapClient'), {
    ssr: false,
    loading: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            Loading map...
        </div>
    ),
});

export default function TripMapPage() {
    return <TripMapClient />;
}