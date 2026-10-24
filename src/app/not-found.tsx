import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p className="eyebrow text-accent">404 / Page not found</p>
    <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">This connection goes nowhere.</h1>
    <p className="max-w-md leading-7 text-foreground-muted">That page may have moved, or the address may be incorrect. You can return to the portfolio below.</p>
    <Link className="button" href="/">Back to the portfolio <span aria-hidden="true">↗</span></Link>
  </main>;
}
