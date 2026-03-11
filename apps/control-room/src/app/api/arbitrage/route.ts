import { NextRequest, NextResponse } from 'next/server';

/**
 * Currency Arbitrage Agent — ALEX™ Financial Scout
 * Monitors LATAM currency rates vs USD and identifies micro-arbitrage windows
 */

interface CurrencyRate {
  code: string;
  name: string;
  country: string;
  rateToUSD: number;   // How many local units per 1 USD
  change24h?: number;  // % change in last 24h
}

interface ArbitrageOpportunity {
  currency: string;
  country: string;
  rateToUSD: number;
  signal: 'BUY_LOCAL' | 'SELL_LOCAL' | 'NEUTRAL';
  reason: string;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

const LATAM_CURRENCIES = ['MXN', 'ARS', 'COP', 'BRL', 'CLP', 'PEN', 'UYU'];

const CURRENCY_META: Record<string, { name: string; country: string }> = {
  MXN: { name: 'Peso Mexicano', country: 'México' },
  ARS: { name: 'Peso Argentino', country: 'Argentina' },
  COP: { name: 'Peso Colombiano', country: 'Colombia' },
  BRL: { name: 'Real Brasileño', country: 'Brasil' },
  CLP: { name: 'Peso Chileno', country: 'Chile' },
  PEN: { name: 'Sol Peruano', country: 'Perú' },
  UYU: { name: 'Peso Uruguayo', country: 'Uruguay' },
};

// Baseline "fair" rates from KNOWLEDGE.md — used when API unavailable
const BASELINE_RATES: Record<string, number> = {
  MXN: 19.0,
  ARS: 900.0,
  COP: 4100.0,
  BRL: 5.0,
  CLP: 900.0,
  PEN: 3.75,
  UYU: 40.0,
};

async function fetchLiveRates(): Promise<Record<string, number>> {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) return BASELINE_RATES;

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return BASELINE_RATES;
    const data = await res.json() as { conversion_rates?: Record<string, number> };
    const rates = data.conversion_rates ?? {};

    // Return only LATAM currencies
    const result: Record<string, number> = {};
    for (const code of LATAM_CURRENCIES) {
      result[code] = rates[code] ?? BASELINE_RATES[code];
    }
    return result;
  } catch {
    return BASELINE_RATES;
  }
}

function analyzeOpportunity(
  code: string,
  currentRate: number
): ArbitrageOpportunity {
  const baseline = BASELINE_RATES[code] ?? currentRate;
  const meta = CURRENCY_META[code] ?? { name: code, country: '' };
  const deviation = ((currentRate - baseline) / baseline) * 100;

  let signal: ArbitrageOpportunity['signal'] = 'NEUTRAL';
  let strength: ArbitrageOpportunity['strength'] = 'WEAK';
  let reason = '';

  if (deviation > 5) {
    // Currency is weaker than baseline — more local units per USD
    signal = 'BUY_LOCAL';
    reason = `${meta.name} está ${deviation.toFixed(1)}% más débil que su referencia. Oportunidad de comprar servicios locales pagados en ${code}.`;
    strength = deviation > 15 ? 'STRONG' : deviation > 8 ? 'MODERATE' : 'WEAK';
  } else if (deviation < -5) {
    signal = 'SELL_LOCAL';
    reason = `${meta.name} se ha apreciado ${Math.abs(deviation).toFixed(1)}%. Considera cobrar proyectos en ${code} ahora.`;
    strength = deviation < -15 ? 'STRONG' : deviation < -8 ? 'MODERATE' : 'WEAK';
  } else {
    reason = `Tipo de cambio dentro de rango normal (±5% del referente).`;
  }

  return {
    currency: code,
    country: meta.country,
    rateToUSD: currentRate,
    signal,
    reason,
    strength,
  };
}

function buildBriefText(
  rates: Record<string, number>,
  opportunities: ArbitrageOpportunity[]
): string {
  const date = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Mexico_City',
  });

  const lines: string[] = [
    `📊 **Resumen de Arbitraje LATAM — ${date}**`,
    '',
    '**Tipos de cambio vs USD:**',
    ...LATAM_CURRENCIES.map((c) => {
      const rate = rates[c]?.toFixed(2) ?? 'N/A';
      const meta = CURRENCY_META[c];
      return `  • ${meta?.country ?? c}: ${rate} ${c}`;
    }),
    '',
    '**Oportunidades destacadas:**',
  ];

  const strong = opportunities.filter((o) => o.strength === 'STRONG' || o.strength === 'MODERATE');
  if (strong.length === 0) {
    lines.push('  Sin oportunidades fuertes hoy. Mercados estables.');
  } else {
    for (const op of strong) {
      const icon = op.signal === 'BUY_LOCAL' ? '🟢' : op.signal === 'SELL_LOCAL' ? '🔴' : '⚪';
      lines.push(`  ${icon} ${op.country} (${op.currency}): ${op.reason}`);
    }
  }

  lines.push('', '_Generado por ALEX™ — Kupuri Media™_');
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') ?? 'json';

  const rates = await fetchLiveRates();
  const opportunities = LATAM_CURRENCIES.map((code) =>
    analyzeOpportunity(code, rates[code] ?? BASELINE_RATES[code])
  );

  const ratesList: CurrencyRate[] = LATAM_CURRENCIES.map((code) => ({
    code,
    name: CURRENCY_META[code]?.name ?? code,
    country: CURRENCY_META[code]?.country ?? '',
    rateToUSD: rates[code] ?? BASELINE_RATES[code],
  }));

  const brief = buildBriefText(rates, opportunities);

  if (format === 'text') {
    return new NextResponse(brief, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    baseCurrency: 'USD',
    rates: ratesList,
    opportunities,
    brief,
    source: rates === BASELINE_RATES ? 'baseline' : 'live',
  });
}
