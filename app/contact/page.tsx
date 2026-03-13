import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#4A67C0]">Contact WanderGuide</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-[#6A87E0]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#4A67C0]">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input id="name" placeholder="Your Name" className="mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input id="email" type="email" placeholder="your@email.com" className="mt-1" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <Textarea id="message" placeholder="Your message here..." className="mt-1" />
              </div>
              <Button className="w-full bg-[#4A67C0] hover:bg-[#6A87E0] text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#6A87E0]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#4A67C0]">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="text-[#4A67C0]" />
              <span>info@wanderguide.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="text-[#4A67C0]" />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="text-[#4A67C0]" />
              <span>123 Travel Street, New Delhi, India 110001</span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Office Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
