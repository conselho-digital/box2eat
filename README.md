# nexoraIA

Painel de vendas (`index.html`), publicado via GitHub Pages.

## Criação de vídeos

O diretório [`remotion-videos/`](./remotion-videos) contém um projeto [Remotion](https://www.remotion.dev/) para criar vídeos (demos, anúncios, tutoriais) do SaaS usando React.

```console
cd remotion-videos
npm i
npm run dev      # abre o Remotion Studio para editar/pré-visualizar
npx remotion render   # renderiza o vídeo final
```

## Roteiro Animado (avatares + TTS, sem custo)

O diretório [`roteiro-animado/`](./roteiro-animado) é uma página independente (100% client-side, sem backend) onde dá pra criar personagens/avatares simples, escrever um roteiro de falas e reproduzir a cena com foco de câmera, boca animada e narração via Web Speech API. Publicada via GitHub Pages em `/roteiro-animado/`.

## Navegação assistida (Chrome DevTools MCP)

O arquivo [`.mcp.json`](./.mcp.json) configura o servidor [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp), que permite ao Claude Code abrir sites e vídeos diretamente (navegar, inspecionar, tirar screenshot) sem depender de prints enviados manualmente.

Ao abrir este projeto no Claude Code (CLI ou web), aprove o servidor MCP do projeto quando solicitado para habilitar a ferramenta em novas sessões.