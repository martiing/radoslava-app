import { siteConfig } from "@/content/site-config";
import type { GoalRealism, PrimaryFocus } from "@/types/quiz";

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const COLORS = {
  ink: "#1b1626",
  muted: "#78675e",
  accent: "#d62a47",
  background: "#f7e7da",
  surface: "#ffffff",
  border: "#e8d5c2",
};

function wrapEmailHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="bg">
  <body style="margin:0;padding:32px 16px;background:${COLORS.background};font-family:Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:24px;">
          <span style="font-size:22px;font-weight:700;color:${COLORS.accent};letter-spacing:-0.02em;">${siteConfig.header.brandShort}</span>
          <span style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.muted};margin-left:8px;">${siteConfig.header.brandFull}</span>
        </td>
      </tr>
      <tr>
        <td style="background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:24px;padding:32px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;font-size:12px;color:${COLORS.muted};text-align:center;">
          ${siteConfig.footer.projectName}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildConfirmationEmail(name: string): EmailContent {
  const { hero, footer } = siteConfig;
  const firstName = name.trim().split(/\s+/)[0] || name;

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;">Здравей, ${firstName}!</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      Заявката ти за <strong>„${hero.eyebrow}“</strong> е приета. Мястото ти е запазено — очаквай следващо
      съобщение с начина на плащане и достъпа до затворената група.
    </p>
    <table role="presentation" style="width:100%;margin:24px 0;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:${COLORS.muted};">Начало</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${hero.startDate}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Записване до</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${hero.registrationDeadline}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Цена</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${hero.price}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.muted};">
      Въпроси? Просто отговори на този имейл или пиши на
      <a href="mailto:${footer.contactEmail}" style="color:${COLORS.accent};">${footer.contactEmail}</a>.
    </p>
  `);

  const text = `Здравей, ${firstName}!

Заявката ти за „${hero.eyebrow}“ е приета. Мястото ти е запазено — очаквай следващо съобщение с начина на плащане и достъпа до затворената група.

Начало: ${hero.startDate}
Записване до: ${hero.registrationDeadline}
Цена: ${hero.price}

Въпроси? Пиши на ${footer.contactEmail}.

${siteConfig.footer.projectName}`;

  return {
    subject: `Заявката ти е приета — ${siteConfig.header.brandFull}`,
    html,
    text,
  };
}

interface LeadInfo {
  name: string;
  email: string;
  phone: string;
}

export function buildAdminNotificationEmail(lead: LeadInfo): EmailContent {
  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;">Нова заявка за записване</h1>
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:${COLORS.muted};">Име</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${lead.name}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Имейл</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${lead.email}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Телефон</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${lead.phone}</td>
      </tr>
    </table>
  `);

  const text = `Нова заявка за записване

Име: ${lead.name}
Имейл: ${lead.email}
Телефон: ${lead.phone}`;

  return {
    subject: `Нова заявка: ${lead.name}`,
    html,
    text,
  };
}

interface PersonalizedWelcomeInput {
  name: string;
  goalRealism: GoalRealism;
  primaryFocus: PrimaryFocus;
  hasLimitations: boolean;
}

const GOAL_REALISM_COPY: Record<GoalRealism, { heading: string; body: string }> = {
  realistic: {
    heading: "Целта ти е напълно постижима",
    body: "Това, което си споделила, е реалистично за един месец, ако следваш плана последователно. Ще имаш нужната структура и подкрепа, за да го направиш.",
  },
  ambitious: {
    heading: "Амбициозна, но възможна цел",
    body: "Целта ти изисква сериозна последователност. Ще се фокусираме върху устойчив напредък всяка седмица — дори частичен резултат след месец е солидна основа за продължение.",
  },
  unrealistic: {
    heading: "Нека изравним очакванията",
    body: "Резултатът, който описа, обичайно отнема повече от месец при здравословен темп. Радослава лично ще се свърже с теб, за да поставите заедно реалистична междинна цел за периода на предизвикателството.",
  },
};

const PRIMARY_FOCUS_COPY: Record<PrimaryFocus, { heading: string; body: string }> = {
  nutrition: {
    heading: "Ще заложим на храненето",
    body: "Твоят хранителен план ще е основният инструмент през месеца, съобразен с нивото ти на персонализация.",
  },
  training: {
    heading: "Ще заложим на тренировките",
    body: "Ще получиш ясна тренировъчна структура, съобразена с твоето ниво, без излишна сложност.",
  },
  accountability: {
    heading: "Ще заложим на подкрепата",
    body: "Затворената Viber група и седмичните срещи ще ти дават нужната отговорност, за да не се откажеш по средата.",
  },
  mindset: {
    heading: "Ще заложим на нагласата",
    body: "Q&A сесиите и подкрепата от екипа ще са насочени към изграждане на увереност и устойчива мотивация.",
  },
};

/**
 * Personalized welcome email sent right after the registration quiz. Reuses
 * the shared HTML layout/colors, but the goal-realism and focus-area blocks
 * are dynamic per participant, based on her quiz answers.
 */
export function buildPersonalizedWelcomeEmail(participant: PersonalizedWelcomeInput): EmailContent {
  const { hero, whatYouGet, footer } = siteConfig;
  const firstName = participant.name.trim().split(/\s+/)[0] || participant.name;
  const realism = GOAL_REALISM_COPY[participant.goalRealism];
  const focus = PRIMARY_FOCUS_COPY[participant.primaryFocus];

  const benefitsHtml = whatYouGet.benefits
    .map(
      (benefit) => `
        <tr style="border-top:1px solid ${COLORS.border};">
          <td style="padding:8px 0;font-weight:600;">${benefit.title}</td>
          <td style="padding:8px 0;text-align:right;color:${COLORS.muted};">${benefit.description}</td>
        </tr>`
    )
    .join("");

  const limitationsHtml = participant.hasLimitations
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${COLORS.muted};">${footer.medicalDisclaimer}</p>`
    : "";

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;">Здравей, ${firstName}!</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">
      Благодарим ти, че отдели време за въпросите ни — вече можем да персонализираме опита ти в
      <strong>„${hero.eyebrow}“</strong>.
    </p>

    <h2 style="margin:0 0 8px;font-size:17px;font-weight:700;">${realism.heading}</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${realism.body}</p>

    <h2 style="margin:0 0 8px;font-size:17px;font-weight:700;">${focus.heading}</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${focus.body}</p>
    ${limitationsHtml}

    <h2 style="margin:24px 0 8px;font-size:17px;font-weight:700;">Какво получаваш за ${hero.price}</h2>
    <table role="presentation" style="width:100%;margin:8px 0 24px;border-collapse:collapse;font-size:14px;">
      ${benefitsHtml}
    </table>

    <h2 style="margin:0 0 8px;font-size:17px;font-weight:700;">Следващи стъпки</h2>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${COLORS.muted};">
      1. Добави Радослава във Viber.<br />
      2. Изпрати съобщение „Искам да участвам“.<br />
      3. Ще получиш данни за плащане (Revolut).<br />
      4. След потвърдено плащане те добавяме в затворената Viber група с останалите участнички.
    </p>

    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:${COLORS.muted};">
      Въпроси? Просто отговори на този имейл или пиши на
      <a href="mailto:${footer.contactEmail}" style="color:${COLORS.accent};">${footer.contactEmail}</a>.
    </p>
  `);

  const text = `Здравей, ${firstName}!

Благодарим ти, че отдели време за въпросите ни — вече можем да персонализираме опита ти в „${hero.eyebrow}“.

${realism.heading}
${realism.body}

${focus.heading}
${focus.body}
${participant.hasLimitations ? `\n${footer.medicalDisclaimer}\n` : ""}
Какво получаваш за ${hero.price}:
${whatYouGet.benefits.map((benefit) => `- ${benefit.title}: ${benefit.description}`).join("\n")}

Следващи стъпки:
1. Добави Радослава във Viber.
2. Изпрати съобщение „Искам да участвам“.
3. Ще получиш данни за плащане (Revolut).
4. След потвърдено плащане те добавяме в затворената Viber група с останалите участнички.

Въпроси? Пиши на ${footer.contactEmail}.

${siteConfig.footer.projectName}`;

  return {
    subject: `Твоят персонализиран план — ${siteConfig.header.brandFull}`,
    html,
    text,
  };
}
