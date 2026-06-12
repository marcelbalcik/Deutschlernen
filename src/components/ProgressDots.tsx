type Props = {
  total: number;
  current: number;
  /** Indices that are completed (e.g. answered correctly). */
  done?: number[];
};

/** Small dots showing position in a deck. No numbers — friendly for pre-readers. */
export default function ProgressDots({ total, current, done = [] }: Props) {
  return (
    <div className="progress-dots" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const cls =
          i === current ? "dot active" : done.includes(i) ? "dot done" : "dot";
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}
