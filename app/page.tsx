import report from "../data/report.json";
const latestStories = report.stories;
const marketItems = report.markets.items;
const categories = [
  { name: "Top Stories", id: "top-stories" },
  { name: "Local", id: "local" },
  { name: "Your Money", id: "your-money" },
  { name: "Manufacturing", id: "manufacturing" },
  { name: "Engineering", id: "engineering" },
  { name: "World", id: "world" },
  { name: "Markets", id: "markets" },
  { name: "Looking Ahead", id: "looking-ahead" },
];

export default function Home() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Toronto",
  });

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#111111]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f3ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-white text-xl shadow-sm">
              ☰
            </summary>

            <div className="absolute left-0 top-12 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
              <div className="border-b border-black/10 p-4">
                <p className="font-serif text-xl font-bold">The Ryan Report</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Your personal morning newspaper
                </p>
              </div>

              <nav className="p-2">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-zinc-100"
                  >
                    {category.name}
                  </a>
                ))}
              </nav>
            </div>
          </details>

          <div className="text-center">
            <h1 className="font-serif text-[22px] font-bold tracking-[0.06em]">
              THE RYAN REPORT
            </h1>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {formattedDate} · Beamsville
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            ☀
          </div>
        </div>

        {/* CATEGORY STRIP */}
        <div className="overflow-x-auto border-t border-black/5 bg-white/60">
          <div className="mx-auto flex w-max max-w-3xl gap-6 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
            <a href="#top-stories">Canada</a>
            <a href="#local">Local</a>
            <a href="#your-money">Money</a>
            <a href="#manufacturing">Manufacturing</a>
            <a href="#world">World</a>
            <a href="#markets">Markets</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-20">
        {/* MORNING SNAPSHOT */}
        <section className="border-b border-black/15 py-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">
              Morning Snapshot
            </p>

            <span className="text-xs text-zinc-500">5 minute read</span>
          </div>

          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight">
  {report.morningSnapshot.headline}
</h2>

          <p className="mt-3 text-[15px] leading-6 text-zinc-600">
  {report.morningSnapshot.summary}
</p>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <span className="block">💰</span>
              <strong>Money</strong>
              <span className="mt-1 block text-green-700">Stable</span>
            </div>

            <div className="rounded-xl bg-white p-2 shadow-sm">
              <span className="block">🏭</span>
              <strong>Career</strong>
              <span className="mt-1 block text-amber-700">Watch</span>
            </div>

            <div className="rounded-xl bg-white p-2 shadow-sm">
              <span className="block">🏠</span>
              <strong>Home</strong>
              <span className="mt-1 block text-green-700">Quiet</span>
            </div>

            <div className="rounded-xl bg-white p-2 shadow-sm">
              <span className="block">📈</span>
              <strong>Markets</strong>
              <span className="mt-1 block text-green-700">Normal</span>
            </div>
          </div>
        </section>

        {/* TOP STORY */}
        <section id="top-stories" className="scroll-mt-28 py-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Top Story
            </h2>

            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              Most important today
            </span>
          </div>

          <article className="overflow-hidden border-b border-black/20 pb-6">
            <div className="relative h-64 overflow-hidden rounded-2xl bg-zinc-200">
              <img
                src={report.topStory.image}
                alt="Ottawa Parliament buildings"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-14">
                <p className="text-sm font-bold text-white">
                  {report.topStory.location}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-blue-700">
              {report.topStory.category}
            </p>

            <h2 className="mt-2 font-serif text-[35px] font-bold leading-[1.02]">
              {report.topStory.headline}
            </h2>

            <p className="mt-3 text-[17px] leading-7 text-zinc-600">
              {report.topStory.summary}
            </p>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              3 minute read · Updated this morning
            </p>

            <div className="mt-4 border-l-4 border-blue-700 bg-[#eae8e2] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-blue-900">
                Why this matters to you
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-700">
                {report.topStory.whyItMatters}
              </p>
            </div>
          </article>
        </section>

        {/* TODAY'S EDITION */}
        <section id="local" className="scroll-mt-28 pb-6">
          <div className="mb-4 flex items-end justify-between border-b-2 border-black pb-2">
            <h2 className="font-serif text-2xl font-bold">
              Today&apos;s Edition
            </h2>

            <span className="text-[11px] uppercase tracking-wider text-zinc-500">
              Selected for you
            </span>
          </div>

          <div>
            {latestStories.map((story) => (
              <article
                key={story.headline}
                className="grid grid-cols-[1fr_120px] gap-4 border-b border-black/15 py-5"
              >
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
                    {story.category}
                  </p>

                  <h3 className="mt-1 font-serif text-[22px] font-bold leading-tight">
                    {story.headline}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-zinc-600">
                    {story.summary}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    <strong className="text-zinc-700">
                      Why this matters to you:
                    </strong>{" "}
                    {story.whyItMatters}
                  </p>
                </div>

                <div className="h-28 overflow-hidden rounded-xl bg-zinc-200">
                  <img
                    src={story.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* YOUR MONEY */}
        <section id="your-money" className="scroll-mt-28 py-6">
          <div className="mb-4 border-b-2 border-black pb-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-green-800">
              Personal Finance
            </p>

            <h2 className="mt-1 font-serif text-3xl font-bold">Your Money</h2>
          </div>

          <article>
            <h3 className="font-serif text-2xl font-bold">
              Mortgage outlook remains stable
            </h3>

            <p className="mt-2 leading-6 text-zinc-600">
              The Bank of Canada remains cautious, balancing inflation,
              economic growth and international trade risks before making its
              next move.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-black/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Bank of Canada
                </p>

                <p className="mt-1 font-serif text-2xl font-bold">2.25%</p>
              </div>

              <div className="border border-black/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Outlook
                </p>

                <p className="mt-1 font-serif text-2xl font-bold">Hold</p>
              </div>
            </div>
          </article>
        </section>

        {/* MARKETS */}
        <section id="markets" className="scroll-mt-28 py-6">
          <div className="mb-4 border-b-2 border-black pb-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              One-Minute Market Insight
            </p>

            <h2 className="mt-1 font-serif text-3xl font-bold">Markets</h2>
          </div>

          <div className="grid grid-cols-4 border-y border-black bg-zinc-950 text-white">
            {marketItems.map((item) => (
              <div
                key={item.name}
                className="border-r border-white/15 p-3 last:border-r-0"
              >
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                  {item.name}
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    item.positive === true
                      ? "text-green-400"
                      : item.positive === false
                        ? "text-red-400"
                        : "text-white"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 leading-6 text-zinc-600">
           {report.markets.insight}
          </p>

          <div className="mt-3 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider">
              Should a long-term investor care?
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Usually not. Daily market movement is mostly noise unless it
              reflects a meaningful change in long-term earnings, inflation or
              economic growth.
            </p>
          </div>
        </section>

        {/* MANUFACTURING */}
        <section id="manufacturing" className="scroll-mt-28 py-6">
          <div className="mb-4 border-b-2 border-black pb-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
              Industry Desk
            </p>

            <h2 className="mt-1 font-serif text-3xl font-bold">
              Manufacturing & Trade
            </h2>
          </div>

          <article className="border-b border-black/15 pb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Canada–U.S. Trade
            </p>

            <h3 className="mt-1 font-serif text-2xl font-bold">
              Tariff negotiations remain the industry&apos;s biggest external
              risk
            </h3>

            <p className="mt-2 leading-6 text-zinc-600">
              Changes involving steel, aluminum, industrial goods and rules of
              origin could influence customer demand and North American
              manufacturing investment.
            </p>

            <div className="mt-3 border-l-4 border-amber-700 bg-amber-50 px-4 py-3">
              <strong className="text-xs uppercase tracking-wider">
                Why this matters to you
              </strong>

              <p className="mt-1 text-sm leading-6 text-zinc-700">
                Hydraulic-cylinder manufacturers can be affected both through
                material costs and through changes in demand from U.S.-exposed
                equipment customers.
              </p>
            </div>
          </article>

          <article id="engineering" className="scroll-mt-28 pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Engineering Watch
            </p>

            <h3 className="mt-1 font-serif text-2xl font-bold">
              Automation remains a competitive advantage
            </h3>

            <p className="mt-2 leading-6 text-zinc-600">
              Robotic welding, machine vision, automated inspection and
              manufacturing data systems continue becoming more accessible to
              mid-sized manufacturers.
            </p>
          </article>
        </section>

        {/* WORLD */}
        <section id="world" className="scroll-mt-28 py-6">
          <div className="mb-4 border-b-2 border-black pb-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-800">
              Global Desk
            </p>

            <h2 className="mt-1 font-serif text-3xl font-bold">
              Around the World
            </h2>
          </div>

          <h3 className="font-serif text-2xl font-bold">
            Energy and trade remain the major global economic risks
          </h3>

          <p className="mt-2 leading-6 text-zinc-600">
            Geopolitical tensions, shipping disruptions and trade policy remain
            important because of their ability to influence energy prices,
            inflation and global manufacturing demand.
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            <strong className="text-zinc-700">
              Why this matters to you:
            </strong>{" "}
            Global stories become relevant when they affect your borrowing
            costs, investments, gasoline prices or industrial demand.
          </p>
        </section>

        {/* LOOKING AHEAD */}
        <section id="looking-ahead" className="scroll-mt-28 py-6">
          <div className="mb-4 border-b-2 border-black pb-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">
              Calendar
            </p>

            <h2 className="mt-1 font-serif text-3xl font-bold">
              Looking Ahead
            </h2>
          </div>

          <div className="divide-y divide-black/15 border-y border-black/15">
            <div className="grid grid-cols-[80px_1fr] py-4">
              <strong className="text-sm">Today</strong>
              <p className="text-sm text-zinc-600">
                Markets monitor Canada–U.S. trade negotiations.
              </p>
            </div>

            <div className="grid grid-cols-[80px_1fr] py-4">
              <strong className="text-sm">This Week</strong>
              <p className="text-sm text-zinc-600">
                Inflation, employment and manufacturing indicators remain in
                focus.
              </p>
            </div>

            <div className="grid grid-cols-[80px_1fr] py-4">
              <strong className="text-sm">Next BoC</strong>
              <p className="text-sm text-zinc-600">
                September 2 interest-rate decision.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black/20 py-10 text-center">
          <p className="font-serif text-xl font-bold">
            You&apos;re caught up.
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            See you tomorrow morning.
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            The Ryan Report · Personalized for you
          </p>
        </footer>
      </div>
    </main>
  );
}