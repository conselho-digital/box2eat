import Image from "next/image";

export function AuthBrand() {
  return (
    <div className="mb-2 flex justify-center">
      <Image
        src="/brand/box2eat-logo.jpg"
        alt="Box2eat"
        width={56}
        height={56}
        className="rounded-xl"
      />
    </div>
  );
}
