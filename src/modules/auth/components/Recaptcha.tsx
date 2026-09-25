import Image from "next/image";

export function Recaptcha() {
  return (
    <div className="relative h-[78px] w-[239px] overflow-hidden">
      <Image
        src="/images/recaptcha.png"
        alt="reCAPTCHA"
        width={680}
        height={174}
        className="absolute top-[12.62%] left-[-5.44%] h-[87.59%] w-[111.72%] max-w-none"
      />
    </div>
  );
}
