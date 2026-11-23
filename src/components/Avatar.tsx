// Iniciais no lugar de fotos externas: nenhuma requisição a terceiros (RNF28).

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}

const tamanhos = { sm: "w-11 h-11 text-sm", md: "w-12 h-12 text-base", lg: "w-14 h-14 text-lg" };

export default function Avatar({ name, size = "md", light = false }: Props) {
  const iniciais = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`${tamanhos[size]} rounded-full flex items-center justify-center font-800 flex-shrink-0 ${
        light ? "bg-white/20 text-white border-2 border-white/30" : "bg-primary/12 text-primary"
      }`}
    >
      {iniciais || "?"}
    </div>
  );
}
