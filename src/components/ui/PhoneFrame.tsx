// STUB(C0) → Kamsi restyles in K1b. Keep props: { children }.
//
// Layout contract (important for everyone):
// - Mobile: the frame IS the viewport (100dvh).
// - Desktop (sm+): a 390×844 phone centred on the page, shrunk to fit short laptop screens.
// - The frame has `transform`, so `position: fixed` children are contained INSIDE the
//   frame on desktop. Overlays/sheets can use `fixed inset-0` safely.
// - Portals: render into #overlay-root (inside the frame), never document.body.

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center sm:py-6">
      <div
        className="relative isolate flex h-dvh w-full flex-col overflow-hidden bg-bg sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-frame sm:shadow-frame sm:[transform:translateZ(0)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {children}
        <div id="overlay-root" />
      </div>
    </div>
  );
}
