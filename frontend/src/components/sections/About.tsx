export default function About() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Born in Nepal,<br />built for makers.
            </h2>
            <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
              <p>
                We started Circuit Bazaar because we were tired of buying &ldquo;new&rdquo;
                hardware that arrived without proper documentation, fake serials, and zero
                warranty support. What began as a small forum for Kathmandu builders has
                grown into Nepal&apos;s most trusted hardware marketplace.
              </p>
              <p>
                Today, we connect over <span className="font-semibold text-slate-900">50 verified vendors</span> across
                Kathmandu, Pokhara, and Lalitpur with thousands of builders, students, and
                IT professionals who demand genuine specs and honest pricing.
              </p>
              <p>
                Whether you&apos;re assembling a Threadripper workstation, prototyping an
                IoT farm sensor, or upgrading your home lab — you&apos;ll find it here,
                verified.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <span className="block text-3xl font-bold text-slate-900">2021</span>
                <span className="text-sm text-slate-500">Founded in Kathmandu</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <span className="block text-3xl font-bold text-slate-900">50+</span>
                <span className="text-sm text-slate-500">Verified vendors</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <span className="block text-3xl font-bold text-slate-900">99%</span>
                <span className="text-sm text-slate-500">Customer satisfaction</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-slate-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80"
                alt="Engineer working on hardware"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-2xl bg-red-600/10 -z-10" />
            <div className="absolute -top-6 -left-6 h-32 w-32 rounded-2xl bg-slate-900/5 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
