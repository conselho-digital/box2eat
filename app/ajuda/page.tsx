import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HELP_ARTICLES } from "@/lib/domain/help-articles";

export default function HelpIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Central de ajuda</h1>
        <p className="text-sm text-muted-foreground">
          Artigos com as regras e o funcionamento do Box2eat.
        </p>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {HELP_ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/ajuda/${article.slug}`}
            className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{article.title}</p>
              <p className="text-sm text-muted-foreground">{article.summary}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
