import { CreditCard, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { MotionReveal, StaggerContainer, StaggerItem } from '@/components/common/motion'

const BENEFITS = [
  { icon: Truck, title: 'Fast delivery', text: 'On all orders over $50, delivered in 2–5 business days.' },
  { icon: RefreshCcw, title: 'Easy returns', text: '30-day hassle-free returns on every purchase.' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Encrypted payments and buyer protection.' },
  { icon: CreditCard, title: 'Flexible payment', text: 'Cards, PayPal and cash on delivery available.' },
]

export function BenefitsSection() {
  return (
    <section className="container pb-16 lg:pb-24" aria-label="Store benefits">
      <MotionReveal>
        <SectionHeading
          align="center"
          eyebrow="Why shop with sdCart?"
          title="A store designed around you"
          subtitle="Every order backed by the basics that matter — speed, trust and flexibility."
        />
      </MotionReveal>

      <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <StaggerItem key={title} className="h-full">
            <div className="group h-full rounded-2xl border bg-card p-6 card-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:shadow-glow group-hover:scale-105">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
