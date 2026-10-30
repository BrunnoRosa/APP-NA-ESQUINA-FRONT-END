// Validações e máscaras do app Na Esquina.
//
// Regra de ouro: o BACK-END é quem manda (ele é a barreira de verdade). A validação aqui no
// front serve para o usuário ver o erro na hora, no campo certo, sem esperar o servidor.
// Por isso as regras abaixo espelham as do back (UsuarioRequestDTO).
//
// Todas as funções validarXxx devolvem:
//   ''        -> campo OK
//   'texto'   -> mensagem de erro para mostrar embaixo do campo

// ---------------------------------------------------------------- utilidades

// Só os dígitos de um texto: "(71) 99999-9999" -> "71999999999"
export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

// Tira espaços das pontas e junta espaços repetidos: "  Ana   Maria " -> "Ana Maria"
export function limparEspacos(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------- validações

export function validarNome(valor) {
  const nome = limparEspacos(valor);
  if (!nome) return 'O nome é obrigatório.';
  if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  if (nome.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  // Letras (com acento), espaço, ponto, apóstrofo e hífen. Sem números nem símbolos.
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'-]*$/.test(nome)) {
    return 'O nome deve conter apenas letras e espaços.';
  }
  return '';
}

export function validarEmail(valor) {
  const email = String(valor ?? '').trim();
  if (!email) return 'O e-mail é obrigatório.';
  if (email.length > 150) return 'O e-mail deve ter no máximo 150 caracteres.';
  // algo@dominio.xx  (sem espaços, um único @, domínio com ponto)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return 'Formato de e-mail inválido.';
  return '';
}

// "Somente exigir preenchimento" é o que o LOGIN usa (quem decide se a senha está certa é o back).
export function validarSenhaLogin(valor) {
  if (!valor) return 'A senha é obrigatória.';
  return '';
}

// Regras de CRIAÇÃO de senha (cadastro).
export function validarSenha(valor) {
  const senha = String(valor ?? '');
  if (!senha) return 'A senha é obrigatória.';
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (senha.length > 72) return 'A senha deve ter no máximo 72 caracteres.';
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    return 'A senha deve conter pelo menos uma letra e um número.';
  }
  return '';
}

// Telefone brasileiro: DDD (11 a 99) + celular (9 + 8 dígitos) ou fixo (2 a 5 + 7 dígitos).
export function validarTelefone(valor) {
  const digitos = somenteDigitos(valor);
  if (!digitos) return 'O telefone é obrigatório.';
  if (!/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(digitos)) {
    return 'Telefone inválido. Informe DDD + número (ex.: 71 99999-9999).';
  }
  return '';
}

// CNPJ com os 2 dígitos verificadores (o mesmo cálculo da Receita).
export function cnpjEhValido(valor) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false; // 00000000000000, 11111111111111...

  const calcularDigito = (base) => {
    // pesos: 2..9 repetindo, da direita para a esquerda
    let soma = 0;
    let peso = 2;
    for (let i = base.length - 1; i >= 0; i--) {
      soma += Number(base[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(cnpj.slice(0, 12));
  const d2 = calcularDigito(cnpj.slice(0, 12) + d1);
  return cnpj.endsWith(`${d1}${d2}`);
}

export function validarCnpj(valor) {
  const digitos = somenteDigitos(valor);
  if (!digitos) return 'O CNPJ é obrigatório.';
  if (digitos.length !== 14) return 'O CNPJ deve ter 14 números.';
  if (!cnpjEhValido(digitos)) return 'CNPJ inválido. Confira os números.';
  return '';
}

export function validarNomeFantasia(valor) {
  const nome = limparEspacos(valor);
  if (!nome) return 'O nome do mercadinho é obrigatório.';
  if (nome.length < 2) return 'O nome do mercadinho deve ter pelo menos 2 caracteres.';
  if (nome.length > 100) return 'O nome do mercadinho deve ter no máximo 100 caracteres.';
  return '';
}

export function validarEndereco(valor) {
  const endereco = limparEspacos(valor);
  if (!endereco) return 'O endereço é obrigatório.';
  if (endereco.length < 5) return 'Informe o endereço completo (rua, número, bairro).';
  if (endereco.length > 200) return 'O endereço deve ter no máximo 200 caracteres.';
  return '';
}

// Horário no formato HH:mm (00:00 a 23:59).
export function validarHorario(valor, rotulo = 'horário') {
  const horario = String(valor ?? '').trim();
  if (!horario) return `Informe o ${rotulo}.`;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) return `Use o formato HH:mm (ex.: 08:00).`;
  return '';
}

// Abertura tem que ser ANTES do fechamento (compara em minutos: "08:30" -> 510).
export function validarOrdemHorarios(abertura, fechamento) {
  const paraMinutos = (h) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };
  if (paraMinutos(abertura) >= paraMinutos(fechamento)) {
    return 'O horário de fechamento deve ser depois da abertura.';
  }
  return '';
}

// ---------------------------------------------------------------- máscaras
// Máscara = formata o texto enquanto a pessoa digita.

// 71999999999 -> (71) 99999-9999   |   7133334444 -> (71) 3333-4444
export function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// 11222333000181 -> 11.222.333/0001-81
export function mascaraCnpj(valor) {
  const d = somenteDigitos(valor).slice(0, 14);
  let r = d.slice(0, 2);
  if (d.length > 2) r += `.${d.slice(2, 5)}`;
  if (d.length > 5) r += `.${d.slice(5, 8)}`;
  if (d.length > 8) r += `/${d.slice(8, 12)}`;
  if (d.length > 12) r += `-${d.slice(12, 14)}`;
  return r;
}

// 0800 -> 08:00
export function mascaraHorario(valor) {
  const d = somenteDigitos(valor).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

// ---------------------------------------------------------------- erros da API

// Transforma o erro do Axios em algo que a tela consegue mostrar.
// Devolve { titulo, mensagem, campos }:
//   campos  -> { nomeDoCampo: 'mensagem' } quando o back apontou campos (HTTP 400 de validação)
//   mensagem -> texto único para mostrar em alerta
export function traduzirErro(error) {
  // Sem resposta do servidor: rede caiu, back desligado, IP errado ou demorou demais.
  if (!error || !error.response) {
    if (error && error.code === 'ECONNABORTED') {
      return {
        titulo: 'Servidor demorou a responder',
        mensagem: 'A conexão demorou demais. Tente novamente em instantes.',
        campos: {},
      };
    }
    return {
      titulo: 'Sem conexão',
      mensagem: 'Não foi possível conectar ao servidor. Verifique sua internet e se o back-end está ativo.',
      campos: {},
    };
  }

  const { status, data } = error.response;

  // O back responde de dois jeitos:
  //  - erro de campo:  { "email": "Formato de e-mail inválido", ... }  (HTTP 400)
  //  - erro geral:     { timestamp, status, error, message, path }
  const ehErroPadrao = data && typeof data === 'object' && typeof data.message === 'string' && 'status' in data;

  if (ehErroPadrao) {
    return { titulo: tituloPorStatus(status), mensagem: data.message, campos: {} };
  }

  if (status === 400 && data && typeof data === 'object') {
    const campos = {};
    Object.keys(data).forEach((chave) => {
      if (typeof data[chave] === 'string') campos[chave] = data[chave];
    });
    return {
      titulo: 'Confira os dados',
      mensagem: Object.values(campos).join('\n') || 'Dados inválidos.',
      campos,
    };
  }

  if (typeof data === 'string' && data.trim()) {
    return { titulo: tituloPorStatus(status), mensagem: data, campos: {} };
  }

  return { titulo: tituloPorStatus(status), mensagem: mensagemPorStatus(status), campos: {} };
}

function tituloPorStatus(status) {
  if (status === 401) return 'Acesso negado';
  if (status === 403) return 'Sem permissão';
  if (status === 404) return 'Não encontrado';
  if (status === 409) return 'Já cadastrado';
  if (status >= 500) return 'Erro no servidor';
  return 'Erro';
}

function mensagemPorStatus(status) {
  if (status === 400) return 'Dados inválidos.';
  if (status === 401) return 'E-mail ou senha incorretos.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Este registro já existe.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';
  return 'Não foi possível concluir a operação.';
}
