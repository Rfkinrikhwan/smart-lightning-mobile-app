// src/types/index.ts
export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export interface Lamp {
    id: number;
    status: 'ON' | 'OFF';
    currentColor: RgbColor;
}

export interface LampStatusResponse {
    lamps: Lamp[];
    runningLedActive: boolean;
}

export interface SystemStatus {
    status: 'Online' | 'Offline' | 'Loading...';
    detail: string;
}