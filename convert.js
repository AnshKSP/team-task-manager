const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'ui_mockups');
const destDir = path.join(__dirname, 'frontend', 'src', 'pages');

const mapObj = {
    'class=': 'className=',
    'for=': 'htmlFor=',
    'tabindex=': 'tabIndex=',
    'fill-rule=': 'fillRule=',
    'clip-rule=': 'clipRule=',
    'stroke-width=': 'strokeWidth=',
    'stroke-linecap=': 'strokeLinecap=',
    'stroke-linejoin=': 'strokeLinejoin=',
    'stroke-miterlimit=': 'strokeMiterlimit='
};

function htmlToJsx(htmlStr) {
    let jsx = htmlStr;

    // Replace attributes
    for (const [key, value] of Object.entries(mapObj)) {
        jsx = jsx.split(key).join(value);
    }

    // Close input and img tags
    jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    
    // Convert html comments to jsx comments
    jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

    // Remove <style> tags and their content
    jsx = jsx.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Convert inline styles like style="font-variation-settings: 'FILL' 1;" to style={{ fontVariationSettings: "'FILL' 1" }}
    jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
        const styleObj = {};
        styleString.split(';').forEach(rule => {
            if (rule.trim()) {
                let [key, value] = rule.split(':');
                if (key && value) {
                    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    styleObj[key] = value.trim();
                }
            }
        });
        return `style={${JSON.stringify(styleObj)}}`;
    });

    // Extract body content
    const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let componentContent = bodyMatch ? bodyMatch[1] : jsx;

    return componentContent;
}

const files = {
    'signup.html': 'Signup.jsx',
    'dashboard.html': 'Dashboard.jsx',
    'projects.html': 'Projects.jsx',
    'kanban.html': 'ProjectBoard.jsx'
};

for (const [htmlFile, jsxFile] of Object.entries(files)) {
    const htmlPath = path.join(srcDir, htmlFile);
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const jsxContent = htmlToJsx(html);
        
        const componentName = jsxFile.replace('.jsx', '');
        
        const fileTemplate = `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nconst ${componentName} = () => {\n  return (\n    <>\n${jsxContent}\n    </>\n  );\n};\n\nexport default ${componentName};\n`;
        
        fs.writeFileSync(path.join(destDir, jsxFile), fileTemplate);
        console.log(`Converted ${htmlFile} to ${jsxFile}`);
    }
}
