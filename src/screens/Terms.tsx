import TERMO from "../legal/termo.json";

/** Texto completo do termo de uso e da política de privacidade. Acessível com ou sem login. */
export function TextoTermo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4">
        <h2 className="text-base font-800 text-text mb-2">Em resumo</h2>
        <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-text leading-relaxed">
          {TERMO.resumo.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      {TERMO.secoes.map((s) => (
        <section key={s.titulo}>
          <h2 className="text-base font-800 text-text mb-2">{s.titulo}</h2>
          {s.paragrafos.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-text leading-relaxed mb-2">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function Terms() {
  return (
    <div className="min-h-full bg-background">
      <header className="bg-primary px-5 pt-10 pb-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-800 text-white">{TERMO.titulo}</h1>
          <p className="text-white/80 text-sm mt-1">
            Versão {TERMO.versao} · vigente desde {TERMO.vigencia}
          </p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-6">
        <TextoTermo />
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign("/"))}
          className="mt-4 h-12 px-6 bg-primary text-white rounded-2xl text-base font-700"
        >
          Voltar
        </button>
      </main>
    </div>
  );
}
