import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'

export function PromoSection() {
  return (
    <section className="container py-14 lg:py-20" aria-labelledby="promo-heading">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#4338ca] to-[#1e1b4b] px-6 py-14 text-center sm:px-12 lg:py-20">
          {/* Decorative layer */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-accent/40 blur-3xl" />
            <Sparkles className="absolute left-[12%] top-10 h-6 w-6 animate-float text-white/40" />
            <Sparkles className="absolute bottom-12 right-[14%] h-8 w-8 animate-float-slow text-white/25" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              The sdCart edit
            </p>
            <h2
              id="promo-heading"
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
            >
              Better products. Better prices.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              Discover selected products with exclusive savings — use the code below at checkout for 10% off
              orders over $50.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-dashed border-white/40 bg-white/10 px-5 py-2.5 backdrop-blur">
              <span className="font-mono text-sm font-bold tracking-[0.2em] text-white">WELCOME10</span>
              <span className="text-xs text-white/70">· 10% off over $50</span>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-white px-8 text-base text-primary shadow-pop transition-transform duration-200 hover:scale-[1.02] hover:bg-white active:scale-[0.98]"
              >
                <Link to="/products">
                  Explore deals
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
