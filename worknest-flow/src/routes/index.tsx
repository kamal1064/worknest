import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Calendar,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/worknest-logo.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Unified Workforce",
    desc: "Manage full-time and part-time employees in one elegant dashboard.",
  },
  {
    icon: Calendar,
    title: "Smart Attendance",
    desc: "Auto-mark present daily, log absences with a single click.",
  },
  {
    icon: Wallet,
    title: "Salary Automation",
    desc: "Daily-rate math, absent deductions and advances — calculated for you.",
  },
  {
    icon: TrendingUp,
    title: "Live Analytics",
    desc: "Headcount, payroll, attendance trends — always current.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Secure",
    desc: "Role-based access with bank-grade authentication and RLS.",
  },
  {
    icon: Sparkles,
    title: "Built for Speed",
    desc: "Snappy UI, instant search and zero-clutter workflows.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="WorkNest" width={36} height={36} className="rounded-md" />
          <span className="font-display text-lg font-bold tracking-tight">WorkNest</span>
        </div>
        <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#about" className="hover:text-foreground">
            About
          </a>
          <a href="#contact" className="hover:text-foreground">
            Contact
          </a>
        </nav>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button
              size="sm"
              className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90"
            >
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Workforce OS, reimagined
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-extrabold tracking-tight md:text-7xl">
            Run your team with <span className="text-gradient-brand">precision</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            WorkNest is a premium employee management system for modern companies — attendance,
            payroll, and analytics, beautifully unified.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90"
              >
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-20 max-w-5xl rounded-3xl border bg-card/70 p-2 shadow-elegant backdrop-blur"
        >
          <div className="rounded-2xl bg-gradient-sidebar p-6 md:p-10">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Active employees", value: "248" },
                { label: "Present today", value: "231" },
                { label: "Payroll month", value: "₹1.84L" },
                { label: "On-time rate", value: "97%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-sidebar-accent/60 p-5 text-left">
                  <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                    {s.label}
                  </div>
                  <div className="mt-2 font-display text-3xl font-bold text-sidebar-foreground">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Everything HR needs. Nothing it doesn't.
          </h2>
          <p className="mt-3 text-muted-foreground">Focused tools for the workforce of today.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-elegant"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-elegant">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="about" className="container mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-brand p-10 text-primary-foreground shadow-elegant md:p-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Built for the workforce of tomorrow.
          </h2>
          <p className="mt-3 max-w-2xl opacity-90">
            WorkNest replaces spreadsheets, paper logs, and disconnected tools with a single,
            premium workforce operating system. Made for ops teams who care about clarity.
          </p>
          <Link to="/register" className="mt-6 inline-block">
            <Button size="lg" variant="secondary">
              Create your workspace
            </Button>
          </Link>
        </div>
      </section>

      <footer id="contact" className="border-t">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={24} height={24} />
            <span>© {new Date().getFullYear()} WorkNest EMS</span>
          </div>
          <div>hello@worknest.app</div>
        </div>
      </footer>
    </div>
  );
}
