"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Compass, Star, ArrowRight, MapPin, Users, Shield, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveGlobe } from "./components/InteractiveGlobe"

const features = [
  {
    icon: Compass,
    title: "Explore Destinations",
    body: "Discover India's most beautiful and culturally rich locations, curated by travellers.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: MapPin,
    title: "Plan Your Trip",
    body: "Build multi-stop itineraries tailored to your schedule, budget, and interests.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Sparkles,
    title: "Local Experiences",
    body: "Uncover authentic cultural gems — festivals, food trails, and hidden escapes.",
    color: "from-rose-500/10 to-pink-500/10 border-rose-200/50 dark:border-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
]

const stats = [
  { label: "Destinations", value: "500+", icon: MapPin },
  { label: "Happy Travellers", value: "12k+", icon: Users },
  { label: "5-Star Reviews", value: "3.4k", icon: Star },
  { label: "Safe & Trusted", value: "100%", icon: Shield },
]

const destinations = [
  { name: "Taj Mahal", location: "Agra, Uttar Pradesh", tag: "Heritage", gradient: "from-slate-700 to-slate-900" },
  { name: "Kerala Backwaters", location: "Alleppey, Kerala", tag: "Nature", gradient: "from-teal-700 to-emerald-900" },
  { name: "Golden Temple", location: "Amritsar, Punjab", tag: "Spiritual", gradient: "from-amber-700 to-yellow-900" },
  { name: "Goa Beaches", location: "Panaji, Goa", tag: "Beach", gradient: "from-sky-600 to-blue-900" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-gradient">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center lg:text-left pt-10 lg:pt-0"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 font-medium mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Your AI-powered India travel guide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                Discover Incredible India<br className="hidden sm:block" />
                <span className="text-white/80 font-normal">one journey at a time</span>
              </h1>

              <p className="text-lg text-white/75 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                From the snow-capped Himalayas to the sun-soaked beaches of Goa — WanderGuide helps you plan, explore, and experience India like never before.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link href="/locations">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-xl shadow-black/10 gap-2">
                    Start Exploring
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                    Read Reviews
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
                {stats.map(({ label, value }) => (
                  <div key={label} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-xs text-white/65 mt-0.5 font-medium uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full aspect-square max-w-[400px] lg:max-w-[500px] mx-auto lg:mr-0 mt-8 lg:mt-0"
            >
              {/* Interactive Globe */}
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <InteractiveGlobe className="w-full h-full" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything you need to explore India</h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            WanderGuide brings together smart tools and local knowledge to make every trip extraordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body, color, iconColor }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group rounded-2xl border bg-gradient-to-br ${color} p-7 transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`w-11 h-11 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm mb-5 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Destinations ─────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Iconic Destinations</h2>
              <p className="text-muted-foreground text-sm mt-1">A taste of what awaits you</p>
            </div>
            <Link href="/locations" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map(({ name, location, tag, gradient }, i) => (
              <motion.div 
                key={name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href="/locations" className="group relative rounded-2xl overflow-hidden aspect-[3/4] block h-full">
                  <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white font-semibold text-base leading-tight">{name}</div>
                    <div className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location}
                    </div>
                  </div>
                  <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-white/20 rounded-2xl transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-5">
            <Star className="w-3.5 h-3.5 fill-current" />
            Trusted by 12,000+ adventurers
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to plan your next adventure?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Create a free account and start building your India itinerary with smart suggestions, community reviews, and real-time travel data.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" className="bg-brand-gradient text-white hover:opacity-90 gap-2 shadow-lg shadow-primary/20">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/locations">
              <Button size="lg" variant="outline">
                Browse destinations
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
