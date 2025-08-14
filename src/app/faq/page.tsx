import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I book a ticket?",
    answer: "You can book a ticket by using the search form on our homepage. Select your departure and arrival locations, travel date, and number of passengers. Then, choose your preferred route from the search results and proceed to payment.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept MTN Mobile Money (MoMo) and all major credit/debit cards. All transactions are secure and encrypted.",
  },
  {
    question: "Can I cancel my ticket?",
    answer: "Ticket cancellation policies vary by bus agency. Please check the cancellation policy of the respective bus operator at the time of booking. You can usually find this information in the booking details.",
  },
  {
    question: "How do I get my ticket after booking?",
    answer: "Once your booking is confirmed, your e-ticket will be sent to the email address and phone number you provided during the booking process.",
  },
  {
    question: "What is the AI Recommendation feature?",
    answer: "Our AI Recommendation feature suggests alternative routes and travel times based on your search history, popular travel patterns, and current bus availability. It helps you find the most convenient and efficient travel options.",
  },
   {
    question: "Do I need to create an account to book a ticket?",
    answer: "While you can book as a guest, creating an account allows you to view your booking history, save passenger details, and enjoy a faster checkout process in the future.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about using the ITIKE platform.
          </p>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card px-4">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
