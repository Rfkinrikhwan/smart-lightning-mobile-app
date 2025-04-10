export function rgbToHex(r: number, g: number, b: number): string {
    return [r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove the # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}