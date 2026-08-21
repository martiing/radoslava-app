import { describe, expect, it } from "vitest";
import {
  REGISTRATION_CONTACT_ERRORS,
  validateRegistrationContact,
} from "@/lib/validation/registration-contact";

describe("validateRegistrationContact", () => {
  it("accepts a valid name and every supported Bulgarian phone spelling", () => {
    for (const phone of [
      "0888 123 456",
      "+359888123456",
      "00359888123456",
      "(0888) 123-456",
    ]) {
      expect(validateRegistrationContact("  Мария  ", phone)).toEqual({});
    }
  });

  it("rejects a short name before the visitor leaves the contact step", () => {
    expect(validateRegistrationContact("М", "0888123456")).toEqual({
      name: REGISTRATION_CONTACT_ERRORS.nameTooShort,
    });
  });

  it("rejects an invalid phone before the visitor completes the intake", () => {
    expect(validateRegistrationContact("Мария", "000")).toEqual({
      phone: REGISTRATION_CONTACT_ERRORS.phoneInvalid,
    });
  });

  it("reports both fields in one pass", () => {
    expect(validateRegistrationContact(" ", " ")).toEqual({
      name: REGISTRATION_CONTACT_ERRORS.nameTooShort,
      phone: REGISTRATION_CONTACT_ERRORS.phoneInvalid,
    });
  });
});
