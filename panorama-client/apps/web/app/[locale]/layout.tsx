import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SynthiaBanner } from "@/components/ui/SynthiaBanner";
import { NavBar } from "@/components/ui/NavBar";
import { SessionBootstrap } from "@/components/ui/SessionBootstrap";

const LOCALES = ["en", "es"] as const;
type Locale = (typeof LOCALES)[number];

interface Props {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!LOCALES.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionBootstrap />
          <SynthiaBanner />
          <NavBar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}
