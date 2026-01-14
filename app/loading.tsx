import Image from "next/image";

export default function Loading() {
  const word = "Orchida"; // أو "أوركيدا" لو بدك بالعربي
  return (
    <div className="mx-auto mt-32 text-center" dir="ltr">
      {/* اللوجو */}
      <Image
        src="/logoLoading.webp"
        alt="logoLoading"
        width={200}
        height={200}
        className="block mx-auto animate-bounce h-full w-52"
        unoptimized
        loading="eager"
      />

      {/* كلمة أوركيدة حرف حرف */}
      <div className="flex justify-center space-x-2 mt-6 text-3xl font-bold">
        {word.split("").map((letter, index) => (
          <span
            key={index}
            className="animate-bounce"
            style={{
              animationDelay: `${index * 0.2}s`, // كل حرف يتأخر شوي
              animationDuration: "1s",
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
