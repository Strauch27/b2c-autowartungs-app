'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Wie funktioniert die Festpreis-Garantie?',
    answer: 'Sie erhalten vor der Buchung einen garantierten Festpreis für Ihre gewünschte Service-Leistung. Dieser Preis ist verbindlich und es kommen keine versteckten Kosten hinzu. Sollte es während der Reparatur zu unvorhergesehenen Befunden kommen, wird die Werkstatt Sie vor zusätzlichen Arbeiten immer kontaktieren und um Freigabe bitten.',
  },
  {
    question: 'Kann ich meinen Termin kostenlos stornieren?',
    answer: 'Ja, Sie können Ihren Termin bis zu 24 Stunden vor dem vereinbarten Zeitpunkt kostenlos stornieren oder verschieben. Dies geht ganz einfach über Ihr Kundenkonto oder per E-Mail.',
  },
  {
    question: 'Sind alle Werkstätten zertifiziert?',
    answer: 'Ja, alle unsere Partner-Werkstätten sind TÜV-zertifiziert und werden regelmäßig geprüft. Wir arbeiten nur mit Meisterbetrieben zusammen, die unsere Qualitätsstandards erfüllen. Alle Werkstätten verwenden Original- oder gleichwertige Ersatzteile.',
  },
  {
    question: 'Wie schnell bekomme ich einen Termin?',
    answer: 'In den meisten Fällen können wir Ihnen einen Termin innerhalb von 24-48 Stunden anbieten. Viele unserer Partner-Werkstätten haben sogar noch am gleichen Tag freie Kapazitäten. Sie sehen die nächsten verfügbaren Termine direkt bei der Buchung.',
  },
  {
    question: 'Was passiert, wenn zusätzliche Reparaturen nötig sind?',
    answer: 'Sollte die Werkstatt während der Inspektion zusätzliche Mängel feststellen, erhalten Sie eine digitale Freigabeanfrage mit detaillierter Erklärung und Kostenvoranschlag. Sie entscheiden dann bequem per App oder E-Mail, welche zusätzlichen Arbeiten durchgeführt werden sollen.',
  },
  {
    question: 'Welche Zahlungsmethoden werden akzeptiert?',
    answer: 'Sie können bei uns bequem per Kreditkarte, PayPal, SEPA-Lastschrift oder Rechnung (nach Bonitätsprüfung) bezahlen. Die Zahlung erfolgt sicher über unseren Payment-Partner Stripe. Eine Barzahlung direkt in der Werkstatt ist bei den meisten Partnern ebenfalls möglich.',
  },
];

export function FAQAccordion() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Häufig gestellte Fragen
          </h2>
          <p className="text-xl text-gray-600">
            Alles was Sie über Ronya wissen müssen
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-2 rounded-lg px-6 bg-white hover:shadow-medium transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Haben Sie weitere Fragen? Unser Support-Team hilft Ihnen gerne weiter.
          </p>
          <a
            href="mailto:support@ronya.de"
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            support@ronya.de
          </a>
        </div>
      </div>
    </section>
  );
}
