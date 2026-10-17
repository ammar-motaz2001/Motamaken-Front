import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mutamakin — Freelancers & Influencers",
    short_name: "Mutamakin",
    description: "Hire skilled freelancers and social media influencers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#188d4a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
