import type { MetadataRoute } from "next";

/** Web app manifest so the site can be installed to a phone's home screen, with the brand colour and icons. */
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
