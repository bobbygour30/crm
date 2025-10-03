import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaChevronRight,
  FaPlay,
  FaQuoteLeft,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaStar,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced HomePage
 * - Tailwind-based styling (assumes Tailwind v2+/v3+ configured)
 * - Framer Motion for smooth transitions
 * - Responsive hero with compact lead-search form
 * - Glassmorphism cards, micro-interactions, and improved footer
 */

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [query, setQuery] = useState("");
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      alt: "Lead Management",
      title: "Master Your Sales Pipeline",
      subtitle: "Transform your sales process with intelligent tools",
      description:
        "LeadCRM empowers you to track, manage, and convert leads with precision, streamlining your entire sales workflow.",
      primaryCta: { text: "Get Started", to: "/dashboard" },
      secondaryCta: { text: "Try Free", to: "/login" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      alt: "Real-Time Analytics",
      title: "Actionable Insights",
      subtitle: "Make data-driven decisions in real time",
      description:
        "Our advanced analytics dashboard provides deep insights to optimize your sales strategy and boost conversion rates.",
      primaryCta: { text: "Explore Features", to: "/activity" },
      secondaryCta: { text: "Try Free", to: "/login" },
    },
    {
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      alt: "Task Automation",
      title: "Boost Productivity",
      subtitle: "Automate tasks, close deals faster",
      description:
        "Seamless workflow automation lets you focus on building relationships and driving revenue growth.",
      primaryCta: { text: "Try Now", to: "/tasks" },
      secondaryCta: { text: "Try Free", to: "/login" },
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const handlePrevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const handleNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  // Small "stat count" animation
  const [counts, setCounts] = useState({
    users: 0,
    leads: 0,
    csat: 0,
  });
  useEffect(() => {
    let start = Date.now();
    const dur = 1200;
    const target = { users: 10000, leads: 1000000, csat: 99 };
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setCounts({
        users: Math.floor(p * target.users),
        leads: Math.floor(p * target.leads),
        csat: Math.floor(p * target.csat),
      });
      if (p < 1) requestAnimationFrame(step);
    };
    step();
  }, []);

  return (
    <div className="bg-white text-gray-900 antialiased leading-relaxed">
      {/* HERO */}
      <header className="relative h-[calc(100vh-4rem)] min-h-[600px]">
        <AnimatePresence mode="wait">
          {slides.map(
            (slide, i) =>
              i === currentSlide && (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute inset-0"
                >
                  {/* Background image + subtle overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                    }}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/65 backdrop-blur-sm"></div>

                  {/* Content */}
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="w-full md:w-3/4 lg:w-2/3 text-white relative z-20">
                      <motion.h1
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
                      >
                        {slide.title}
                      </motion.h1>

                      <motion.p
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="mt-4 text-lg sm:text-xl md:text-2xl text-indigo-100 max-w-2xl"
                      >
                        {slide.subtitle} — {slide.description}
                      </motion.p>

                      {/* search / lead-capture form (insurance context) */}
                      <motion.form
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.7 }}
                        className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 max-w-3xl"
                        onSubmit={(e) => {
                          e.preventDefault();
                          // lightweight: simulate searching leads
                          if (!query.trim()) return;
                          window.location.href = `/leads?query=${encodeURIComponent(query)}`;
                        }}
                      >
                        <div className="flex gap-2 items-center">
                          <label htmlFor="leadSearch" className="sr-only">
                            Search leads or policies
                          </label>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 flex-1 shadow-sm">
                            <FaSearch className="text-white/80" />
                            <input
                              id="leadSearch"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Search leads, policy numbers, or client names (try: John Doe)"
                              className="bg-transparent placeholder-white/70 text-white outline-none w-full"
                            />
                          </div>

                          <button
                            type="submit"
                            className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:scale-[1.02] transition-transform shadow"
                          >
                            Lookup
                          </button>
                        </div>
                        <p className="text-xs text-white/70 mt-2">
                          Tip: use policy numbers (e.g. <span className="font-medium">POL-12345</span>) for quick results.
                        </p>
                      </motion.form>

                      {/* CTAs */}
                      <motion.div
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.8 }}
                        className="mt-6 flex flex-col sm:flex-row gap-3"
                      >
                        <Link
                          to={slide.primaryCta.to}
                          className="inline-flex items-center gap-3 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition"
                        >
                          {slide.primaryCta.text} <FaChevronRight />
                        </Link>
                        <Link
                          to={slide.secondaryCta.to}
                          className="inline-flex items-center gap-3 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
                        >
                          {slide.secondaryCta.text}
                        </Link>
                      </motion.div>
                    </div>

                    {/* right side promo card (small) */}
                    <div className="hidden lg:flex lg:w-1/3 justify-end items-start">
                      <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="bg-white/6 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-[360px] shadow-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-indigo-100">Average close time</p>
                            <div className="text-2xl font-bold mt-1">14 days</div>
                          </div>
                          <div className="bg-indigo-600/20 text-indigo-50 p-2 rounded-lg">
                            <FaChartLine />
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-indigo-200">
                          Automated workflows route leads to the right underwriter or broker — reduce manual handoffs and speed approvals.
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Link to="/demo" className="text-sm text-white/90 underline">
                            Request demo
                          </Link>
                          <span className="text-white/40">•</span>
                          <Link to="/contact" className="text-sm text-white/90 underline">
                            Contact sales
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* carousel controls */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
                    <button
                      onClick={handlePrevSlide}
                      aria-label="Previous"
                      className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition backdrop-blur"
                    >
                      <FaArrowLeft />
                    </button>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
                    <button
                      onClick={handleNextSlide}
                      aria-label="Next"
                      className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition backdrop-blur"
                    >
                      <FaArrowRight />
                    </button>
                  </div>

                  {/* indicators */}
                  <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 w-8 rounded-full transition-all duration-300 ${
                          idx === currentSlide ? "bg-white scale-105" : "bg-white/30"
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </header>

      <main className="pt-12">
        {/* Logo Cloud */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6"
            >
              <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
                Trusted by insurance brokers & enterprises
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
              {["Brokers Co", "InsureX", "PolicyHub", "Aegis", "Mercury", "Atlas"].map(
                (c, i) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-center p-3 rounded-lg bg-white/60 shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-10 w-28 flex items-center justify-center text-gray-600 font-medium">
                      {c}
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Benefits / cards */}
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to manage leads & policies</h2>
            <p className="mt-3 text-gray-600">
              CRM built for insurance — lead intake forms, policy tracking, risk scoring, broker assignments and more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaRocket className="h-6 w-6 text-indigo-600" />,
                title: "Automated Workflows",
                desc: "Trigger tasks, assign brokers, and update policy status automatically.",
              },
              {
                icon: <FaChartLine className="h-6 w-6 text-indigo-600" />,
                title: "Real-Time Analytics",
                desc: "Custom KPIs and dashboards to monitor pipeline performance.",
              },
              {
                icon: <FaUsers className="h-6 w-6 text-indigo-600" />,
                title: "Team Collaboration",
                desc: "Shared notes, activity timelines, and role-based access.",
              },
              {
                icon: <FaTasks className="h-6 w-6 text-indigo-600" />,
                title: "Policy Management",
                desc: "Track policies, renewals, and claims side-by-side with leads.",
              },
            ].map((b, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-100"
              >
                <div className="absolute -top-5 left-5 bg-indigo-50 p-3 rounded-xl shadow-sm">
                  {b.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{b.title}</h3>
                <p className="mt-3 text-gray-600">{b.desc}</p>
                <div className="mt-5">
                  <Link
                    to="/features"
                    className="text-indigo-600 font-semibold inline-flex items-center gap-2 group"
                  >
                    Learn more <FaChevronRight className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Features split with image */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="rounded-2xl p-2 bg-gradient-to-br from-indigo-100 to-purple-100">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Dashboard preview"
                    className="rounded-xl w-full h-auto shadow-lg"
                  />
                </div>

                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white">
                  <FaPlay />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h3 className="text-2xl font-bold mb-4">Intuitive lead & policy workflows</h3>
                <p className="text-gray-700 mb-6">
                  Manage the entire lifecycle — from first contact to policy issuance and renewals. Reduce
                  manual errors and provide consistent follow-ups with built-in automation.
                </p>

                <div className="space-y-4">
                  {[
                    "Pipeline customization for brokers & carriers",
                    "AI-assisted lead scoring",
                    "Automated renewals & reminders",
                    "Deep integrations with email and telephony",
                    "Comprehensive audit trails for compliance",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 text-indigo-600">
                        <FaCheck />
                      </div>
                      <div className="text-gray-700 font-medium">{f}</div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/features"
                  className="inline-flex items-center gap-2 mt-6 text-indigo-600 font-semibold group"
                >
                  Explore all features <FaChevronRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-indigo-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-3xl md:text-4xl font-bold">{counts.users.toLocaleString()}</div>
                <div className="text-indigo-100 mt-1">Active Users</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.06 }}
              >
                <div className="text-3xl md:text-4xl font-bold">{counts.leads.toLocaleString()}</div>
                <div className="text-indigo-100 mt-1">Leads Managed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                <div className="text-3xl md:text-4xl font-bold">{counts.csat}%</div>
                <div className="text-indigo-100 mt-1">Customer Satisfaction</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.18 }}
              >
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-indigo-100 mt-1">Support</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="text-3xl font-bold">Loved by brokers & insurers</h2>
              <p className="mt-3 text-gray-600">Hear from customers using LeadCRM for insurance workflows.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Sales Manager, Aegis Brokers",
                  image:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                  content:
                    "LeadCRM made it effortless to assign leads to the right underwriter fast. Renewals are automated and conversion is up.",
                },
                {
                  name: "Michael Lee",
                  role: "Founder, PolicyHub",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                  content:
                    "Dashboards give us the visibility we need to optimize premium offers and speed up underwriting decisions.",
                },
                {
                  name: "Emily Chen",
                  role: "Head of Partnerships, InsureX",
                  image:
                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                  content:
                    "Integrations were painless — email, telephony and our carrier connectors all flow through LeadCRM seamlessly.",
                },
              ].map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition relative"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-14 h-14 object-cover rounded-full mr-4 shadow-sm"
                    />
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-indigo-600">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-gray-600 italic mb-4">
                    <FaQuoteLeft className="inline mr-2 text-indigo-100" /> {t.content}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="h-5 w-5 text-yellow-400 mr-1" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold mb-4"
            >
              Ready to transform your broker workflows?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="text-lg text-indigo-100 max-w-2xl mx-auto mb-6"
            >
              Get started with a 14-day free trial, built-in broker routes, and compliance-ready audit trails.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow hover:shadow-xl transition"
              >
                Start Free Trial
              </Link>
              <Link
                to="/demo"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Request a Demo
              </Link>
            </div>

            <p className="mt-4 text-indigo-200">No credit card required • Free 14-day trial</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white">LC</span>
                </div>
                <div>
                  <div className="text-white font-semibold">LeadCRM</div>
                  <div className="text-xs text-gray-400">Insurance-ready CRM</div>
                </div>
              </div>
              <p className="text-gray-400">
                Empowering brokers and insurers with the tools to manage leads, policies, and renewals — all in one place.
              </p>

              <div className="flex gap-3 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaTwitter />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaLinkedin />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaFacebook />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#">Pricing</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
                <li>
                  <a href="#">Updates</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Webinars</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">Legal</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div>© {new Date().getFullYear()} LeadCRM. All rights reserved.</div>
            <div className="flex gap-6 mt-3 md:mt-0">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;