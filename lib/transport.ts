
import { type TransportOption } from '@/lib/types/transport';

export function getTransportModes(distance: number): Array<TransportOption['mode']> {
    if (distance < 300) {
        return ['car', 'bus', 'train'];
    } else if (distance >= 300 && distance <= 800) {
        return ['car', 'bus', 'train', 'flight'];
    } else {
        return ['car', 'bus', 'train', 'flight'];
    }
}


export function calculatePrice(mode: TransportOption['mode'], distance: number): number {
    switch (mode) {
        case 'car':
            return distance * 8;
        case 'bus':
            return distance * 1.5;
        case 'train':
            return distance * 2.5;
        case 'flight':
            return 1500 + distance * 5;
        default:
            return 0;
    }
}

export function calculateDuration(mode: TransportOption['mode'], distance: number): number {
    switch (mode) {
        case 'car':
            return (distance / 60) * 60; // in minutes
        case 'bus':
            return (distance / 40) * 60; // in minutes
        case 'train':
            return (distance / 80) * 60; // in minutes
        case 'flight':
            return (distance / 500) * 60 + 120; // in minutes, including 2 hours for check-in/out
        default:
            return 0;
    }
}
