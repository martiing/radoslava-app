import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button link routing", () => {
  it("uses a native anchor for app protocols", () => {
    const element = Button({
      href: "viber://chat?number=%2B359896273376",
      children: "Viber",
    });

    expect(element.type).toBe("a");
    expect(element.props.href).toBe("viber://chat?number=%2B359896273376");
  });

  it("keeps internal navigation on Next Link", () => {
    const element = Button({ href: "/#registration", children: "Запиши се" });

    expect(element.type).not.toBe("a");
    expect(element.props.href).toBe("/#registration");
  });
});
