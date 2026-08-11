import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressRail } from "@/components/ui/ScrollProgressRail";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { Hero } from "@/components/sections/Hero";
import { OfferBlock } from "@/components/sections/OfferBlock";
import { FitCheck } from "@/components/sections/FitCheck";
import { PainPoints } from "@/components/sections/PainPoints";
import { BmiCalculator } from "@/components/sections/BmiCalculator";
import { MeetRadoslava } from "@/components/sections/MeetRadoslava";
import { LimitedSpots } from "@/components/sections/LimitedSpots";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <ScrollProgressRail />
      <Header />
      <main className="relative overflow-hidden">
        <AmbientGlow variant="warm" className="left-[-10%] top-[15%] h-96 w-96" />
        <AmbientGlow variant="cool" className="right-[-8%] top-[45%] h-[28rem] w-[28rem]" />
        <AmbientGlow variant="warm" className="left-[5%] top-[80%] h-80 w-80" />
        <Hero />
        <OfferBlock />
        <FitCheck />
        <PainPoints />
        <BmiCalculator />
        <MeetRadoslava />
        <LimitedSpots />
        <RegistrationForm />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
