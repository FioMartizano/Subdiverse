import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PHASES = [
  {
    label: "Registration",
    number: "01",
    badge: "Phase 01",
    // Accent colors using primary and secondary theme styles
    badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
    numberColor: "text-secondary opacity-25", // Uses your theme secondary color (Yellow)
    markerBg: "bg-secondary",
    iconHover: "group-hover:bg-primary group-hover:text-white group-hover:border-primary",
    steps: [
      { title: "Create Account", desc: "Click Sign Up and fill in your personal and residential information. Upload your valid ID for account verification.", icon: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" },
      { title: "Verify Details", desc: "Confirm your email address and your account will be reviewed by the administrator. A notification will be sent to your email and you will be able to access resident features once your account is approved and activated.", icon: "M4 5h16v14H4V5zm4 4h.01M4 15l4-4 3 3 5-5 4 4" },
      { title: "Login", desc: "Once approved, log in using your registered email and password to access the resident portal.", icon: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V7l8-4z" },
      { title: "Complete your Verification", desc: "Submit additional verification requirements, such as proof of billing, through your User Settings to unlock services that require a verified resident account.", icon: "M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
    ],
  },
  {
    label: "Services",
    number: "02",
    badge: "Phase 02",
    badgeStyle: "bg-emerald-100 text-emerald-900 border-emerald-300",
    numberColor: "text-primary opacity-20", // Uses your theme primary color (Green)
    markerBg: "bg-primary",
    iconHover: "group-hover:bg-secondary group-hover:text-slate-900 group-hover:border-secondary",
    steps: [
      { title: "Browse Directory", desc: "Explore local HOA news, guidelines, and subdivision facilities.", icon: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V7l8-4z" },
      { title: "Book Facility", desc: "Reserve clubhouse or sports facilities directly online.", icon: "M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
      { title: "Submit Request", desc: "Send maintenance or administrative requests to HOA staff.", icon: "M4 5h16v14H4V5zm4 4h.01M4 15l4-4 3 3 5-5 4 4" },
      { title: "Track Status", desc: "Get real-time updates on your active permits and requests.", icon: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" },
      { title: "Community Updates", desc: "Stay informed with push notifications and community events.", icon: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V7l8-4z" },
    ],
  },
];

function Step({ step, index, iconHover }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="flex gap-4 items-start group"
    >
      <span className={`shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition-colors duration-300 ${iconHover}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d={step.icon} />
        </svg>
      </span>
      <div className="pt-0.5">
        <h4 className="font-heading text-base font-semibold text-slate-900 mb-1">
          {step.title}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

function PhaseColumn({ phase, fillTop }) {
  return (
    <div
      className="relative overflow-hidden bg-white/90 border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
    >
      {/* Background Decorative Large Number (Color Coded to Secondary / Primary) */}
      <span
        aria-hidden="true"
        className={`absolute -top-6 -right-2 font-heading font-extrabold leading-none select-none pointer-events-none ${phase.numberColor}`}
        style={{ fontSize: "11rem" }}
      >
        {phase.number}
      </span>

      <div className="relative z-10">
        {/* Phase Header Badge & Title */}
        <div className="flex items-center gap-3 mb-10">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${phase.badgeStyle}`}>
            {phase.badge}
          </span>
          <h3 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
            {phase.label}
          </h3>
        </div>

        {/* Dynamic Vertical Scroll Line + Steps */}
        <div className="relative flex gap-6">
          <div className="relative w-1 shrink-0 rounded-full bg-slate-200/80 my-1">
            <motion.div
              style={{ top: fillTop, height: "6rem" }}
              className={`absolute left-0 w-1 rounded-full ${phase.markerBg}`}
            />
          </div>
          <div className="flex-1 flex flex-col gap-7">
            {phase.steps.map((step, i) => (
              <Step key={i} step={step} index={i} iconHover={phase.iconHover} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GetStarted() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.85", "end 0.5"],
  });

  const fillTop = useTransform(
    scrollYProgress,
    (v) => `calc((100% - 6rem) * ${v})`
  );

  return (
    <section className="bg-slate-100/70 py-20 md:py-28 px-6 md:px-12 lg:px-16 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto">
        {/* Header Title Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
            How It Works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Get Started in Two Simple Phases
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Follow our straightforward onboarding process to gain full access to community services and features.
          </p>
        </div>

        {/* Dynamic Phase Cards */}
        <div ref={trackRef} className="grid md:grid-cols-2 gap-8">
          {PHASES.map((phase) => (
            <PhaseColumn key={phase.label} phase={phase} fillTop={fillTop} />
          ))}
        </div>

        
      </div>
    </section>
  );
}