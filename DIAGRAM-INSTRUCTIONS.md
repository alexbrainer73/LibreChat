# Como Visualizar e Salvar o Diagrama

Criei o diagrama de sequência do fluxo de upload de imagens no LibreChat. Aqui estão as opções para visualizar e salvar como imagem:

## Opção 1: Visualizar no Navegador (Recomendado)

1. Abra o arquivo `diagram.html` no seu navegador:
   ```bash
   # Linux
   xdg-open diagram.html

   # macOS
   open diagram.html

   # Windows
   start diagram.html
   ```

2. O diagrama será renderizado automaticamente usando Mermaid.js

3. Para salvar como imagem:
   - **Clique com botão direito** na página → "Salvar imagem como..."
   - Ou use a **função de impressão** do navegador → "Salvar como PDF"
   - Ou use uma **extensão de screenshot** do navegador

## Opção 2: Visualizar no GitHub

1. Commit e push os arquivos:
   ```bash
   git add image-upload-sequence-diagram.md diagram.mmd diagram.html
   git commit -m "Add image upload flow diagram"
   git push
   ```

2. Abra o arquivo `image-upload-sequence-diagram.md` no GitHub
   - O GitHub renderiza diagramas Mermaid automaticamente em arquivos Markdown

## Opção 3: Usar Ferramentas Online

1. Copie o conteúdo de `diagram.mmd`

2. Cole em um destes sites:
   - **Mermaid Live Editor**: https://mermaid.live/
   - **Mermaid Chart**: https://www.mermaidchart.com/

3. Clique em "Download PNG" ou "Download SVG"

## Opção 4: Usar VS Code

1. Instale a extensão "Markdown Preview Mermaid Support" ou "Mermaid Preview"

2. Abra `image-upload-sequence-diagram.md` no VS Code

3. Use o preview de Markdown (Ctrl+Shift+V)

4. Clique com botão direito no diagrama → "Copy Image" ou use um screenshot

## Opção 5: Usar CLI (se tiver Docker)

```bash
docker run --rm -v $(pwd):/data minlag/mermaid-cli -i /data/diagram.mmd -o /data/librechat-image-upload-flow.png -w 3000 -b white
```

## Arquivos Disponíveis

- `diagram.mmd` - Código Mermaid puro
- `diagram.html` - Visualização HTML interativa
- `image-upload-sequence-diagram.md` - Documentação completa com diagrama embutido

## Visualização Rápida Online

Você também pode usar este link (cole o conteúdo de diagram.mmd):
https://mermaid.live/

Enjoy! 🎨
