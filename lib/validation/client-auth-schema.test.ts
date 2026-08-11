import { describe, expect, it } from "vitest";
import {
  clientLoginSchema,
  clientRegisterSchema,
  clientUpdatePasswordSchema,
} from "@/lib/validation/client-auth-schema";

const validRegistration = {
  name: "Радослава Славова",
  email: "RADO@example.com",
  phone: "0888123456",
  consent: "on" as const,
  password: "silna-parola-9",
  confirmPassword: "silna-parola-9",
};

describe("client auth validation", () => {
  it("normalizes login emails", () => {
    const result = clientLoginSchema.parse({ email: " RADO@Example.com ", password: "secret" });
    expect(result.email).toBe("rado@example.com");
  });

  it("accepts a complete registration", () => {
    expect(clientRegisterSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("requires a strong password", () => {
    const result = clientRegisterSchema.safeParse({
      ...validRegistration,
      password: "password",
      confirmPassword: "password",
    });
    expect(result.success).toBe(false);
  });

  it("requires matching passwords", () => {
    const result = clientRegisterSchema.safeParse({
      ...validRegistration,
      confirmPassword: "druga-parola-9",
    });
    expect(result.success).toBe(false);
  });

  it("validates password updates with the same strength rules", () => {
    expect(
      clientUpdatePasswordSchema.safeParse({
        password: "nova-parola-9",
        confirmPassword: "nova-parola-9",
      }).success
    ).toBe(true);
    expect(
      clientUpdatePasswordSchema.safeParse({
        password: "short",
        confirmPassword: "short",
      }).success
    ).toBe(false);
  });
});

describe("clientRegisterSchema phone normalisation", () => {
  function register(phone: string) {
    return clientRegisterSchema.safeParse({
      name: "Тест Тестов",
      email: "test@example.com",
      phone,
      consent: "on",
      password: "correct-horse-battery-9",
      confirmPassword: "correct-horse-battery-9",
    });
  }

  // The portal reuses registrationSchema.phone, so it inherits the E.164
  // transform. Migration 0008 adds a CHECK that every stored phone is
  // canonical, which makes that inheritance load-bearing: if a refactor ever
  // gives the portal its own phone rule, portal sign-ups start failing at the
  // database instead of at validation. This test fails first.
  it("stores the national form as +359", () => {
    const result = register("0888123456");
    expect(result.success).toBe(true);
    expect(result.success && result.data.phone).toBe("+359888123456");
  });

  it("collapses spacing and the 00 prefix to the same value", () => {
    for (const spelling of ["0888 123 456", "+359 888 123 456", "00359888123456"]) {
      const result = register(spelling);
      expect(result.success && result.data.phone).toBe("+359888123456");
    }
  });

  it("rejects a number that is not Bulgarian", () => {
    expect(register("+49888123456").success).toBe(false);
  });
});
