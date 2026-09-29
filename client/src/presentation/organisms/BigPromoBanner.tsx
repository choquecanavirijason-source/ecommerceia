export function BigPromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-primary to-orange-700 min-h-[200px] flex items-center">
        <div className="relative z-10 p-8 md:p-12 max-w-lg">
          <p className="text-orange-200 text-sm font-bold uppercase tracking-widest mb-2">Oferta Especial</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
            Obtené 20% Off en tu
            <br />
            Primer Pedido
          </h2>
          <p className="text-orange-100/90 text-sm mb-6 font-reading">
            Usá el código <span className="font-bold bg-white/25 px-2.5 py-1 rounded-lg text-white tracking-wider">UNO20</span> al pagar.
          </p>
          <button
            type="button"
            className="bg-white text-[#FF6A00] font-bold text-sm px-8 py-3 rounded-full hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-md font-subheading flex items-center gap-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Aprovechá hoy →
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1783477108548-ed63e5766c42?w=600&h=400&fit=crop&auto=format"
            alt="Calefactor"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
      </div>
    </section>
  );
}
