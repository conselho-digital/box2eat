import Image from "next/image";

export function AuthBrand() {
  return (
    <div className="mb-2 flex justify-center">
      <Image
        src="/brand/box2eat-logo.png"
        alt="Box2eat"
        width={56}
        height={62}
      />
    </div>
  );
}
