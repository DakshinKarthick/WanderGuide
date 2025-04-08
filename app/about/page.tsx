import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#87A2FF]">About TravelIndia</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            At TravelIndia, our mission is to showcase the incredible diversity and beauty of India to travelers from
            around the world. We believe in creating immersive, authentic experiences that connect visitors with the
            heart and soul of this magnificent country.
          </p>
          <p>
            From the snow-capped peaks of the Himalayas to the sun-kissed beaches of Goa, from the bustling streets of
            Mumbai to the serene backwaters of Kerala, we're here to guide you through the wonders of India.
          </p>
        </div>
        <div className="relative h-64 md:h-auto">
          <Image
            src="/placeholder.svg?height=400&width=600"
            alt="Scenic view of India"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose TravelIndia?</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="border-[#C4D7FF]">
          <CardHeader>
            <CardTitle className="text-[#87A2FF]">Expert Local Guides</CardTitle>
          </CardHeader>
          <CardContent>
            Our team of experienced local guides ensures you get an authentic and insightful experience of India's
            culture and heritage.
          </CardContent>
        </Card>
        <Card className="border-[#C4D7FF]">
          <CardHeader>
            <CardTitle className="text-[#87A2FF]">Customized Itineraries</CardTitle>
          </CardHeader>
          <CardContent>
            We tailor each journey to your preferences, ensuring a unique and personalized travel experience for every
            visitor.
          </CardContent>
        </Card>
        <Card className="border-[#C4D7FF]">
          <CardHeader>
            <CardTitle className="text-[#87A2FF]">Responsible Tourism</CardTitle>
          </CardHeader>
          <CardContent>
            We're committed to sustainable travel practices that benefit local communities and preserve India's natural
            beauty.
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-center">Our Team</h2>
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[
          { name: "Priya Sharma", role: "Founder & CEO" },
          { name: "Rahul Patel", role: "Head of Operations" },
          { name: "Anita Desai", role: "Lead Travel Curator" },
          { name: "Vikram Singh", role: "Customer Experience Manager" },
        ].map((member, index) => (
          <Card key={index} className="border-[#C4D7FF]">
            <CardHeader>
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src={`/placeholder.svg?height=100&width=100&text=${member.name.split(" ")[0][0]}${member.name.split(" ")[1][0]}`}
                  alt={member.name}
                  layout="fill"
                  className="rounded-full"
                />
              </div>
              <CardTitle className="text-center text-[#87A2FF]">{member.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">{member.role}</CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Explore India?</h2>
        <Button className="bg-[#87A2FF] hover:bg-[#FFD7C4] text-white hover:text-gray-800">
          Start Planning Your Trip
        </Button>
      </div>
    </div>
  )
}
