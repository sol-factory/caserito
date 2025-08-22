import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "../ui/separator";
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <body className="max-w-3xl mx-auto relative min-h-screen w-full p-6 flex flex-col items-center sm:pt-5 pb-24">
      <Card className="rounded-2xl shadow-lg border border-muted">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">
              Última actualización: junio 2025
            </p>
          </div>
          <Separator />
          <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
            {children}
          </div>
        </CardContent>
      </Card>
    </body>
  );
}
