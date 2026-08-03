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
