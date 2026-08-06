import { EcoShell } from "@/components/eco/eco-shell";
import { Navbar } from "@/components/eco/navbar";
import { Hero } from "@/components/eco/hero";
import { LiveStats } from "@/components/eco/live-stats";
import { CalculatorWizard } from "@/components/eco/calculator-wizard";
import { ResultsDashboard } from "@/components/eco/results-dashboard";
import { Estimators } from "@/components/eco/estimators";
import { Achievements } from "@/components/eco/achievements";
import { Footer } from "@/components/eco/footer";

export default function Home() {
  return (
    <EcoShell>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <LiveStats />
        <CalculatorWizard />
        <ResultsDashboard />
        <Estimators />
        <Achievements />
      </main>
      <Footer />
    </EcoShell>
  );
}
