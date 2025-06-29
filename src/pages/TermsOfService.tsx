import React from 'react'
import Layout from '../components/Layout'

const TermsOfService = () => (
  <Layout>
    <div className="container mx-auto px-4 py-12 mt-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-yellow-400">
        Terms of Service
      </h1>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        1. Acceptance of Terms
      </h2>
      <p className="mb-4 text-muted-foreground">
        By accessing or using the Gamecity Electronics website and services, you
        agree to be bound by these Terms of Service.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. Use of Service</h2>
      <p className="mb-4 text-muted-foreground">
        You agree to use our services only for lawful purposes and in accordance
        with these terms.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Accounts</h2>
      <p className="mb-4 text-muted-foreground">
        You are responsible for maintaining the confidentiality of your account
        and password and for all activities that occur under your account.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Purchases</h2>
      <p className="mb-4 text-muted-foreground">
        All purchases are subject to our acceptance and product availability. We
        reserve the right to refuse or cancel any order.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        5. Intellectual Property
      </h2>
      <p className="mb-4 text-muted-foreground">
        All content on this site is the property of Gamecity Electronics or its
        licensors and is protected by copyright and other laws.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Termination</h2>
      <p className="mb-4 text-muted-foreground">
        We may terminate or suspend your access to our services at any time,
        without prior notice or liability, for any reason.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Disclaimers</h2>
      <p className="mb-4 text-muted-foreground">
        Our services are provided "as is" and "as available" without warranties
        of any kind.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        8. Limitation of Liability
      </h2>
      <p className="mb-4 text-muted-foreground">
        Gamecity Electronics shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of our services.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">9. Changes to Terms</h2>
      <p className="mb-4 text-muted-foreground">
        We reserve the right to update or change these Terms of Service at any
        time. Changes will be posted on this page with an updated effective
        date.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">10. Contact Us</h2>
      <p className="mb-4 text-muted-foreground">
        If you have any questions about these Terms, please contact us at{' '}
        <a
          href="mailto:gamecityelectronics@gmail.com"
          className="text-yellow-400 underline"
        >
          gamecityelectronics@gmail.com
        </a>
        .
      </p>
    </div>
  </Layout>
)

export default TermsOfService
