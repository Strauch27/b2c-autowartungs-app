"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const faqItems = [
  {
    question: "Wie funktioniert der Hol- und Bringservice?",
    answer:
      "Unser Service ist ganz einfach: Sie buchen online einen Termin, wählen Ihren gewünschten Service und geben Ihre Adresse an. Ein Fahrer holt Ihr Fahrzeug zum vereinbarten Zeitpunkt ab, bringt es zur Partnerwerkstatt und liefert es nach Abschluss der Arbeiten wieder bei Ihnen ab. Sie werden über jeden Schritt per App und E-Mail informiert.",
  },
  {
    question: "Was kostet der Service?",
    answer:
      "Die Kosten setzen sich aus dem gewählten Wartungsservice und einer Hol-/Bring-Pauschale zusammen. Die genauen Preise werden Ihnen vor der Buchung transparent angezeigt und richten sich nach Fahrzeugtyp, Kilometerstand und gewähltem Service. Es gibt keine versteckten Kosten - Sie erhalten eine Festpreis-Garantie.",
  },
  {
    question: "Wie lange dauert die Wartung?",
    answer:
      "Die Dauer hängt vom gewählten Service ab. Eine Inspektion dauert in der Regel 3-5 Stunden, ein Ölwechsel ca. 1-2 Stunden. Bei umfangreicheren Arbeiten wie Bremsenservice oder Klimaanlagenwartung kann es etwas länger dauern. Sie erhalten bei der Buchung eine geschätzte Dauer und werden über den Fortschritt informiert.",
  },
  {
    question: "Kann ich den Termin ändern oder verschieben?",
    answer:
      "Ja, Sie können Ihren Termin bis zu 24 Stunden vor dem geplanten Abholzeitpunkt kostenlos ändern oder verschieben. Gehen Sie dazu in Ihr Dashboard, wählen Sie die entsprechende Buchung und klicken Sie auf \"Termin ändern\". Bei kurzfristigeren Änderungen kontaktieren Sie bitte unseren Kundenservice.",
  },
  {
    question: "Was passiert bei notwendigen Zusatzarbeiten?",
    answer:
      "Wenn die Werkstatt bei der Inspektion zusätzlichen Reparaturbedarf feststellt, werden Sie sofort per App benachrichtigt. Sie erhalten eine detaillierte Beschreibung der empfohlenen Arbeiten inklusive Kostenvoranschlag mit Fotos. Sie entscheiden dann, ob die Zusatzarbeiten durchgeführt werden sollen. Ohne Ihre Zustimmung werden keine weiteren Arbeiten ausgeführt.",
  },
  {
    question: "Ist mein Fahrzeug während des Transports versichert?",
    answer:
      "Ja, Ihr Fahrzeug ist während des gesamten Hol- und Bringvorgangs vollständig versichert. Unsere Fahrer sind erfahren und geschult. Zusätzlich dokumentieren wir den Zustand Ihres Fahrzeugs bei Abholung und Rückgabe per Foto, um maximale Transparenz zu gewährleisten.",
  },
  {
    question: "Wie bezahle ich?",
    answer:
      "Die Bezahlung erfolgt bequem online über unsere sichere Zahlungsabwicklung. Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte, SEPA-Lastschrift und PayPal. Die Zahlung wird erst nach erfolgreicher Buchungsbestätigung abgewickelt. Bei Zusatzarbeiten erfolgt die Zahlung separat nach Ihrer Zustimmung.",
  },
  {
    question: "Kann ich eine Buchung stornieren?",
    answer:
      "Ja, Buchungen können kostenlos storniert werden, solange der Status noch \"Bestätigt\" ist und die Abholung noch nicht begonnen hat. Gehen Sie dazu in Ihre Buchungsübersicht und klicken Sie auf \"Stornieren\". Bei bereits gestarteten Aufträgen kontaktieren Sie bitte unseren Kundenservice für individuelle Lösungen.",
  },
];

export default function FAQPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "de";
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {language === "de"
                  ? "Häufig gestellte Fragen"
                  : "Frequently Asked Questions"}
              </h1>
              <p className="text-muted-foreground">
                {language === "de"
                  ? "Antworten auf die wichtigsten Fragen zu unserem Service"
                  : "Answers to the most important questions about our service"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/customer/dashboard`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "de" ? "Zurück" : "Back"}
          </Button>
        </div>

        {/* FAQ Accordion */}
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {language === "de"
                ? "Noch Fragen?"
                : "Still have questions?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "de"
                ? "Unser Kundenservice-Team hilft Ihnen gerne weiter."
                : "Our customer service team is happy to help."}
            </p>
            <Button variant="outline">
              {language === "de"
                ? "Kontakt aufnehmen"
                : "Get in Touch"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
