import React from 'react'
import Layout from '../components/Layout'

const PrivacyPolicy = () => (
  <Layout>
    <div className="container mx-auto px-4 py-12 mt-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-yellow-400">
        Privacy Policy
      </h1>
      <p className="mb-4 text-muted-foreground">
        This Privacy Policy describes how Gamecity Electronics ("we", "us", or
        "our") collects, uses, and protects your personal information when you
        use our website and services.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        1. Information We Collect
      </h2>
      <ul className="list-disc ml-6 mb-4 text-muted-foreground">
        <li>
          Personal information you provide (name, email, phone, address, etc.)
        </li>
        <li>Order and payment information</li>
        <li>Usage data and cookies</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc ml-6 mb-4 text-muted-foreground">
        <li>To process orders and provide services</li>
        <li>To communicate with you about your account or orders</li>
        <li>To improve our website and services</li>
        <li>For marketing and promotional purposes (with your consent)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        3. Information Sharing
      </h2>
      <p className="mb-4 text-muted-foreground">
        We do not sell your personal information. We may share information with
        trusted third parties for order fulfillment, payment processing, or
        legal compliance.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Security</h2>
      <p className="mb-4 text-muted-foreground">
        We implement reasonable security measures to protect your data. However,
        no method of transmission over the Internet is 100% secure.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Your Rights</h2>
      <ul className="list-disc ml-6 mb-4 text-muted-foreground">
        <li>Access, update, or delete your personal information</li>
        <li>Opt out of marketing communications</li>
        <li>Request information about our data practices</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        6. Changes to This Policy
      </h2>
      <p className="mb-4 text-muted-foreground">
        We may update this Privacy Policy from time to time. Changes will be
        posted on this page with an updated effective date.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">7. Contact Us</h2>
      <p className="mb-4 text-muted-foreground">
        If you have any questions about this Privacy Policy, please contact us
        at{' '}
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

export default PrivacyPolicy
