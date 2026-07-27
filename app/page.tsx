import { connection } from "next/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressRail } from "@/components/ui/ScrollProgressRail";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { Hero } from "@/components/sections/Hero";
import { PainPoints } from "@/components/sections/PainPoints";
import { ChallengeExplainer } from "@/components/sections/ChallengeExplainer";
import { BmiCalculator } from "@/components/sections/BmiCalculator";
import { WhyRadoslava } from "@/components/sections/WhyRadoslava";
import { ClientResults } from "@/components/sections/ClientResults";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhatYouGet } from "@/components/sections/WhatYouGet";
import { LimitedSpots } from "@/components/sections/LimitedSpots";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default async function Home() {
  // Opts out of static prerendering so the CSP nonce from proxy.ts is applied
  // to Next's inline scripts. Without this the page is built once, its scripts
  // carry no nonce, and the policy blocks them.
  await connection();

  return (
    <>
      <ScrollProgressRail />
      <Header />
      <main className="relative overflow-hidden">
        <AmbientGlow variant="warm" className="left-[-10%] top-[15%] h-96 w-96" />
        <AmbientGlow variant="cool" className="right-[-8%] top-[45%] h-[28rem] w-[28rem]" />
        <AmbientGlow variant="warm" className="left-[5%] top-[80%] h-80 w-80" />
        <Hero />
        <PainPoints />
        <ChallengeExplainer />
        <BmiCalculator />
        <WhyRadoslava />
        <ClientResults />
        <HowItWorks />
        <WhatYouGet />
        <LimitedSpots />
        <RegistrationForm />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
