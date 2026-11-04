import { useState, useMemo } from "react";
import { Navigate } from "../App";
import { supabase } from "../supabase";

interface Props { navigate: Navigate; }

export default function Signup({ navigate }: Props) {
  const [step, setStep] = useState(1); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Etapa 1: Credenciais
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  // Etapa 2: Perfil do Cuidador
  const [telefone, setTelefone] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState(''); 
  const [nomeInstituicao, setNomeInstituicao] = useState('');

  // Etapa 3: Dados do Idoso (Opcional)
  const [nomeIdoso, setNomeIdoso] = useState('');
  const [dataNascimentoIdoso, setDataNascimentoIdoso] = useState('');
  const [condicaoNeurologica, setCondicaoNeurologica] = useState('');
  const [nivelTecnologia, setNivelTecnologia] = useState('');

  async function handleRegister(skipIdoso = false) {
    setLoading(true);
    setError("");

    try {
      // 1. Cria o usuário no Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.");
        } else {
          throw new Error(signUpError.message);
        }
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error("Erro ao obter ID do usuário.");

      // 2. Insere os dados do cuidador
      const { error: cuidadorError } = await supabase.from('cuidadores').insert([{
        id: userId,
        nome_completo: name,
        telefone: telefone,
        tipo_vinculo: tipoVinculo,
        nome_instituicao: tipoVinculo === 'Instituição' ? nomeInstituicao : null
      }]);

      if (cuidadorError) throw cuidadorError;

      // 3. Insere o idoso SOMENTE SE ele preencheu e não escolheu pular
      if (!skipIdoso && nomeIdoso.trim()) {
        const { error: idosoError } = await supabase.from('idosos').insert([{
          cuidador_id: userId,
          nome_completo: nomeIdoso,
          data_nascimento: dataNascimentoIdoso || null,
          condicao_neurologica: condicaoNeurologica || 'Nenhuma',
          nivel_tecnologia: nivelTecnologia || 'Média'
        }]);

        if (idosoError) throw idosoError;
      }

      navigate("dashboard");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNextOrSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) { 
        setError("Preencha todos os campos obrigatórios."); return; 
      }
      if (!passwordCriteria.minLength || !passwordCriteria.hasUpper || !passwordCriteria.hasNumber) {
        setError("A senha não atende aos requisitos mínimos de segurança."); return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem."); return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!telefone || !tipoVinculo) {
        setError("Preencha o telefone e o tipo de vínculo."); return;
      }
      if (tipoVinculo === 'Instituição' && !nomeInstituicao) {
        setError("Informe o nome da Instituição."); return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      // Se estiver na etapa 3, finaliza salvando com os dados do idoso preenchidos
      await handleRegister(false);
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
              <path d="M12 10c4 0 8 2 8 5v1H4v-1c0-3 4-5 8-5" />
              <path d="M8 21l2-4h4l2 4" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1 className="text-3xl font-800 text-text">Criar Conta</h1>
          <p className="text-text-muted text-base mt-1">Etapa {step} de 3</p>
        </div>

        <form onSubmit={handleNextOrSubmit} className="flex flex-col gap-4">
          
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="Seu nome"
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="seu@email.com"
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                  >
                    {showPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
                
                {password.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2 text-xs font-600">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? "text-emerald-600" : "text-text-muted"}`}><span>{passwordCriteria.minLength ? "✓" : "○"}</span> Mínimo de 6 caracteres</div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? "text-emerald-600" : "text-text-muted"}`}><span>{passwordCriteria.hasUpper ? "✓" : "○"}</span> Pelo menos uma letra maiúscula</div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? "text-emerald-600" : "text-text-muted"}`}><span>{passwordCriteria.hasNumber ? "✓" : "○"}</span> Pelo menos um número</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                  >
                    {showConfirmPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => { setTelefone(e.target.value); setError(""); }}
                  placeholder="(00) 00000-0000"
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Tipo de Vínculo</label>
                <select 
                  value={tipoVinculo} 
                  onChange={(e) => { setTipoVinculo(e.target.value); setError(""); }}
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Profissional">Cuidador Profissional</option>
                  <option value="Instituição">Instituição de Repouso</option>
                </select>
              </div>
              {tipoVinculo === 'Instituição' && (
                <div>
                  <label className="block text-sm font-700 text-text mb-1.5">Nome da Instituição</label>
                  <input
                    type="text"
                    value={nomeInstituicao}
                    onChange={(e) => { setNomeInstituicao(e.target.value); setError(""); }}
                    placeholder="Nome do local"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-primary/5 p-3 rounded-xl mb-1 text-xs text-text-muted">
                💡 Esta etapa é opcional. Se preferir, pode cadastrar os dados do paciente mais tarde diretamente no seu painel.
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Nome do Paciente (Idoso)</label>
                <input
                  type="text"
                  value={nomeIdoso}
                  onChange={(e) => { setNomeIdoso(e.target.value); setError(""); }}
                  placeholder="Nome completo (Opcional)"
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimentoIdoso}
                  onChange={(e) => { setDataNascimentoIdoso(e.target.value); setError(""); }}
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Condição Neurológica</label>
                <select 
                  value={condicaoNeurologica} 
                  onChange={(e) => { setCondicaoNeurologica(e.target.value); setError(""); }}
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Alzheimer">Alzheimer</option>
                  <option value="Demência">Demência</option>
                  <option value="TDAH">TDAH / Neurodivergência</option>
                  <option value="Nenhuma">Sem diagnóstico prévio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-700 text-text mb-1.5">Familiaridade com Tecnologia</label>
                <select 
                  value={nivelTecnologia} 
                  onChange={(e) => { setNivelTecnologia(e.target.value); setError(""); }}
                  className="w-full h-12 px-4 rounded-xl border-2 border-border bg-surface focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Alta">Usa smartphone sozinho</option>
                  <option value="Média">Precisa de ajuda ocasional</option>
                  <option value="Baixa">Dificuldade motora ou visual</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-error text-sm font-600 bg-error/8 rounded-xl px-3 py-2.5">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-12 bg-surface border-2 border-border text-text rounded-xl font-700 hover:bg-border transition-all"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] h-12 bg-primary text-white rounded-xl font-700 hover:bg-primary-light disabled:opacity-70 transition-all shadow-md flex items-center justify-center"
              >
                {loading ? "Salvando..." : step === 3 ? "Finalizar Cadastro" : "Próximo"}
              </button>
            </div>

            {/* Botão extra para Pular a Etapa 3 */}
            {step === 3 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRegister(true)}
                className="w-h-12 h-10 text-text-muted hover:text-text text-sm font-600 transition-all"
              >
                Pular esta etapa e cadastrar depois
              </button>
            )}
          </div>

          <button 
            type="button" 
            onClick={() => navigate("login")} 
            className="text-primary text-sm font-600 text-center hover:underline mt-1"
          >
            Já tenho uma conta
          </button>
        </form>
      </div>
    </div>
  );
}