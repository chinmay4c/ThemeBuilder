document.addEventListener('DOMContentLoaded', () => {
    const app = {
        root: document.documentElement,
        controls: {},
        elements: {},
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.initializeTheme();
            this.initializeAnimations();
        },
        cacheDOM() {
            this.controls = {
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
            this.elements = {
                toggleThemeBtn: document.getElementById('toggle-theme'),
                exportThemeBtn: document.getElementById('export-theme'),
                generatePaletteBtn: document.getElementById('generate-palette'),
                addCustomVariableBtn: document.getElementById('add-custom-variable'),
                customVariablesContainer: document.getElementById('custom-variables'),
                previewSection: document.getElementById('preview'),
                themeControlsSection: document.getElementById('theme-controls')
            };
        },
        bindEvents() {
            Object.values(this.controls).forEach(control => {
                control.addEventListener('input', () => this.updateTheme());
            });
            this.elements.toggleThemeBtn.addEventListener('click', () => this.toggleTheme());
            this.elements.exportThemeBtn.addEventListener('click', () => this.exportTheme());
            this.elements.generatePaletteBtn.addEventListener('click', () => this.generatePalette());
            this.elements.addCustomVariableBtn.addEventListener('click', () => this.addCustomVariable());
        },
        initializeTheme() {
            this.updateTheme();
            this.applyTheme();
        },
        initializeAnimations() {
            this.animateElement(this.elements.previewSection, 'fadeInRight');
            this.animateElement(this.elements.themeControlsSection, 'fadeInLeft');
        },
        updateTheme() {
            Object.entries(this.controls).forEach(([key, control]) => {
                let value = control.value;
                if (key === 'baseFontSize' || key === 'baseSpacing') {
                    value += 'px';
                }
                this.root.style.setProperty(`--${this.camelToKebab(key)}`, value);
            });
            this.applyTheme();
        },
        applyTheme() {
            document.body.style.setProperty('transition', 'all 0.3s ease-in-out');
            requestAnimationFrame(() => {
                Object.entries(this.controls).forEach(([key, control]) => {
                    document.body.style.setProperty(`--${this.camelToKebab(key)}`, control.value);
                });
            });
        },
        toggleTheme() {
            const isDarkMode = this.root.style.getPropertyValue('--background-color').trim() === '#333333';
            const newBackgroundColor = isDarkMode ? '#ffffff' : '#333333';
            const newTextColor = isDarkMode ? '#000000' : '#ffffff';
            
            this.animateColorChange('--background-color', newBackgroundColor);
            this.animateColorChange('--text-color', newTextColor);
            
            this.controls.backgroundColor.value = newBackgroundColor;
            this.controls.textColor.value = newTextColor;
        },
        generatePalette() {
            const primaryColor = this.controls.primaryColor.value;
            const secondaryColor = this.generateComplementaryColor(primaryColor);
            const accentColor = this.generateAnalogousColor(primaryColor);

            this.animateColorChange('--secondary-color', secondaryColor);
            this.animateColorChange('--accent-color', accentColor);

            this.controls.secondaryColor.value = secondaryColor;
            this.controls.accentColor.value = accentColor;
        },
        addCustomVariable() {
            const variableName = prompt('Enter custom variable name (e.g., button-radius):');
            if (variableName) {
                const variableValue = prompt(`Enter value for ${variableName}:`);
                if (variableValue) {
                    const customVarElement = document.createElement('div');
                    customVarElement.classList.add('custom-variable');
                    customVarElement.innerHTML = `
                        <label>${variableName}:
                            <input type="text" data-var-name="${variableName}" value="${variableValue}">
                        </label>
                        <button class="remove-variable">Remove</button>
                    `;
                    this.elements.customVariablesContainer.appendChild(customVarElement);

                    const input = customVarElement.querySelector('input');
                    input.addEventListener('input', () => {
                        this.root.style.setProperty(`--${variableName}`, input.value);
                    });

                    const removeBtn = customVarElement.querySelector('.remove-variable');
                    removeBtn.addEventListener('click', () => {
                        this.elements.customVariablesContainer.removeChild(customVarElement);
                        this.root.style.removeProperty(`--${variableName}`);
                    });

                    this.root.style.setProperty(`--${variableName}`, variableValue);
                    this.animateElement(customVarElement, 'fadeIn');
                }
            }
        },
        exportTheme() {
            const css = this.generateCSS();
            const scss = this.generateSCSS();
            const json = this.generateJSON();

            this.downloadFile('theme.css', css);
            this.downloadFile('theme.scss', scss);
            this.downloadFile('theme.json', json);

            this.showNotification('Theme exported successfully!');
        },
        generateComplementaryColor(hex) {
            const rgb = this.hexToRgb(hex);
            const complement = rgb.map(value => 255 - value);
            return this.rgbToHex(complement);
        },
        generateAnalogousColor(hex) {
            const hsl = this.hexToHsl(hex);
            hsl[0] = (hsl[0] + 30) % 360;
            return this.hslToHex(hsl);
        },
        hexToRgb(hex) {
            const bigint = parseInt(hex.slice(1), 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        },
        rgbToHex(rgb) {
            return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
        },
        hexToHsl(hex) {
            let [r, g, b] = this.hexToRgb(hex).map(x => x / 255);
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
        },
        hslToHex(hsl) {
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

            return this.rgbToHex([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]);
        },
        generateCSS() {
            let css = ':root {\n';
            Object.entries(this.controls).forEach(([key, control]) => {
                const varName = `--${this.camelToKebab(key)}`;
                css += `    ${varName}: ${control.value}${key === 'baseFontSize' || key === 'baseSpacing' ? 'px' : ''};\n`;
            });
            this.elements.customVariablesContainer.querySelectorAll('input').forEach(input => {
                css += `    --${input.dataset.varName}: ${input.value};\n`;
            });
            css += '}\n';
            return css;
        },
        generateSCSS() {
            let scss = '$theme: (\n';
            Object.entries(this.controls).forEach(([key, control]) => {
                const varName = this.camelToKebab(key);
                scss += `    ${varName}: ${control.value}${key === 'baseFontSize' || key === 'baseSpacing' ? 'px' : ''},\n`;
            });
            this.elements.customVariablesContainer.querySelectorAll('input').forEach(input => {
                scss += `    ${input.dataset.varName}: ${input.value},\n`;
            });
            scss = scss.slice(0, -2) + '\n);\n\n';
            scss += ':root {\n';
            scss += '    @each $key, $value in $theme {\n';
            scss += '        --#{$key}: #{$value};\n';
            scss += '    }\n';
            scss += '}\n';
            return scss;
        },
        generateJSON() {
            const json = {};
            Object.entries(this.controls).forEach(([key, control]) => {
                const varName = this.camelToKebab(key);
                json[varName] = control.value;
                if (key === 'baseFontSize' || key === 'baseSpacing') {
                    json[varName] += 'px';
                }
            });
            this.elements.customVariablesContainer.querySelectorAll('input').forEach(input => {
                json[input.dataset.varName] = input.value;
            });
            return JSON.stringify(json, null, 2);
        },
        downloadFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        showNotification(message) {
            const notification = document.createElement('div');
            notification.classList.add('notification');
            notification.textContent = message;
            document.body.appendChild(notification);
            this.animateElement(notification, 'fadeIn');
            setTimeout(() => {
                this.animateElement(notification, 'fadeOut');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        },
        animateElement(element, animationName) {
            element.classList.add(animationName);
            element.addEventListener('animationend', () => {
                element.classList.remove(animationName);
            }, { once: true });
        },
        animateColorChange(property, newValue) {
            const element = document.body;
            const currentColor = getComputedStyle(element).getPropertyValue(property);
            element.style.setProperty('transition', `${property} 0.3s ease-in-out`);
            requestAnimationFrame(() => {
                element.style.setProperty(property, newValue);
            });
        },
        camelToKebab(string) {
            return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        }
    };

    app.init();
});