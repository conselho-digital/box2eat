import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Pratoja</h1>
      <p className="max-w-md text-muted-foreground">
        Peça comida das melhores empresas perto de você, ou cadastre a sua e
        comece a vender.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/cadastro" />} nativeButton={false}>
          Criar conta
        </Button>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="outline"
        >
          Entrar
        </Button>
      </div>
    </div>
  );
}
