import { Link } from 'react-router-dom'
import { Award, HeartHandshake, Lightbulb, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

const VALUES = [
  { icon: Lightbulb, title: 'Quality first', text: 'We hand-pick every product for durability, value and design.' },
  { icon: HeartHandshake, title: 'Customer obsessed', text: 'Fast support, easy returns and honest pricing — always.' },
  { icon: Rocket, title: 'Fast delivery', text: 'Reliable shipping partners get orders to your door quickly.' },
  { icon: Award, title: 'Better every day', text: 'We measure ourselves by your satisfaction, not just sales.' },
]

export default function AboutPage() {
  return (
    <div className="container py-12">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">About sdCart</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          sdCart is a modern online store built around one idea: shopping should be simple, transparent and
          genuinely enjoyable.
        </p>
      </header>

      <section className="mx-auto mt-12 max-w-3xl space-y-4 text-muted-foreground">
        <p>
          We started sdCart to fix the parts of e-commerce that frustrate everyone: hidden fees, unreliable
          stock, and checkouts that feel like obstacle courses. Our catalog focuses on electronics, fashion,
          home essentials and sports gear — categories where quality really matters.
        </p>
        <p>
          Every order is fulfilled with care, every return is easy, and our support team is a real group of
          people who answer quickly. When you shop with sdCart, you know exactly what you're getting and what
          it costs — no surprises.
        </p>
      </section>

      <section className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Our values">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border bg-card p-6">
            <Icon className="h-7 w-7 text-primary" aria-hidden />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-lg bg-primary p-10 text-center text-primary-foreground">
        <h2 className="font-display text-2xl font-bold">Ready to shop?</h2>
        <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
          Browse thousands of products with free shipping over $50.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-6">
          <Link to="/products">Start shopping</Link>
        </Button>
      </section>
    </div>
  )
}
