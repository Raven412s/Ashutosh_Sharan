import type { Metadata } from "next";

import { PreloaderProvider } from "@/components/providers/PreloaderProvider";
import { Preloader } from "@/components/preloader/Preloader";
import NavAndFooterProvider from "@/components/providers/NavAndFooterProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  quickSand,
  spaceMono,
  stalinistOne,
} from "../fonts";
import "../globals.css";


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> { 
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${spaceMono.variable} ${stalinistOne.variable} ${quickSand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <PreloaderProvider>
              <Preloader />
              <NavAndFooterProvider>
                {children}
              </NavAndFooterProvider>
            </PreloaderProvider>
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
