document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const themeControls = {
        primaryColor: document.getElementById('primary-color'),
        secondaryColor: document.getElementById('secondary-color'),
        backgroundColor: document.getElementById('background-color'),
        textColor: document.getElementById('text-color'),
        fontFamily: document.getElementById('font-family'),
        fontSize: document.getElementById('font-size'),
        padding: document.getElementById('padding'),
        margin: document.getElementById('margin')
    };

    const toggleThemeBtn = document.getElementById('toggle-theme');
    const exportThemeBtn = document.getElementById('export-theme');

    // Update theme based on controls
    function updateTheme() {
        root.style.setProperty('--primary-color', themeControls.primaryColor.value);
        root.style.setProperty('--secondary-color', themeControls.secondaryColor.value);
        root.style.setProperty('--background-color', themeControls.backgroundColor.value);
        root.style.setProperty('--text-color', themeControls.textColor.value);
        root.style.setProperty('--font-family', themeControls.fontFamily.value);
        root.style.setProperty('--font-size', `${themeControls.fontSize.value}px`);
        root.style.setProperty('--padding', `${themeControls.padding.value}px`);
        root.style.setProperty('--margin', `${themeControls.margin.value}px`);
    }

    // Add event listeners to all controls
    Object.values(themeControls).forEach(control => {
        control.addEventListener('input', updateTheme);
    });

    // Toggle between light and dark mode
    toggleThemeBtn.addEventListener('click', () => {
        if (root.style.getPropertyValue('--background-color') === '#ffffff') {
            root.style.setProperty('--background-color', '#333333');
            root.style.setProperty('--text-color', '#ffffff');
            themeControls.backgroundColor.value = '#333333';
            themeControls.textColor.value = '#ffffff';
        } else {
            root.style.setProperty('--background-color', '#ffffff');
            root.style.setProperty('--text-color', '#000000');
            themeControls.backgroundColor.value = '#ffffff';
            themeControls.textColor.value = '#000000';
        }
    });

    // Export theme as CSS
    exportThemeBtn.addEventListener('click', () => {
        const css = `
:root {
    --primary-color: ${themeControls.primaryColor.value};
    --secondary-color: ${themeControls.secondaryColor.value};
    --background-color: ${themeControls.backgroundColor.value};
    --text-color: ${themeControls.textColor.value};
    --font-family: ${themeControls.fontFamily.value};
    --font-size: ${themeControls.fontSize.value}px;
    --padding: ${themeControls.padding.value}px;
    --margin: ${themeControls.margin.value}px;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size);
    background-color: var(--background-color);
    color: var(--text-color);
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: white;
}`;

        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'theme.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});