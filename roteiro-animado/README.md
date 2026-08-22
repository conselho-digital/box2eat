# Roteiro Animado

Ferramenta 100% client-side (sem backend, sem custo de API) para criar vídeos simples de avatares conversando, publicável direto no GitHub Pages.

## Como usar

1. **Avatares**: monte personagens simples (forma da cabeça, cores, olhos, cabelo) e salve.
2. **Roteiro**: adicione falas, escolha o personagem e um gesto opcional (acenar/apontar), reordene com as setas.
3. **Palco**: clique em Reproduzir — a câmera foca em quem está falando, a boca anima e o texto é narrado com a Web Speech API (voz do navegador).

Tudo é salvo automaticamente no `localStorage` do navegador (avatares e roteiro).

## Limitações do MVP

- Não exporta vídeo ainda (fase 2 — gravação de tela via `MediaRecorder`).
- TTS depende das vozes instaladas no navegador/SO do usuário.
- Animações são simples (SVG + CSS), não é geração de vídeo por IA.
