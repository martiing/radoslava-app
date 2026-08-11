import { siteConfig } from "@/content/site-config";
import {
  escapeEmailHtml,
  sanitizeEmailSubject,
  sanitizeEmailTextLine,
} from "@/lib/email/sanitize";
import type { GoalRealism, PrimaryFocus, QuizGoal, TrainingTrack } from "@/types/quiz";

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

function wrapEmailHtml(bodyHtml: string, preheader?: string): string {
  // Hidden preheader: the snippet inbox clients show next to the subject
  // line. The trailing whitespace entities pad it so the client doesn't
  // fall through into rendering the visible body as the preview instead.
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeEmailHtml(preheader)}${"&nbsp;&zwnj;".repeat(40)}</div>`
    : "";

  return `<!doctype html>
<html lang="bg">
  <body style="margin:0;padding:32px 16px;background:${COLORS.background};font-family:Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    ${preheaderHtml}
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:24px;">
          <span style="font-size:22px;font-weight:700;color:${COLORS.accent};letter-spacing:-0.02em;">${escapeEmailHtml(siteConfig.header.brandShort)}</span>
          <span style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.muted};margin-left:8px;">${escapeEmailHtml(siteConfig.header.brandFull)}</span>
        </td>
      </tr>
      <tr>
        <td style="background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:24px;padding:32px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;font-size:12px;color:${COLORS.muted};text-align:center;">
          ${escapeEmailHtml(siteConfig.footer.projectName)}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

interface LeadInfo {
  name: string;
  phone: string;
  primaryGoal: string;
  trainingTrack: string;
  experienceLevel: string;
}

/**
 * Sent to Radoslava only — the participant no longer gets a confirmation
 * email, since the on-page Viber card is now her immediate next step.
 */
export function buildAdminNotificationEmail(lead: LeadInfo): EmailContent {
  const htmlLead = {
    name: escapeEmailHtml(lead.name),
    phone: escapeEmailHtml(lead.phone),
    primaryGoal: escapeEmailHtml(lead.primaryGoal),
    trainingTrack: escapeEmailHtml(lead.trainingTrack),
    experienceLevel: escapeEmailHtml(lead.experienceLevel),
  };
  const textLead = {
    name: sanitizeEmailTextLine(lead.name),
    phone: sanitizeEmailTextLine(lead.phone),
    primaryGoal: sanitizeEmailTextLine(lead.primaryGoal),
    trainingTrack: sanitizeEmailTextLine(lead.trainingTrack),
    experienceLevel: sanitizeEmailTextLine(lead.experienceLevel),
  };

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;">Нова заявка за записване</h1>
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:${COLORS.muted};">Име</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${htmlLead.name}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Телефон</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${htmlLead.phone}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Цел</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${htmlLead.primaryGoal}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Тренировка</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${htmlLead.trainingTrack}</td>
      </tr>
      <tr style="border-top:1px solid ${COLORS.border};">
        <td style="padding:8px 0;color:${COLORS.muted};">Ниво</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;">${htmlLead.experienceLevel}</td>
      </tr>
    </table>
  `);

  const text = `Нова заявка за записване

Име: ${textLead.name}
Телефон: ${textLead.phone}
Цел: ${textLead.primaryGoal}
Тренировка: ${textLead.trainingTrack}
Ниво: ${textLead.experienceLevel}`;

  return {
    subject: sanitizeEmailSubject(`Нова заявка: ${textLead.name}`),
    html,
    text,
  };
}

interface PersonalizedWelcomeInput {
  name: string;
  goal: QuizGoal;
  goalRealism: GoalRealism;
  primaryFocus: PrimaryFocus;
  trainingTrack: TrainingTrack;
  hasLimitations: boolean;
}

const GOAL_COPY: Record<QuizGoal, string> = {
  weight_loss:
    "Виждам, че основната ти цел е отслабване — ще заложим на устойчив хранителен подход, а не на краткотрайни ограничения.",
  tone_and_shape:
    "Целта ти е да оформиш тялото си — комбинираме силови елементи с внимание към детайла, за да усетиш разликата в рамките на месеца.",
  strength: "Искаш да станеш по-силна и издръжлива — тренировъчната част ще бъде водеща в твоя план.",
  energy_habits:
    "Търсиш повече енергия и по-добри навици — фокусът е върху малки, устойчиви промени, които се усещат бързо.",
  general_health:
    "Целта ти е общо здраве и самочувствие — изграждаме баланс между хранене, движение и почивка.",
};

// Softened relative to the mid-program tone used elsewhere: this version
// runs before payment, so "unrealistic" reassures rather than corrects.
const GOAL_REALISM_COPY: Record<GoalRealism, string> = {
  realistic:
    "Това, което описа, е напълно постижимо за един месец, ако следваш плана последователно — точно затова изградих структурата така, че да не разчиташ само на мотивация.",
  ambitious:
    "Целта ти е амбициозна, но възможна с последователност. Ще се фокусираме върху устойчив напредък всяка седмица — дори частичен резултат след месец е солидна основа за продължение.",
  unrealistic:
    "Искам да съм честна с теб: резултатът, който описа, обикновено отнема повече от месец при здравословен темп. Това не значи, че месецът няма да има стойност — ще поставим заедно реалистична междинна цел, върху която да стъпиш. Ще го обсъдим лично, щом се чуем във Viber.",
};

const PRIMARY_FOCUS_COPY: Record<PrimaryFocus, string> = {
  nutrition: "Тъй като посочи, че имаш най-голяма нужда от помощ с храненето, хранителният план ще е основният инструмент през месеца.",
  training: "Тъй като посочи, че имаш най-голяма нужда от помощ с тренировките, тренировъчната структура ще е водещата част от плана ти.",
  accountability:
    "Тъй като посочи, че имаш най-голяма нужда от подкрепа и отговорност, затворената Viber група ще е точно за това — хора около теб, пред които да си отговорна, и седмични срещи, на които да свериш напредъка си.",
  mindset:
    "Тъй като посочи, че имаш най-голяма нужда от помощ с нагласата, Q&A сесиите и подкрепата от екипа ще са насочени към изграждане на увереност и устойчива мотивация.",
};

const TRAINING_TRACK_COPY: Record<TrainingTrack, string> = {
  gym: "Тъй като ще тренираш във фитнес залата, тренировъчната част е съобразена с наличното там оборудване.",
  home: "Тъй като ще тренираш вкъщи, тренировъчната част е адаптирана за минимално оборудване, без да губи ефективност.",
};

/**
 * Sent right after the registration quiz, before payment/Viber. Reuses the
 * shared HTML layout/colors; the goal, realism, focus and training-track
 * blocks are dynamic per participant. The single call to action is the
 * Viber deep link — no payment details go out until she's messaged there.
 */
export function buildPersonalizedWelcomeEmail(participant: PersonalizedWelcomeInput): EmailContent {
  const { hero, offerBlock, footer, viberContact } = siteConfig;
  const firstNameRaw = participant.name.trim().split(/\s+/)[0] || participant.name;
  const firstName = sanitizeEmailTextLine(firstNameRaw);
  const firstNameHtml = escapeEmailHtml(firstName);
  const goalLine = GOAL_COPY[participant.goal];
  const realismLine = GOAL_REALISM_COPY[participant.goalRealism];
  const focusLine = PRIMARY_FOCUS_COPY[participant.primaryFocus];
  const trackLine = TRAINING_TRACK_COPY[participant.trainingTrack];

  const benefitsHtml = offerBlock.values
    .map(
      (value) => `
        <tr style="border-top:1px solid ${COLORS.border};">
          <td style="padding:8px 0;">${escapeEmailHtml(value.text)}</td>
        </tr>`
    )
    .join("");

  const limitationsHtml = participant.hasLimitations
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${COLORS.muted};">${escapeEmailHtml(footer.medicalDisclaimer)}</p>`
    : "";

  const html = wrapEmailHtml(
    `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;">Здравей, ${firstNameHtml}!</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">
      Записването ти за <strong>„${escapeEmailHtml(hero.eyebrow)}“</strong> е при мен, заедно с всичко, което сподели във
      въпросника. Отделих време да прочета отговорите ти лично.
    </p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeEmailHtml(goalLine)}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${escapeEmailHtml(realismLine)}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeEmailHtml(focusLine)}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${escapeEmailHtml(trackLine)}</p>
    ${limitationsHtml}

    <h2 style="margin:24px 0 8px;font-size:17px;font-weight:700;">Какво получаваш за ${escapeEmailHtml(hero.price)}</h2>
    <table role="presentation" style="width:100%;margin:8px 0 24px;border-collapse:collapse;font-size:14px;">
      ${benefitsHtml}
    </table>

    <h2 style="margin:0 0 8px;font-size:17px;font-weight:700;">Какво следва оттук</h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${COLORS.muted};">
      1. Добавяш Радослава във Viber.<br />
      2. Изпращаш съобщение: „Искам да участвам“.<br />
      3. Получаваш данните за плащане (Revolut).<br />
      4. След потвърдено плащане те добавям в затворената група с останалите участнички.
    </p>

    <div style="text-align:center;margin:0 0 24px;">
      <a
        href="${escapeEmailHtml(viberContact.deepLink)}"
        style="display:inline-block;background:${COLORS.accent};color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;text-decoration:none;"
      >
        Пиши ми във Viber
      </a>
    </div>

    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
      Ако имаш въпроси, преди да платиш каквото и да е — попитай ме директно във Viber. Предпочитам да
      изясним всичко сега, отколкото да имаш съмнения по-късно.
    </p>

    <p style="margin:0 0 4px;font-size:15px;line-height:1.6;">До скоро,<br />Радослава</p>

    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${COLORS.muted};border-top:1px solid ${COLORS.border};padding-top:16px;">
      П.С. Мястото ти не е официално запазено, докато не потвърдим плащането във Viber — така че ако си
      решила да участваш, следващата стъпка е едно кратко съобщение, не повече.
    </p>

    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${COLORS.muted};">
      Въпроси по имейл? Пиши на
      <a href="mailto:${escapeEmailHtml(footer.contactEmail)}" style="color:${COLORS.accent};">${escapeEmailHtml(footer.contactEmail)}</a>.
    </p>
  `,
    "Видях какво написа във въпросника — ето какво мисля и какво следва."
  );

  const text = `Здравей, ${firstName}!

Записването ти за „${hero.eyebrow}“ е при мен, заедно с всичко, което сподели във въпросника. Отделих време да прочета отговорите ти лично.

${goalLine}
${realismLine}

${focusLine}
${trackLine}
${participant.hasLimitations ? `\n${footer.medicalDisclaimer}\n` : ""}
Какво получаваш за ${hero.price}:
${offerBlock.values.map((value) => `- ${value.text}`).join("\n")}

Какво следва оттук:
1. Добавяш Радослава във Viber: ${viberContact.deepLink}
2. Изпращаш съобщение: „Искам да участвам“.
3. Получаваш данните за плащане (Revolut).
4. След потвърдено плащане те добавям в затворената група с останалите участнички.

Ако имаш въпроси, преди да платиш каквото и да е — попитай ме директно във Viber.

До скоро,
Радослава

П.С. Мястото ти не е официално запазено, докато не потвърдим плащането във Viber — така че ако си решила да участваш, следващата стъпка е едно кратко съобщение, не повече.

Въпроси по имейл? Пиши на ${footer.contactEmail}.

${siteConfig.footer.projectName}`;

  return {
    subject: sanitizeEmailSubject(`${firstName}, прочетох отговорите ти`),
    html,
    text,
  };
}
