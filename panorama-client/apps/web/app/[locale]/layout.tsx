import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SynthiaBanner } from "@/components/ui/SynthiaBanner";
import { ModuleRail } from "@/components/ui/ModuleRail";
import { SessionBootstrap } from "@/components/ui/SessionBootstrap";
import { VoiceLayer } from "@/components/voice/VoiceLayer";
import { ChatTrigger } from "@/components/chat/ChatTrigger";

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
          <ModuleRail />
          <main
            style={{
              paddingLeft: "var(--rail-width)",
              minHeight: "100vh",
            }}
          >
            {children}
          </main>
          <VoiceLayer />
          <ChatTrigger />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}
