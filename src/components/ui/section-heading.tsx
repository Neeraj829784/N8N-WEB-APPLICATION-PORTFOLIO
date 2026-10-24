type SectionHeadingProps = Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
      <div>
        <h2 className="max-w-3xl text-balance text-4xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-foreground-muted sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
