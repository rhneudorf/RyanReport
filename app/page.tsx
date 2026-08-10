const stories = [
  {
    category: "Manufacturing & Trade",
    headline: "Tariff uncertainty continues to cloud Ontario factory planning",
    summary:
      "Exporters remain cautious about hiring, equipment purchases, and long-term pricing.",
    image: "from-slate-800 to-amber-700",
  },
  {
    category: "Local",
    headline: "Quiet morning across Lincoln, Niagara, and Hamilton",
    summary:
      "No major property-tax, utility, road, or municipal announcements require action today.",
    image: "from-sky-900 to-sky-400",
  },
  {
    category: "Engineering",
    headline:
      "Robotic welding and machine vision move onto smaller shop floors",
    summary:
      "Lower-cost automation is making repeatable weld quality and advanced inspection more accessible.",
    image: "from-zinc-900 to-zinc-500",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f2ef] text-[#111111]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f3f2ef]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
            ☰
          </button>

          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold tracking-wide">
              THE RYAN REPORT
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Thursday · July 16 · Beamsville
            </p>
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
            ☆
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        <section className="rounded-[24px] bg-gradient-to-br from-zinc-950 to-zinc-700 p-5 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Morning Snapshot · 5 minute read
          </p>

          <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
            Only three stories deserve your attention this morning.
          </h2>

          <p className="mt-3 leading-6 text-white/80">
            Your mortgage is unchanged, trade uncertainty remains the main risk
            to Ontario manufacturing, and there are no urgent local homeowner
            developments.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-3">
              <strong className="block">Your money</strong>
              🟢 Stable
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <strong className="block">Your career</strong>
              🟡 Watch tariffs
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <strong className="block">Your home</strong>
              🟢 No action
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <strong className="block">Investments</strong>
              🟢 Stay the course
            </div>
          </div>
        </section>

        <div className="mb-3 mt-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Top Story</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Most important
          </span>
        </div>

        <article className="overflow-hidden rounded-[24px] bg-white shadow-lg">
          <div className="relative h-60 bg-gradient-to-br from-blue-950 via-blue-700 to-sky-300">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20" />
            <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-red-600/60" />

            <p className="absolute bottom-4 left-5 text-lg font-bold text-white drop-shadow">
              Bank of Canada · Ottawa
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-red-700">
              Your Money
            </p>

            <h2 className="mt-2 font-serif text-4xl font-bold leading-[1.02]">
              Bank holds rates, leaving variable borrowers waiting for relief
            </h2>

            <p className="mt-4 text-lg leading-7 text-zinc-600">
              The central bank kept its policy rate unchanged as officials
              balanced easing inflation against trade and economic uncertainty.
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              3 minute read · Updated this morning
            </p>

            <div className="mt-5 rounded-2xl border-l-4 border-blue-700 bg-[#eeece7] p-4">
              <strong className="block">Why this matters to Ryan</strong>
              <p className="mt-1 leading-6 text-zinc-700">
                Your five-year variable mortgage remains unchanged. The next
                rate decision is the next realistic chance for a lower payment.
              </p>
            </div>
          </div>
        </article>

        <div className="mb-3 mt-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Latest</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Selected for you
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {stories.map((story) => (
            <article
              key={story.headline}
              className="overflow-hidden rounded-[22px] bg-white shadow-lg"
            >
              <div
                className={`flex h-40 items-end bg-gradient-to-br ${story.image} p-4`}
              >
                <span className="font-bold text-white drop-shadow">
                  {story.category}
                </span>
              </div>

              <div className="p-4">
                <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
                  {story.category}
                </p>

                <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                  {story.headline}
                </h3>

                <p className="mt-3 leading-6 text-zinc-600">
                  {story.summary}
                </p>
              </div>
            </article>
          ))}
        </section>

        <div className="mb-3 mt-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Markets</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            At a glance
          </span>
        </div>

        <section className="grid grid-cols-2 gap-3 rounded-[22px] bg-zinc-950 p-4 text-white shadow-lg sm:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-400">TSX</p>
            <strong className="text-lg text-green-400">▲ 0.4%</strong>
          </div>

          <div>
            <p className="text-xs text-zinc-400">S&amp;P 500</p>
            <strong className="text-lg text-green-400">▲ 0.2%</strong>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Oil</p>
            <strong className="text-lg text-red-400">▼ 0.7%</strong>
          </div>

          <div>
            <p className="text-xs text-zinc-400">CAD/USD</p>
            <strong className="text-lg">0.73</strong>
          </div>
        </section>

        <div className="mb-3 mt-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Looking Ahead</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            This week
          </span>
        </div>

        <section className="rounded-[22px] bg-white p-5 shadow-lg">
          <strong className="text-lg">What to watch next</strong>

          <ul className="mt-3 list-disc space-y-2 pl-5 leading-6 text-zinc-700">
            <li>Canada–U.S. tariff announcements</li>
            <li>Inflation and employment data</li>
            <li>The next Bank of Canada rate decision</li>
            <li>Niagara and Hamilton municipal updates</li>
          </ul>
        </section>

        <p className="py-10 text-center text-sm text-zinc-500">
          You&apos;re caught up. See you tomorrow morning.
        </p>
      </div>
    </main>
  );
}
