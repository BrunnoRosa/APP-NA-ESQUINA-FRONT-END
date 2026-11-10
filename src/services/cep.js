// Busca de endereço pelo CEP.
//
// Fonte principal: ViaCEP (https://viacep.com.br) — gratuita e sem cadastro.
// Reserva: BrasilAPI — só é usada se a ViaCEP estiver fora do ar / sem resposta.
//
// buscarCep("40015-000") devolve { cep, rua, bairro, cidade, uf }
// Em caso de problema, lança um Error com a propriedade `codigo`:
//   'INVALIDO'        -> o CEP não tem 8 números
//   'NAO_ENCONTRADO'  -> o CEP não existe
//   'REDE'            -> sem internet / serviço fora do ar / demorou demais

import { somenteDigitos } from "../utils/validacoes";

const TEMPO_LIMITE_MS = 8000; // desiste se o serviço não responder em 8 segundos

function erroCep(codigo, mensagem) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

// fetch com tempo limite. Devolve { status, dados } (dados = JSON ou null).
// Se estiver sem internet ou der timeout, o próprio fetch lança erro (tratado por quem chama).
async function buscarJson(url) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(url, { signal: controle.signal });
    let dados = null;
    try {
      dados = await resposta.json();
    } catch (e) {
      // resposta sem JSON válido: dados continua null
    }
    return { status: resposta.status, dados };
  } finally {
    clearTimeout(relogio);
  }
}

async function viaCep(cep) {
  const { status, dados } = await buscarJson(
    `https://viacep.com.br/ws/${cep}/json/`,
  );
  // 400 = a ViaCEP achou o formato estranho; trata como "não existe"
  if (status === 400) throw erroCep("NAO_ENCONTRADO", "CEP não encontrado.");
  if (status !== 200 || !dados) throw erroCep("REDE", "ViaCEP indisponível.");
  // CEP bem formado, mas que não existe: a ViaCEP responde 200 com { erro: true }
  if (dados.erro === true || dados.erro === "true") {
    throw erroCep("NAO_ENCONTRADO", "CEP não encontrado.");
  }
  return {
    cep,
    rua: dados.logradouro || "",
    bairro: dados.bairro || "",
    cidade: dados.localidade || "",
    uf: dados.uf || "",
  };
}

async function brasilApi(cep) {
  const { status, dados } = await buscarJson(
    `https://brasilapi.com.br/api/cep/v1/${cep}`,
  );
  if (status !== 200 || !dados)
    throw erroCep("REDE", "BrasilAPI indisponível.");
  return {
    cep,
    rua: dados.street || "",
    bairro: dados.neighborhood || "",
    cidade: dados.city || "",
    uf: dados.state || "",
  };
}

export async function buscarCep(valor) {
  const cep = somenteDigitos(valor);
  if (cep.length !== 8) throw erroCep("INVALIDO", "O CEP deve ter 8 números.");

  try {
    return await viaCep(cep);
  } catch (erro) {
    // Se a ViaCEP respondeu "não existe", é isso mesmo: não adianta perguntar de novo.
    if (erro.codigo === "NAO_ENCONTRADO") throw erro;

    // Qualquer outra falha (sem internet, timeout, servidor fora do ar): tenta a reserva.
    try {
      return await brasilApi(cep);
    } catch (erroReserva) {
      throw erroCep(
        "REDE",
        "Não foi possível consultar o serviço de CEP agora.",
      );
    }
  }
}
