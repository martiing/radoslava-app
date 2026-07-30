import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPageBody } from "@/components/legal/LegalPageBody";
import { privacyPolicy } from "@/content/legal-content";

export const metadata: Metadata = {
  title: `${privacyPolicy.heading} | Slavova's Shape Squad`,
  description: privacyPolicy.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalPageBody content={privacyPolicy} />
      </main>
      <Footer />
    </>
  );
}
