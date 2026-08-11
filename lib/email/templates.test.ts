import { describe, expect, it } from "vitest";
import {
  buildAdminNotificationEmail,
  buildPersonalizedWelcomeEmail,
} from "@/lib/email/templates";

describe("buildAdminNotificationEmail", () => {
  it("escapes participant-controlled HTML and keeps the subject single-line", () => {
    const email = buildAdminNotificationEmail({
      name: `Мария</td><img src=x onerror="alert(1)">\r\nBcc: victim@example.com`,
      phone: "+359888123456",
      primaryGoal: "Отслабване",
      trainingTrack: "Вкъщи",
      experienceLevel: "Начинаеща",
    });

    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(email.subject).not.toMatch(/[\r\n]/u);
    expect(email.text).not.toContain("\r\nBcc:");
  });
});

describe("buildPersonalizedWelcomeEmail", () => {
  it("escapes the participant name in HTML and sanitizes the subject", () => {
    const email = buildPersonalizedWelcomeEmail({
      name: `<svg onload="alert(1)">\r\nBcc: victim@example.com`,
      goal: "general_health",
      goalRealism: "realistic",
      primaryFocus: "accountability",
      trainingTrack: "home",
      hasLimitations: false,
    });

    expect(email.html).not.toContain("<svg onload");
    expect(email.html).toContain("&lt;svg");
    expect(email.subject).not.toMatch(/[\r\n]/u);
  });
});
