import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    question: "What's the best time to visit India?",
    answer:
      "The best time to visit India depends on the region, but generally, October to March is considered the most pleasant season for most parts of the country. However, if you're planning to visit the Himalayan regions, summer months (April to June) are ideal.",
  },
  {
    question: "Do I need a visa to visit India?",
    answer:
      "Most international travelers need a visa to enter India. The Indian government offers e-Visa facilities for many countries. It's best to check the official Indian government visa website or consult with your nearest Indian embassy for the most up-to-date visa requirements.",
  },
  {
    question: "Is it safe to travel in India?",
    answer:
      "India is generally safe for tourists, but like any other country, it's important to take standard precautions. Be aware of your surroundings, keep your belongings secure, and respect local customs. It's also advisable to check travel advisories before your trip.",
  },
  {
    question: "What vaccinations do I need for India?",
    answer:
      "Recommended vaccinations for India may include Hepatitis A, Typhoid, and Tetanus. It's best to consult with your doctor or a travel clinic at least 4-6 weeks before your trip for personalized medical advice based on your health history and travel plans.",
  },
  {
    question: "What's the currency in India?",
    answer:
      "The currency in India is the Indian Rupee (INR). ATMs are widely available in cities and tourist areas. Credit cards are accepted in most hotels and larger establishments, but it's good to carry some cash for smaller vendors and rural areas.",
  },
  {
    question: "What languages are spoken in India?",
    answer:
      "India has 22 officially recognized languages. Hindi is the most widely spoken, and English is commonly used in tourism and business. Each state may have its own official language(s), but you can usually get by with English in most tourist areas.",
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#87A2FF]">Frequently Asked Questions</h1>

      <Card className="border-[#C4D7FF]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#87A2FF]">
            Common Questions About Traveling in India
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-8 border-[#C4D7FF]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#87A2FF]">Still Have Questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you couldn't find the answer to your question in our FAQ, please don't hesitate to reach out to us
            directly. Our team of travel experts is always ready to assist you with any queries you may have about
            traveling in India.
          </p>
          <p className="mb-4">
            You can contact us through our{" "}
            <a href="/contact" className="text-[#87A2FF] hover:underline">
              contact page
            </a>
            , or call us directly at +91 123 456 7890.
          </p>
          <p>We're here to ensure you have all the information you need to plan an unforgettable trip to India!</p>
        </CardContent>
      </Card>
    </div>
  )
}
