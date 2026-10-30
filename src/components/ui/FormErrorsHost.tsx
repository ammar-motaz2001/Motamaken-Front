"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const ERROR_ATTR = "data-field-error";

/**
 * Replaces the browser's validation bubbles ("Please fill out this field", in the browser's language) on every form:
 * the field turns red with the message under it in the site's style and language, and it clears on the next edit.
 * Mounted once in the root layout.
 */
export function FormErrorsHost() {
  const t = useTranslations("Validation");

  useEffect(() => {
    let firstAt = 0;

    const message = (field: Field) => {
      const v = field.validity;
      if (v.valueMissing) return t(field instanceof HTMLInputElement && field.type === "checkbox" ? "mustCheck" : "fieldRequired");
      if (v.typeMismatch && field.type === "email") return t("emailInvalid");
      if (v.typeMismatch && field.type === "url") return t("urlInvalid");
      if (v.rangeUnderflow) return t("min", { min: (field as HTMLInputElement).min });
      if (v.rangeOverflow) return t("max", { max: (field as HTMLInputElement).max });
      if (v.tooShort) return t("tooShort", { min: (field as HTMLInputElement).minLength });
      if (v.tooLong) return t("tooLong", { max: (field as HTMLInputElement).maxLength });
      return t("fieldInvalid");
    };

    // The message goes after the field, or after its wrapper when the field itself is hidden (custom pickers).
    const anchor = (field: Field) => (field.offsetParent === null && field.parentElement ? field.parentElement : field);

    const clear = (field: Field) => {
      if (!field.hasAttribute(ERROR_ATTR)) return;
      field.removeAttribute(ERROR_ATTR);
      field.removeAttribute("aria-invalid");
      const note = anchor(field).nextElementSibling;
      if (note?.hasAttribute(`${ERROR_ATTR}-note`)) note.remove();
    };

    const onInvalid = (event: Event) => {
      const field = event.target as Field;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      event.preventDefault();
      clear(field);
      field.setAttribute(ERROR_ATTR, "");
      field.setAttribute("aria-invalid", "true");
      const note = document.createElement("p");
      note.setAttribute(`${ERROR_ATTR}-note`, "");
      note.setAttribute("role", "alert");
      note.className = "mt-1 text-xs text-danger";
      note.textContent = message(field);
      anchor(field).after(note);
      // Bring the first invalid field of this submit into view.
      if (Date.now() - firstAt > 300) {
        firstAt = Date.now();
        if (field.offsetParent !== null) field.focus({ preventScroll: true });
        anchor(field).scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    const onEdit = (event: Event) => {
      const field = event.target as Field;
      if (field instanceof HTMLElement) clear(field);
    };

    document.addEventListener("invalid", onInvalid, true);
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
    };
  }, [t]);

  return null;
}
