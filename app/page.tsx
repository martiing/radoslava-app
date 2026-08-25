import { connection } from "next/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { Hero } from "@/components/sections/Hero";
import { OfferBlock } from "@/components/sections/OfferBlock";
import { FitCheck } from "@/components/sections/FitCheck";
import { MeetRadoslava } from "@/components/sections/MeetRadoslava";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { FAQ } from "@/components/sections/FAQ";

export default async function Home() {
  // Opts out of static prerendering so the CSP nonce from proxy.ts is applied
  // to Next's inline scripts. Without this the page is built once, its scripts
  // carry no nonce, and the policy blocks them.
  await connection();

  return (
    <>
      <Header />
      <main className="relative overflow-hidden">
        <AmbientGlow variant="warm" className="left-[-10%] top-[15%] h-96 w-96" />
        <AmbientGlow variant="cool" className="right-[-8%] top-[45%] h-[28rem] w-[28rem]" />
        <AmbientGlow variant="warm" className="left-[5%] top-[80%] h-80 w-80" />
        <Hero />
        <FitCheck />
        <OfferBlock />
        <MeetRadoslava />
        <RegistrationForm />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
