import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { terms } from "@/content/legal-content";

export const metadata: Metadata = {
  title: `${terms.heading} | Slavova's Shape Squad`,
  description: terms.intro,
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <LegalPageBody content={terms} />
      </main>
      <Footer />
    </>
  );
}
