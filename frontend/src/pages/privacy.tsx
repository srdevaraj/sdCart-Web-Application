export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Information we collect">
          <p>
            We collect information you provide directly, such as your name, email address, phone number and
            shipping address when you create an account or place an order. We also collect transactional
            data related to your orders and payments.
          </p>
        </Section>
        <Section title="2. How we use your information">
          <p>
            Your information is used to process orders, provide customer support, improve our services and
            send order-related communications. We never sell your personal information to third parties.
          </p>
        </Section>
        <Section title="3. Payment security">
          <p>
            Payment details are handled by our payment providers using industry-standard encryption. We do not
            store full card numbers on our servers.
          </p>
        </Section>
        <Section title="4. Data retention">
          <p>
            We retain account and order data for as long as your account is active and as needed to comply
            with legal obligations. You may request deletion of your account at any time.
          </p>
        </Section>
        <Section title="5. Cookies">
          <p>
            We use essential cookies to keep you signed in and to remember your cart. These are required for
            the Service to function.
          </p>
        </Section>
        <Section title="6. Your rights">
          <p>
            Depending on your jurisdiction, you may have the right to access, correct or delete your personal
            data. Contact us at{' '}
            <a href="mailto:privacy@sdcart.com" className="text-primary hover:underline">privacy@sdcart.com</a>{' '}
            to exercise these rights.
          </p>
        </Section>
        <Section title="7. Contact">
          <p>
            If you have questions about this policy, contact us at{' '}
            <a href="mailto:privacy@sdcart.com" className="text-primary hover:underline">privacy@sdcart.com</a>.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
