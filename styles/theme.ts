import { Platform } from "react-native";

// src/styles/theme.ts
export const colors = {
    // Warna utama
    primary: {
        light: '#3b82f6',  // blue-500
        main: '#2563eb',   // blue-600
        dark: '#1d4ed8',   // blue-700
    },

    // Warna sekunder
    secondary: {
        light: '#10b981',  // emerald-500
        main: '#059669',   // emerald-600
        dark: '#047857',   // emerald-700
    },

    // Warna latar
    background: {
        default: '#f0f4f8',
        paper: '#ffffff',
        card: '#f0f4f8',
    },

    // Warna teks
    text: {
        primary: '#1e293b',   // slate-800
        secondary: '#64748b', // slate-500
        disabled: '#94a3b8',  // slate-400
    },

    // Warna status
    status: {
        active: '#10b981',   // emerald-500
        inactive: '#94a3b8', // slate-400
        error: '#ef4444',    // red-500
        warning: '#f59e0b',  // amber-500
        info: '#3b82f6',     // blue-500
    },

    // Warna aksi
    action: {
        active: '#3b82f6',     // blue-500
        hover: '#60a5fa',      // blue-400
        selected: '#93c5fd',   // blue-300
        disabled: '#cbd5e1',   // slate-300
    },

    // Warna campuran untuk UI
    common: {
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
    },

    // Warna untuk lampu
    lamp: {
        on: '#facc15',     // yellow-400
        off: '#94a3b8',    // slate-400
        glow: 'rgba(250, 204, 21, 0.8)', // shadow untuk efek lampu menyala
    },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    neumorphic: {
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
};

export const typography = {
    fontFamily: {
        default: 'System',
        monospace: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        h1: 30,
        h2: 26,
        h3: 22,
    },
    fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
    },
};

const theme = {
    colors,
    shadows,
    spacing,
    borderRadius,
    typography,
};

export default theme;