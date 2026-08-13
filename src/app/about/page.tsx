import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "About", path: "/about" });

export default function About() {
  return <p style={{ padding: "3rem" }}>About page — demonstrates the title template pattern.</p>;
}
