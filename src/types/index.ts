export type Role = "REQUERENTE" | "ANALISTA" | "ADMIN";

export type StatusProcesso =
  | "RASCUNHO"
  | "ENVIADO"
  | "EM_ANALISE"
  | "PENDENTE_DOCUMENTOS"
  | "APROVADO"
  | "REPROVADO";

export type TipoProcesso =
  | "LICENCA_INICIAL"
  | "RENOVACAO"
  | "ALTERACAO_ATIVIDADE"
  | "ALTERACAO_RESPONSAVEL";

export type StatusDocumento =
  | "PENDENTE"
  | "AGUARDANDO_VALIDACAO"
  | "VALIDO"
  | "INVALIDO"
  | "EXPIRADO";

export type TipoDocumento =
  | "CONTRATO_SOCIAL"
  | "ALVARA_FUNCIONAMENTO"
  | "HABILITACAO_TECNICA"
  | "COMPROVANTE_ENDERECO"
  | "CNPJ"
  | "RG_CPF_RESPONSAVEL"
  | "OUTROS";

export interface ResultadoValidacaoIA {
  valido: boolean;
  isUltimaVersao: boolean;
  atividadeCompativel: boolean;
  dataUltimaAlteracao: string | null;
  atividadeEncontrada: string | null;
  cnaeEncontrado: string | null;
  termosFarmaEncontrados: string[];
  alertas: string[];
  erros: string[];
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  cnpj: string;
  cnae: string;
  email: string;
  telefone?: string;
  criadoEm: string;
  userId: string;
}

export interface Documento {
  id: string;
  tipo: TipoDocumento;
  status: StatusDocumento;
  nomeArquivo: string;
  tamanhoBytes: number;
  mimeType: string;
  resultadoIA?: ResultadoValidacaoIA;
  criadoEm: string;
  processoId: string;
}

export interface Processo {
  id: string;
  protocolo: string;
  tipo: TipoProcesso;
  status: StatusProcesso;
  riscoIA?: number;
  preRelatorio?: ResultadoValidacaoIA;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  prazoAnalise?: string;
  empresa: Empresa;
  analista?: Pick<User, "id" | "nome" | "email">;
  documentos: Documento[];
  notificacoes: Notificacao[];
}

export interface Notificacao {
  id: string;
  tipo: "EMAIL" | "SISTEMA";
  assunto: string;
  mensagem: string;
  lida: boolean;
  enviadaEm: string;
  processoId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  erro: string;
  detalhes?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export const CHECKLIST_DOCUMENTOS: Record<TipoProcesso, TipoDocumento[]> = {
  LICENCA_INICIAL: [
    "CONTRATO_SOCIAL",
    "CNPJ",
    "HABILITACAO_TECNICA",
    "COMPROVANTE_ENDERECO",
    "RG_CPF_RESPONSAVEL",
  ],
  RENOVACAO: [
    "CONTRATO_SOCIAL",
    "HABILITACAO_TECNICA",
    "ALVARA_FUNCIONAMENTO",
  ],
  ALTERACAO_ATIVIDADE: ["CONTRATO_SOCIAL", "CNPJ"],
  ALTERACAO_RESPONSAVEL: [
    "CONTRATO_SOCIAL",
    "RG_CPF_RESPONSAVEL",
    "HABILITACAO_TECNICA",
  ],
};

export const LABEL_STATUS: Record<StatusProcesso, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em Análise",
  PENDENTE_DOCUMENTOS: "Pendente de Documentos",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

export const LABEL_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CONTRATO_SOCIAL: "Contrato Social",
  ALVARA_FUNCIONAMENTO: "Alvará de Funcionamento",
  HABILITACAO_TECNICA: "Habilitação Técnica (CRF)",
  COMPROVANTE_ENDERECO: "Comprovante de Endereço",
  CNPJ: "Cartão CNPJ",
  RG_CPF_RESPONSAVEL: "RG/CPF do Responsável Técnico",
  OUTROS: "Outros",
};

export const LABEL_TIPO_PROCESSO: Record<TipoProcesso, string> = {
  LICENCA_INICIAL: "Licença inicial",
  RENOVACAO: "Renovação",
  ALTERACAO_ATIVIDADE: "Alteração de atividade",
  ALTERACAO_RESPONSAVEL: "Alteração de responsável",
};

export const LABEL_STATUS_DOCUMENTO: Record<StatusDocumento, string> = {
  PENDENTE: "Pendente",
  AGUARDANDO_VALIDACAO: "Validando",
  VALIDO: "Válido",
  INVALIDO: "Inválido",
  EXPIRADO: "Expirado",
};
