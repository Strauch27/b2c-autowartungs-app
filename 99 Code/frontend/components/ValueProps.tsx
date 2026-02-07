import { BadgeCheck, Shield, Truck, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const ValueProps = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: BadgeCheck,
      title: t.values.items.price.title,
      description: t.values.items.price.description,
    },
    {
      icon: Shield,
      title: t.values.items.certified.title,
      description: t.values.items.certified.description,
    },
    {
      icon: Truck,
      title: t.values.items.pickup.title,
      description: t.values.items.pickup.description,
    },
    {
      icon: Zap,
      title: t.values.items.instant.title,
      description: t.values.items.instant.description,
    },
  ];

  return (
    <section className="section-spacing bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t.values.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t.values.subtitle}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card transition-all group-hover:shadow-elevated group-hover:-translate-y-1">
                <value.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
