import WorldClock from "../components/WorldClock";
import ControlRoomDashboard from "../components/ControlRoomDashboard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white font-sans text-zinc-900 overflow-x-hidden dark:bg-black dark:text-zinc-100">

      {/* Header / Branding */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic italic-font">
            SYNTHIA <span className="text-zinc-400">3.0</span>
          </h1>
          <p className="text-sm uppercase tracking-[0.3em] font-mono text-zinc-500">
            Digital CEO & AI Agency Control Room
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs uppercase tracking-widest text-zinc-400">Client Platform</span>
          <span className="text-xl font-bold border-b-2 border-zinc-900 dark:border-white pb-1">IVETTE MILO</span>
        </div>
      </header>

      {/* Main Dashboard Section */}
      <main className="flex w-full max-w-7xl flex-col gap-12 px-8 pb-32 md:px-16">

        {/* World Clock Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400">Global Operations Time</h2>
          </div>
          <WorldClock />
        </section>

        <ControlRoomDashboard />

        {/* Action Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Synthia Superagent"
            description="Manage your dedicated AI CEO. Execute tasks, coordinate agents, and review strategic reports."
            status="ACTIVE"
          />
          <DashboardCard
            title="Repository Fleet"
            description="Monitor all Kupuri Media codebases. Assign agent janitors for UI/UX upgrades and PRD generation."
            status="PENDING"
          />
          <DashboardCard
            title="Agency Analytics"
            description="High-level dashboard for arbitrage and market efficiency across LATAM and US high-value sectors."
            status="LOCKED"
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full p-8 text-center text-[10px] uppercase tracking-widest text-zinc-500 border-t border-zinc-100 dark:border-zinc-900">
        © 2026 KUPURI MEDIA™ // AI LEADERSHIP SYSTEMS // ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}

function DashboardCard({ title, description, status }: { title: string, description: string, status: string }) {
  return (
    <div className="group relative flex flex-col p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all hover:border-zinc-900 dark:hover:border-white cursor-pointer overflow-hidden">
      <div className="flex justify-between items-start mb-12">
        <h3 className="text-2xl font-bold tracking-tight italic uppercase">{title}</h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${status === 'ACTIVE' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[200px]">
        {description}
      </p>
      <div className="absolute bottom-4 right-8 transform translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
        <span className="text-2xl">→</span>
      </div>
    </div>
  );
}
