"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useId, type ComponentType } from "react";
import PhoneInput, { getCountryCallingCode, type Country, type Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import ar from "react-phone-number-input/locale/ar.json";
import en from "react-phone-number-input/locale/en.json";
import { FieldShell } from "./Field";

type CountryOption = { value?: Country; label: string; divider?: boolean };

type CountrySelectProps = {
  value?: Country;
  onChange: (value?: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  "aria-label"?: string;
};

function CountrySelect({ value, onChange, options, disabled, "aria-label": ariaLabel }: CountrySelectProps) {
  const Flag = value ? (flags[value] as ComponentType<{ title: string }> | undefined) : undefined;

  return (
    <div className="relative flex shrink-0 items-center gap-1">
      <span className="flex items-center gap-0.5">
        {Flag && (
          <span className="flex h-4 w-[22px] overflow-hidden rounded-[2px] [&_svg]:size-full">
            <Flag title={value ?? ""} />
          </span>
        )}
        {value && (
          <span dir="ltr" className="text-base font-medium">
            +{getCountryCallingCode(value)}
          </span>
        )}
      </span>
      <Image src="/images/arrow-down-dark.svg" alt="" width={20} height={20} className="dark:invert" />
      <select
        value={value ?? ""}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange((event.target.value || undefined) as Country | undefined)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value ?? option.label} value={option.value ?? ""} disabled={option.divider}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type PhoneFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  invalid?: boolean;
  defaultCountry?: Country;
};

export function PhoneField({ label, placeholder, value, onChange, error, invalid, defaultCountry = "SA" }: PhoneFieldProps) {
  const id = useId();
  const locale = useLocale();

  return (
    <FieldShell id={id} label={label} error={error} invalid={invalid}>
      <PhoneInput
        id={id}
        dir="ltr"
        defaultCountry={defaultCountry}
        addInternationalOption={false}
        countrySelectComponent={CountrySelect}
        labels={locale === "ar" ? ar : en}
        placeholder={placeholder}
        value={(value || undefined) as Value | undefined}
        onChange={(next) => onChange(next ?? "")}
        aria-invalid={Boolean(error || invalid)}
        autoComplete="tel"
        className="flex h-full w-full items-center gap-[15px] [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-base [&_.PhoneInputInput]:text-inherit [&_.PhoneInputInput]:outline-none rtl:[&_.PhoneInputInput]:text-right"
      />
    </FieldShell>
  );
}
