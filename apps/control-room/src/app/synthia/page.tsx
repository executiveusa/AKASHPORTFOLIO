"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Synthia 3.0 Landing Page
 * Platform for AI agents, sphere coordination, and autonomous operations
 * Accessible from Kupuri Media footer → links back to dashboards
 */
export default function SynthiaLanding() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Back to Kupuri */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="text-sm uppercase tracking-[0.15em] text-purple-300 hover:text-purple-100 transition"
        >
          ← Kupuri Media
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px]" />
        </div>

        {/* Animated orbs */}
        <motion.div
          className="absolute w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />

        {/* Content */}
        <motion.div
          className="relative text-center max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tighter">
            <span className="text-white">SYNTHIA™</span>
            <br />
            <span className="text-3xl md:text-5xl font-light text-purple-300">
              3.0 Sistema Operativo Agéntico
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tu CEO invisible. Automatiza operaciones, coordina 9 agentes de IA especializados y genera ingresos
            autónomos en toda Latinoamérica.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
            >
              Entrar al Dashboard
            </Link>
            <Link
              href="/cockpit"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition transform hover:scale-105"
            >
              Ver Coordinadora
            </Link>
          </div>

          {/* Spheres Preview */}
          <motion.div
            className="grid grid-cols-3 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { name: "SYNTHIA", role: "Coordinadora General", color: "#8b5cf6" },
              { name: "ALEX", role: "Estratega Ejecutivo", color: "#d4af37" },
              { name: "CAZADORA", role: "Cazadora de Oportunidades", color: "#ef4444" },
              { name: "FORJADORA", role: "Arquitecta de Sistemas", color: "#22c55e" },
              { name: "SEDUCTORA", role: "Closera Maestra", color: "#eab308" },
              { name: "CONSEJO", role: "Consejero Mayor", color: "#1d4ed8" },
              { name: "DR. ECONOMÍA", role: "Analista Financiero", color: "#f97316" },
              { name: "DRA. CULTURA", role: "Estratega Cultural", color: "#f43f5e" },
              { name: "ING. TEKNOS", role: "Ingeniero de Sistemas", color: "#06b6d4" },
            ].map((sphere, idx) => (
              <motion.div
                key={sphere.name}
                className="p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition"
                style={{ borderLeftColor: sphere.color, borderLeftWidth: "3px" }}
                whileHover={{ scale: 1.05, borderColor: sphere.color }}
              >
                <p className="font-bold text-sm" style={{ color: sphere.color }}>
                  {sphere.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{sphere.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-purple-300 text-sm uppercase tracking-widest">Desplaza para saber más</div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-24 px-6 bg-slate-800/50 backdrop-blur">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">Características Principales</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "9 Agentes Especializados",
                desc: "Cada esfera con rol único: estrategia, ventas, finanzas, cultura, tecnología y más.",
              },
              {
                icon: "🎯",
                title: "Automatización Inteligente",
                desc: "Orquesta tareas complejas sin intervención manual. Aprende y se adapta en tiempo real.",
              },
              {
                icon: "💰",
                title: "Generación de Ingresos",
                desc: "Arbitrage, consultoría, leads, contenido. Múltiples flujos de ingreso autónomos.",
              },
              {
                icon: "🌎",
                title: "Cobertura LATAM",
                desc: "Opera en toda Latinoamérica con soporte multiidioma y múltiples zonas horarias.",
              },
              {
                icon: "📊",
                title: "Análisis en Tiempo Real",
                desc: "Dashboards intuitivos, métricas de rendimiento, alertas automáticas.",
              },
              {
                icon: "🔐",
                title: "Seguridad & Compliance",
                desc: "Auditoría completa, circuit breakers, control de acceso basado en roles.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-purple-500 transition"
                whileHover={{ y: -5, borderColor: "#a78bfa" }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative w-full py-16 px-6 text-center bg-linear-to-t from-purple-900/30 to-transparent">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-6">
            ¿Listo para automatizar tus operaciones?
          </h3>
          <p className="text-gray-300 mb-8">
            Accede al dashboard de Synthia 3.0 y comienza a coordinar tus agentes hoy mismo.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-10 py-4 bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-lg transition transform hover:scale-105"
          >
            Abrir Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-6 text-center text-gray-400 text-sm">
        <p>
          © 2026 Synthia™ 3.0 • Powered by{" "}
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Kupuri Media
          </Link>
        </p>
      </footer>
    </div>
  );
}
