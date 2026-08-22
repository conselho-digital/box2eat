# Roteiro Animado

Ferramenta 100% client-side (sem backend, sem custo de API) para criar vídeos simples de avatares conversando. Publicada via GitHub Pages através do `index.html`, funciona em desktop e mobile.

## Como usar

1. **Avatares**: monte personagens simples (forma da cabeça, cores, olhos, cabelo) e salve.
2. **Roteiro**: adicione falas, escolha o personagem e um gesto opcional (acenar/apontar), reordene com as setas.
3. **Palco**: toque/clique em Reproduzir — a câmera foca em quem está falando, a boca anima e o texto é narrado com a Web Speech API (voz do navegador).

Tudo é salvo automaticamente no `localStorage` do navegador (avatares e roteiro).

## Limitações do MVP

- Não exporta vídeo ainda (fase 2 — gravação de tela via `MediaRecorder`).
- TTS depende das vozes instaladas no navegador/SO do usuário.
- Animações são simples (SVG + CSS), não é geração de vídeo por IA.

## Criação de vídeos (Remotion)

O diretório [`remotion-videos/`](./remotion-videos) contém um projeto [Remotion](https://www.remotion.dev/) para criar vídeos (demos, anúncios, tutoriais) usando React.

```console
cd remotion-videos
npm i
npm run dev      # abre o Remotion Studio para editar/pré-visualizar
npx remotion render   # renderiza o vídeo final
```

## Navegação assistida (Chrome DevTools MCP)

O arquivo [`.mcp.json`](./.mcp.json) configura o servidor [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp), que permite ao Claude Code abrir sites e vídeos diretamente (navegar, inspecionar, tirar screenshot) sem depender de prints enviados manualmente.

Ao abrir este projeto no Claude Code (CLI ou web), aprove o servidor MCP do projeto quando solicitado para habilitar a ferramenta em novas sessões.
