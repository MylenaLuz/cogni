import { useState, type FormEvent } from "react";
import type { Navigate } from "../App";
import { api, json } from "../api/client";
import type { ConviteAceito } from "../api/tipos";
import { PAPEIS } from "../data";
import { useAuth } from "../state/AuthContext";
import { useData } from "../state/DataContext";

const campo =
  "w-full h-11 px-3 rounded-xl border-2 border-border bg-background text-base focus:outline-none focus:border-primary";

/** Partes de "Minha conta" ligadas a perfil, convites e instituição. */
export default function AccountTeam({ navigate }: { navigate: Navigate }) {
  const { usuario, recarregarUsuario } = useAuth();
  const { recarregar } = useData();
  const [nome, setNome] = useState(usuario?.nome_completo ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  const [salvo, setSalvo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [aceito, setAceito] = useState<ConviteAceito | null>(null);
  const [nomeInst, setNomeInst] = useState("");
  const [erro, setErro] = useState<{ onde: string; msg: string } | null>(null);

  if (!usuario) return null;

  async function tentar(onde: string, fn: () => Promise<void>) {
    setErro(null);
    try {
      await fn();
    } catch (e) {
      setErro({ onde, msg: e instanceof Error ? e.message : "Não foi possível concluir." });
    }
  }

  const salvarDados = (e: FormEvent) => {
    e.preventDefault();
    void tentar("dados", async () => {
      await api("/auth/eu", { method: "PATCH", body: JSON.stringify({ nome_completo: nome, telefone: telefone || null }) });
      await recarregarUsuario();
      await recarregar();
      setSalvo(true);
    });
  };

  const usarCodigo = (e: FormEvent) => {
    e.preventDefault();
    void tentar("codigo", async () => {
      const r = await api<ConviteAceito>("/convites/aceitar", json({ codigo }));
      setAceito(r);
      setCodigo("");
      await recarregarUsuario();
      await recarregar();
    });
  };

  const criarInst = (e: FormEvent) => {
    e.preventDefault();
    void tentar("inst", async () => {
      await api("/instituicao", json({ nome: nomeInst }));
      await recarregarUsuario();
      navigate("institution");
    });
  };

  const Erro = ({ onde }: { onde: string }) =>
    erro?.onde === onde ? <p role="alert" className="text-error text-sm font-600 mt-2">{erro.msg}</p> : null;

  return (
    <>
      <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
        <h2 className="text-base font-700 text-text">Meus dados</h2>
        <form onSubmit={salvarDados} className="mt-2 flex flex-col gap-2">
          <label htmlFor="meu-nome" className="text-sm font-700 text-text">Nome</label>
          <input id="meu-nome" className={campo} value={nome} onChange={(e) => { setNome(e.target.value); setSalvo(false); }} />
          <label htmlFor="meu-tel" className="text-sm font-700 text-text">Telefone</label>
          <input id="meu-tel" className={campo} value={telefone} onChange={(e) => { setTelefone(e.target.value); setSalvo(false); }} inputMode="tel" />
          <button type="submit" disabled={nome.trim().length < 2} className="mt-1 h-11 px-5 self-start bg-primary text-white rounded-2xl text-base font-700 disabled:opacity-60">
            {salvo ? "✓ Salvo" : "Salvar"}
          </button>
        </form>
        <Erro onde="dados" />
      </section>

      <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
        <h2 className="text-base font-700 text-text">Recebi um código de convite</h2>
        <p className="text-sm text-text-muted mt-1">
          Use o código que o responsável por uma pessoa, ou o gestor de uma instituição, passou para você.
        </p>
        <form onSubmit={usarCodigo} className="mt-2 flex gap-2">
          <input
            aria-label="Código de convite"
            className={`${campo} uppercase tracking-widest`}
            placeholder="ABCD-2345"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" disabled={codigo.replace(/[^a-z0-9]/gi, "").length < 8} className="h-11 px-4 bg-primary text-white rounded-xl text-sm font-700 disabled:opacity-60">
            Usar
          </button>
        </form>
        {aceito && (
          <p className="text-sm text-text mt-2" aria-live="polite">
            {aceito.tipo === "pessoa"
              ? `Pronto: agora você acompanha ${aceito.nome} como ${PAPEIS[aceito.papel as keyof typeof PAPEIS].nome.toLowerCase()}.`
              : `Pronto: você entrou na equipe de ${aceito.nome}.`}{" "}
            {aceito.paciente_id && (
              <button onClick={() => navigate("patient-detail", aceito.paciente_id!)} className="font-700 text-primary underline">
                Ver perfil
              </button>
            )}
          </p>
        )}
        <Erro onde="codigo" />
      </section>

      <section className="bg-surface rounded-2xl border border-border shadow-sm p-4">
        <h2 className="text-base font-700 text-text">Instituição</h2>
        {usuario.instituicao ? (
          <>
            <p className="text-sm text-text mt-1">
              {usuario.instituicao.nome} · você é {usuario.instituicao.papel === "gestor" ? "gestor" : "profissional da equipe"}
            </p>
            <button onClick={() => navigate("institution")} className="mt-3 h-11 px-5 bg-primary text-white rounded-2xl text-base font-700">
              {usuario.instituicao.papel === "gestor" ? "Gerenciar equipe e pessoas" : "Ver equipe"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-text-muted mt-1">
              Para casas de repouso e equipes: crie uma instituição para convidar profissionais e decidir quem acompanha cada pessoa.
              Você será o gestor.
            </p>
            <form onSubmit={criarInst} className="mt-2 flex gap-2">
              <input aria-label="Nome da instituição" className={campo} placeholder="Nome da instituição" value={nomeInst} onChange={(e) => setNomeInst(e.target.value)} />
              <button type="submit" disabled={nomeInst.trim().length < 2} className="h-11 px-4 bg-primary text-white rounded-xl text-sm font-700 disabled:opacity-60">
                Criar
              </button>
            </form>
          </>
        )}
        <Erro onde="inst" />
      </section>
    </>
  );
}
