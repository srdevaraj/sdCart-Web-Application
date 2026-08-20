export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Agreement to terms">
          <p>
            By accessing or using sdCart ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree with any part of these terms, please do not use the Service.
          </p>
        </Section>
        <Section title="2. Accounts">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You must provide accurate information when creating an
            account and keep it up to date.
          </p>
        </Section>
        <Section title="3. Orders and payment">
          <p>
            All orders are subject to acceptance and availability. We reserve the right to refuse or cancel an
            order for reasons including but not limited to pricing errors, insufficient stock, or suspected
            fraud. Prices are displayed in INR and include applicable taxes unless stated otherwise.
          </p>
        </Section>
        <Section title="4. Shipping and delivery">
          <p>
            Estimated delivery times are provided at checkout and are not guaranteed. Risk of loss passes to
            you upon delivery. Please review our shipping information before placing an order.
          </p>
        </Section>
        <Section title="5. Returns and refunds">
          <p>
            Eligible items may be returned within 30 days of delivery. Refunds are issued to the original
            payment method once the returned item is received and inspected. Certain items may not be
            eligible for return.
          </p>
        </Section>
        <Section title="6. Limitation of liability">
          <p>
            To the maximum extent permitted by law, sdCart shall not be liable for any indirect, incidental,
            special, consequential or punitive damages arising out of or related to your use of the Service.
          </p>
        </Section>
        <Section title="7. Changes to these terms">
          <p>
            We may update these Terms of Service from time to time. Continued use of the Service after
            changes are posted constitutes acceptance of the revised terms.
          </p>
        </Section>
        <Section title="8. Contact">
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:legal@sdcart.com" className="text-primary hover:underline">legal@sdcart.com</a>.
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
