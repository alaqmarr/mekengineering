import Link from "next/link";
import { Wrench, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-background pt-28 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/25">
          <Wrench className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Error 404 • Page Not Found
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase text-foreground">
            Equipment or Route Not Found
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            The page or catalog item you requested may have been moved or renamed. Browse our active industrial catalog or return to the homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white hover:border-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground transition-all"
          >
            <Search className="h-4 w-4" />
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
