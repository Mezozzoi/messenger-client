type Options = {
    useSalt: boolean;
    saturation: number;
    lightness: number;
}

/**
 * @description Generates color based on input string
 * @param {string} s String
 * @param options Configures output value
 * @param {number} options.saturation = 65 Saturation of result hsl color
 * @param {number} options.lightness = 40 Lightness of result hsl color
 * @param {boolean} options.useSalt = true Do use salt to generate more unique values
 * @returns {string} Hex color
 */
const stringToColor = (s: string, options: Options = {useSalt: true, saturation: 50, lightness: 50}): string => {
    const salt = "@salt#";
    s += options.useSalt ? salt : "";
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;
    return 'hsl('+h+', '+options.saturation+'%, '+options.lightness+'%)';
}

export default stringToColor;