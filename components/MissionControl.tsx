"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GlassCard from "./ui/GlassCard";
import Particles from "./Particles";

const tempData = [
  { m: "Jan", v: 0.2 },
  { m: "Feb", v: 0.28 },
  { m: "Mar", v: 0.31 },
  { m: "Apr", v: 0.35 },
  { m: "May", v: 0.4 },
  { m: "Jun", v: 0.44 },
  { m: "Jul", v: 0.5 },
];

const radarData = [
  { subject: "Reef Health", value: 62 },
  { subject: "Biodiversity", value: 74 },
  { subject: "Current Stability", value: 58 },
  { subject: "Plastic Load", value: 40 },
  { subject: "Sensor Coverage", value: 81 },
];

const pieData = [
  { name: "Healthy", value: 48, color: "#00D084" },
  { name: "At Risk", value: 34, color: "#00E5FF" },
  { name: "Critical", value: 18, color: "#0A4D8C" },
];

const metrics = [
  { label: "Surface temp anomaly", value: "+1.4°C", glow: "#00E5FF" },
  { label: "Ocean pH", value: "8.05", glow: "#00D084" },
  { label: "Active buoys online", value: "2,318", glow: "#00E5FF" },
  { label: "Microplastic index", value: "62.3", glow: "#0A4D8C" },
];

export default function MissionControl() {
  return (
    <section
      className="relative min-h-screen px-6 md:px-12 py-24"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #06304f 0%, #031B34 60%)",
      }}
    >
      <Particles count={10} kind="glow" color="#00E5FF" />

      <div className="text-center mb-14 relative z-10">
        <div className="font-mono text-[0.72rem] tracking-[0.3em] text-cyan">
          MISSION CONTROL
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] text-soft mt-3">
          The ocean, instrumented.
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-8">
        {metrics.map((m, i) => (
          <GlassCard key={m.label} glow={m.glow} delay={i * 0.08}>
            <div className="text-[0.75rem] text-muted tracking-wide">{m.label}</div>
            <div className="mt-2.5 font-display text-3xl font-bold text-soft">{m.value}</div>
            <div className="mt-3.5 h-[3px] rounded bg-white/10 overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: "70%", background: "linear-gradient(90deg, #00E5FF, #00D084)" }}
              />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        <GlassCard className="lg:col-span-2 h-72" delay={0.1}>
          <div className="text-sm text-muted mb-2">Temperature anomaly trend</div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={tempData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" stroke="#AFC6E0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#AFC6E0" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#031B34",
                  border: "1px solid #00E5FF44",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="v" stroke="#00E5FF" fill="url(#tempGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-72" delay={0.2}>
          <div className="text-sm text-muted mb-2">Reef status</div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#031B34",
                  border: "1px solid #00E5FF44",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-3 h-80" delay={0.3}>
          <div className="text-sm text-muted mb-2">Ecosystem index</div>
          <ResponsiveContainer width="100%" height="85%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#AFC6E033" />
              <PolarAngleAxis dataKey="subject" stroke="#AFC6E0" fontSize={11} />
              <Radar dataKey="value" stroke="#00D084" fill="#00D084" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </section>
  );
}
