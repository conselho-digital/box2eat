import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Box2eat",
    short_name: "Box2eat",
    description: "Peça comida dos melhores restaurantes perto de você",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e55e1e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
