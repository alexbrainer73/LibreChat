#!/usr/bin/env node

const fs = require('fs');

// Read mermaid code
const mermaidCode = fs.readFileSync('diagram.mmd', 'utf8');

// Create standalone SVG HTML that can be opened and saved
const svgHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LibreChat - Diagrama de Fluxo de Upload de Imagem</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35
            },
            themeVariables: {
                fontSize: '16px',
                fontFamily: 'Arial, Helvetica, sans-serif'
            }
        });

        window.addEventListener('load', () => {
            setTimeout(() => {
                const svg = document.querySelector('.mermaid svg');
                if (svg) {
                    console.log('✓ Diagrama renderizado com sucesso!');
                    console.log('📸 Para salvar como imagem:');
                    console.log('   1. Clique com botão direito no diagrama');
                    console.log('   2. Selecione "Salvar imagem como..." ou "Copiar imagem"');
                    console.log('   3. Ou use Ctrl+P (Imprimir) → "Salvar como PDF"');

                    // Add download button
                    const btn = document.createElement('button');
                    btn.textContent = '💾 Baixar SVG';
                    btn.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;background:#0066cc;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:9999;';
                    btn.onclick = () => {
                        const svgData = svg.outerHTML;
                        const blob = new Blob([svgData], {type: 'image/svg+xml'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'librechat-image-upload-flow.svg';
                        a.click();
                        URL.revokeObjectURL(url);
                    };
                    document.body.appendChild(btn);
                }
            }, 2000);
        });
    </script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }

        .diagram-container {
            padding: 40px;
            background: white;
            overflow-x: auto;
        }

        .mermaid {
            display: flex;
            justify-content: center;
            min-width: fit-content;
        }

        .instructions {
            background: #f8f9fa;
            padding: 30px 40px;
            border-top: 1px solid #e9ecef;
        }

        .instructions h2 {
            color: #2a5298;
            font-size: 20px;
            margin-bottom: 15px;
        }

        .instructions ul {
            list-style: none;
            padding: 0;
        }

        .instructions li {
            padding: 8px 0;
            color: #495057;
            font-size: 14px;
        }

        .instructions li::before {
            content: "→ ";
            color: #667eea;
            font-weight: bold;
            margin-right: 8px;
        }

        footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
            background: #f8f9fa;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
            header, .instructions, footer, button {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>LibreChat - Fluxo de Upload de Imagem</h1>
            <p class="subtitle">Diagrama de Sequência Completo: Frontend → Backend → LLM</p>
        </header>

        <div class="diagram-container">
            <div class="mermaid">
${mermaidCode}
            </div>
        </div>

        <div class="instructions">
            <h2>📋 Como salvar este diagrama</h2>
            <ul>
                <li>Clique no botão "💾 Baixar SVG" no canto superior direito</li>
                <li>Ou clique com botão direito no diagrama → "Salvar imagem como..."</li>
                <li>Ou use Ctrl+P (Cmd+P no Mac) → "Salvar como PDF"</li>
                <li>Para converter SVG em PNG: use https://cloudconvert.com/svg-to-png</li>
            </ul>
        </div>

        <footer>
            <p>Gerado automaticamente a partir da análise do código do LibreChat</p>
            <p>55 passos sequenciais | 3 fases principais | Suporte a OpenAI, Anthropic e Google</p>
        </footer>
    </div>
</body>
</html>`;

fs.writeFileSync('librechat-image-upload-diagram.html', svgHtml);
console.log('✅ Arquivo HTML criado: librechat-image-upload-diagram.html');
console.log('');
console.log('📖 Para visualizar e salvar como imagem:');
console.log('   1. Abra o arquivo no navegador:');
console.log('      xdg-open librechat-image-upload-diagram.html  # Linux');
console.log('      open librechat-image-upload-diagram.html      # macOS');
console.log('      start librechat-image-upload-diagram.html     # Windows');
console.log('');
console.log('   2. Aguarde o diagrama carregar (2-3 segundos)');
console.log('   3. Clique no botão "💾 Baixar SVG" ou use botão direito → "Salvar imagem"');
console.log('');
console.log('📱 Alternativa online:');
console.log('   Acesse: https://mermaid.live/');
console.log('   Cole o conteúdo de diagram.mmd e clique em "Download PNG"');
