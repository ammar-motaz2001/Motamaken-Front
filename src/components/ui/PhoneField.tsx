"use client";

import { useLocale } from "next-intl";
import { useId, type ComponentType } from "react";
import PhoneInput, { getCountryCallingCode, type Country, type Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import ar from "react-phone-number-input/locale/ar.json";
import en from "react-phone-number-input/locale/en.json";
import { Listbox } from "./Listbox";
import { FieldShell } from "./Field";

type CountryOption = { value?: Country; label: string; divider?: boolean };

type CountrySelectProps = {
  value?: Country;
  onChange: (value?: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  "aria-label"?: string;
};

/** Country picker of the phone field: a searchable list with flags, built on the shared Listbox. */
function CountrySelect({ value, onChange, options, disabled, "aria-label": ariaLabel }: CountrySelectProps) {

  const FlagOf = (code?: Country) => {
    const Icon = code ? (flags[code] as ComponentType<{ title: string }> | undefined) : undefined;
    return Icon ? (
      <span className="flex h-4 w-[22px] shrink-0 overflow-hidden rounded-[2px] [&_svg]:size-full">
        <Icon title={code ?? ""} />
      </span>
    ) : undefined;
  };

  return (
    <Listbox
      value={value ?? ""}
      onChange={(next) => onChange((next || undefined) as Country | undefined)}
      disabled={disabled}
      aria-label={ariaLabel}
      searchable
      options={options.map((option) => ({ value: option.value ?? "", label: option.label, disabled: option.divider, icon: FlagOf(option.value) }))}
      className="shrink-0"
      menuClassName="w-72"
      buttonClassName="flex h-full items-center gap-1 bg-transparent outline-none"
      renderValue={() => (
        <span className="flex items-center gap-1">
          {FlagOf(value)}
          {value && (
            <span dir="ltr" className="text-base font-medium">
              +{getCountryCallingCode(value)}
            </span>
          )}
        </span>
      )}
    />
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

/** International phone number input with a country picker, Saudi Arabia by default, labels in the page language. */
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
