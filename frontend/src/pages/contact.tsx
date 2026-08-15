import { useState, type FormEvent } from 'react'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/common/form-field'

/**
 * The backend exposes no contact endpoint, so submissions open a pre-filled
 * email to support instead of failing silently.
 */
export default function ContactPage() {
  const [sending, setSending] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const subject = String(data.get('subject') ?? '')
    const message = String(data.get('message') ?? '')

    setSending(true)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    const mailto = `mailto:support@sdcart.com?subject=${encodeURIComponent(subject || 'Question from sdCart website')}&body=${body}`
    window.location.href = mailto
    setSending(false)
    toast.success('Opening your email client…')
  }

  return (
    <div className="container py-12">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Contact us</h1>
        <p className="mt-4 text-muted-foreground">
          Questions about an order, a product or your account? We usually reply within one business day.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="ct-name" required>
              <Input id="ct-name" name="name" autoComplete="name" required />
            </FormField>
            <FormField label="Email" htmlFor="ct-email" required>
              <Input id="ct-email" name="email" type="email" autoComplete="email" required />
            </FormField>
          </div>
          <FormField label="Subject" htmlFor="ct-subject">
            <Input id="ct-subject" name="subject" placeholder="How can we help?" />
          </FormField>
          <FormField label="Message" htmlFor="ct-message" required>
            <Textarea id="ct-message" name="message" rows={5} required placeholder="Tell us more…" />
          </FormField>
          <Button type="submit" disabled={sending}>
            <Send className="h-4 w-4" aria-hidden /> Send message
          </Button>
        </form>

        <aside className="space-y-4">
          {[
            { icon: Mail, title: 'Email', lines: ['support@sdcart.com', 'orders@sdcart.com'] },
            { icon: Phone, title: 'Phone', lines: ['+1 (555) 010-2020', 'Mon–Fri, 9am–6pm PT'] },
            { icon: MapPin, title: 'Visit us', lines: ['100 Market Street', 'San Francisco, CA 94105'] },
            { icon: Clock, title: 'Support hours', lines: ['24/7 order tracking', 'Email replies < 24h'] },
          ].map(({ icon: Icon, title, lines }) => (
            <div key={title} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold">{title}</h2>
                {lines.map((line) => (
                  <p key={line} className="text-sm text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
