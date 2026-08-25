import { useState, type FormEvent } from 'react'
import { Clock, Mail, MapPin, Phone, Send, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/common/form-field'
import { MotionReveal } from '@/components/common/motion'

/**
 * The backend exposes no contact endpoint, so submissions open a pre-filled
 * email to support instead of failing silently.
 */
export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const newErrors: { name?: string; email?: string; message?: string } = {}
    if (!name.trim()) newErrors.name = 'Please enter your name'
    if (!email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!message.trim()) newErrors.message = 'Please enter your message'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please complete all required fields')
      return
    }

    setErrors({})
    setSending(true)

    const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`)
    const mailto = `mailto:sdcartbigmart@gmail.com?subject=${encodeURIComponent(
      subject.trim() || 'Question from sdCart website',
    )}&body=${body}`

    window.location.href = mailto
    setSending(false)
    toast.success('Opening your email client…')
  }

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-primary/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-96 right-0 h-80 w-80 rounded-full bg-accent-glow/10 blur-[120px]"
      />

      <div className="container relative z-10 py-12 lg:py-20 space-y-12">
        <MotionReveal>
          <header className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>We're Here to Help</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg text-balance">
              Questions about an order, a product, or your account? Our team is ready to assist you.
            </p>
          </header>
        </MotionReveal>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-12">
          {/* Contact Form */}
          <MotionReveal direction="left" className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl border bg-card p-6 sm:p-8 card-glow backdrop-blur-sm"
              noValidate
            >
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                  Send us a message
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill out the details below to open a direct email with our customer care team.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" htmlFor="ct-name" error={errors.name} required>
                  <Input
                    id="ct-name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                    }}
                    autoComplete="name"
                    placeholder="Jane Doe"
                    required
                  />
                </FormField>
                <FormField label="Email Address" htmlFor="ct-email" error={errors.email} required>
                  <Input
                    id="ct-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    autoComplete="email"
                    placeholder="jane@example.com"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Subject" htmlFor="ct-subject">
                <Input
                  id="ct-subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order enquiry, product question, etc."
                />
              </FormField>

              <FormField label="Message" htmlFor="ct-message" error={errors.message} required>
                <Textarea
                  id="ct-message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }))
                  }}
                  required
                  placeholder="Tell us how we can help you…"
                />
              </FormField>

              <Button type="submit" disabled={sending} size="lg" className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" aria-hidden />
                <span>{sending ? 'Preparing email…' : 'Send message'}</span>
              </Button>
            </form>
          </MotionReveal>

          {/* Contact Information Sidebar */}
          <MotionReveal direction="right" className="lg:col-span-5 space-y-4">
            {/* Email Card */}
            <div className="group rounded-2xl border bg-card p-5 card-glow transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Mail className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-foreground">Email Support</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Direct help for questions and orders</p>
                  <div className="mt-2 space-y-1">
                    <a
                      href="mailto:sdcartbigmart@gmail.com"
                      className="block text-sm font-medium text-primary hover:underline break-all"
                    >
                      sdcartbigmart@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group rounded-2xl border bg-card p-5 card-glow transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Phone className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-foreground">Phone Support</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Available Mon–Fri, 9am–6pm PT</p>
                  <a
                    href="tel:+918555984667"
                    className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    +91 (855) 598-4667
                  </a>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="group rounded-2xl border bg-card p-5 card-glow transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-foreground">Location</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    100 Market Street, San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="group rounded-2xl border bg-card p-5 card-glow transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Clock className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-foreground">Support Hours</h2>
                  <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>24/7 Automated Order Tracking</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Email Replies within 24 Hours</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </div>
  )
}
