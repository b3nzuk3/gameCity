import React, { useState } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const Contact = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, inquiryType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: 'Message sent',
        description: "We'll get back to you as soon as possible!",
      })

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: '',
      })

      setIsSubmitting(false)
    }, 1500)
  }

  // Common question data
  const faqs = [
    {
      question: 'What are your shipping times?',
      answer:
        'Standard shipping typically takes 3-5 business days within the continental US. Expedited shipping options are available at checkout.',
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'Yes, we ship to most countries worldwide. International shipping times vary by location, typically 7-14 business days.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day return policy on most items. Products must be in original packaging and undamaged. Custom builds have special return conditions.',
    },
    {
      question: 'Do you offer price matching?',
      answer:
        "Yes, we match prices from authorized retailers for identical products. Contact customer service with details of the competitor's offer.",
    },
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help. Reach
              out to us through any of the channels below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mb-4">
                <Mail className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">
                For general inquiries and support
              </p>
              <a
                href="mailto:gamecityelectronics@gmail.com"
                className="text-emerald-400 hover:text-emerald-300"
              >
                gamecityelectronics@gmail.com
              </a>
            </div>

            <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mb-4">
                <Phone className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-4">
                Speak directly with our support team
              </p>
              <a
                href="tel:0712248706"
                className="text-emerald-400 hover:text-emerald-300"
              >
                0712248706
              </a>
            </div>

            <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mb-4">
                <MapPin className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Visit Us</h3>
              <p className="text-muted-foreground mb-4">
                Our retail store and service center
              </p>
              <a
                href="https://www.google.com/maps/place/GAMECITY+ELECTRONICS/@-1.2835,36.8247986,17z/data=!4m6!3m5!1s0x182f11ff319a2a71:0x23dfb4aee72fab6f!8m2!3d-1.2834756!4d36.8245877!16s%2Fg%2F11rcy9p60j?entry=ttu&g_ep=EgoyMDI1MDYwNC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 not-italic"
              >
                GAMECITY ELECTRONICS
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="bg-forest-900 border-forest-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="bg-forest-900 border-forest-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium mb-1"
                    >
                      Inquiry Type
                    </label>
                    <Select
                      onValueChange={handleSelectChange}
                      value={formData.inquiryType}
                    >
                      <SelectTrigger className="bg-forest-900 border-forest-700">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent className="bg-forest-800 border-forest-700">
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">
                          Technical Support
                        </SelectItem>
                        <SelectItem value="orders">Order Status</SelectItem>
                        <SelectItem value="returns">
                          Returns & Refunds
                        </SelectItem>
                        <SelectItem value="wholesale">
                          Wholesale & Business
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-1"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of your inquiry"
                      required
                      className="bg-forest-900 border-forest-700"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                      className="bg-forest-900 border-forest-700 resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Business Hours Section */}
            <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 mt-8">
              <div className="flex items-start mb-4">
                <Clock className="h-5 w-5 text-emerald-400 mt-0.5 mr-2" />
                <h3 className="text-lg font-medium">Business Hours</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Contact
