import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  erro: boolean;
}

/** Um erro em uma tela não derruba o aplicativo inteiro. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { erro: false };

  static getDerivedStateFromError(): State {
    return { erro: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro na interface:", error, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-6 text-center bg-background">
        <h1 className="text-2xl font-800 text-text">Algo não saiu como esperado</h1>
        <p className="text-base text-text-muted max-w-sm">Nenhum dado foi perdido. Volte ao início e tente de novo.</p>
        <button
          onClick={() => {
            this.setState({ erro: false });
            window.location.assign("/");
          }}
          className="h-12 px-6 bg-primary text-white rounded-2xl text-base font-700"
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}
