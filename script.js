document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const themeControls = {
        primaryColor: document.getElementById('primary-color'),
        secondaryColor: document.getElementById('secondary-color'),
        accentColor: document.getElementById('accent-color'),
        backgroundColor: document.getElementById('background-color'),
        textColor: document.getElementById('text-color'),
        fontFamily: document.getElementById('font-family'),
        baseFontSize: document.getElementById('base-font-size'),
        lineHeight: document.getElementById('line-height'),
        baseSpacing: document.getElementById('base-spacing')
    };

    const toggleThemeBtn = document.getElementById('toggle-theme');
    const exportThemeBtn = document.getElementById('export-theme');
    const generatePaletteBtn = document.getElementById('generate-palette');
    const addCustomVariableBtn = document.getElementById('add-custom-variable');
    const customVariablesContainer = document.getElementById('custom-variables');

    function updateTheme() {
        Object.entries(themeControls).forEach(([key, control]) => {
            let value = control.value;
            if (key === 'baseFontSize' || key === 'baseSpacing') {
                value += 'px';
            }
            root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value);
        });
    }

    Object.values(themeControls).forEach(control => {
        control.addEventListener('input', updateTheme);
    });

    toggleThemeBtn.addEventListener('click', () => {
        const isDarkMode = root.style.getPropertyValue('--background-color').trim() === '#333333';
        root.style.setProperty('--background-color', isDarkMode ? '#ffffff' : '#333333');
        root.style.setProperty('--text-color', isDarkMode ? '#000000' : '#ffffff');
        themeControls.backgroundColor.value = isDarkMode ? '#ffffff' : '#333333';
        themeControls.textColor.value = isDarkMode ? '#000000' : '#ffffff';
    });

    generatePaletteBtn.addEventListener('click', () => {
        const primaryColor = themeControls.primaryColor.value;
        const secondaryColor = generateComplementaryColor(primaryColor);
        const accentColor = generateAnalogousColor(primaryColor);

        themeControls.secondaryColor.value = secondaryColor;
        themeControls.accentColor.value = accentColor;

        updateTheme();
    });

    addCustomVariableBtn.addEventListener('click', () => {
        const variableName = prompt('Enter custom variable name (e.g., button-radius):');
        if (variableName) {
            const variableValue = prompt(`Enter value for ${variableName}:`);
            if (variableValue) {
                const customVarElement = document.createElement('div');
                customVarElement.innerHTML = `
                    <label>${variableName}:
                        <input type="text" data-var-name="${variableName}" value="${variableValue}">
                    </label>
                `;
                customVariablesContainer.appendChild(customVarElement);

                const input = customVarElement.querySelector('input');
                input.addEventListener('input', () => {
                    root.style.setProperty(`--${variableName}`, input.value);
                });

                root.style.setProperty(`--${variableName}`, variableValue);
            }
        }
    });

    exportThemeBtn.addEventListener('click', () => {
        const css = generateCSS();
        const scss = generateSCSS();
        const json = generateJSON();

        downloadFile('theme.css', css);
        downloadFile('theme.scss', scss);
        downloadFile('theme.json', json);
    });

    function generateComplementaryColor(hex) {
        const rgb = hexToRgb(hex);
        const complement = rgb.map(value => 255 - value);
        return rgbToHex(complement);
    }

    function generateAnalogousColor(hex) {
        const hsl = hexToHsl(hex);
        hsl[0] = (hsl[0] + 30) % 360;
        return hslToHex(hsl);
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function rgbToHex(rgb) {
        return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function hexToHsl(hex) {
        let [r, g, b] = hexToRgb(hex).map(x => x / 255);
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    function hslToHex(hsl) {
        let [h, s, l] = hsl;
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return rgbToHex([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]);
    }

    function generateCSS() {
        let css = ':root {\n';
        Object.entries(themeControls).forEach(([key, control]) => {
            const varName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
            css += `    ${varName}: ${control.value}${key === 'baseFontSize' || key === 'baseSpacing' ? 'px' : ''};\n`;
        });
        customVariablesContainer.querySelectorAll('input').forEach(input => {
            css += `    --${input.dataset.varName}: ${input.value};\n`;
        });
        css += '}\n';
        return css;
    }

    function generateSCSS() {
        let scss = '$theme: (\n';
        Object.entries(themeControls).forEach(([key, control]) => {
            const varName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            scss += `    ${varName}: ${control.value}${key === 'baseFontSize' || key === 'baseSpacing' ? 'px' : ''},\n`;
        });
        customVariablesContainer.querySelectorAll('input').forEach(input => {
            scss += `    ${input.dataset.varName}: ${input.value},\n`;
        });
        scss = scss.slice(0, -2) + '\n);\n\n';
        scss += ':root {\n';
        scss += '    @each $key, $value in $theme {\n';
        scss += '        --#{$key}: #{$value};\n';
        scss += '    }\n';
        scss += '}\n';
        return scss;
    }

    function generateJSON() {
        const json = {};
        Object.entries(themeControls).forEach(([key, control]) => {
            const varName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            json[varName] = control.value;
            if (key === 'baseFontSize' || key === 'baseSpacing') {
                json[varName] += 'px';
            }
        });
        customVariablesContainer.querySelectorAll('input').forEach(input => {
            json[input.dataset.varName] = input.value;
        });
        return JSON.stringify(json, null, 2);
    }

    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateTheme();
});