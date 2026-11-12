import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIXO_GEO = "@naesquina:geo:";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Endereço (texto) -> { lat, lng } via OpenStreetMap (Nominatim). Cacheia o resultado.
export async function geocodificar(texto, perto) {
  const chave = PREFIXO_GEO + texto.trim().toLowerCase();
  try {
    const guardado = await AsyncStorage.getItem(chave);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {}

  const tentativas = [texto, `${texto}, Salvador, Bahia`];
  for (const q of tentativas) {
    let url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=" +
      encodeURIComponent(q);
    if (perto) {
      const d = 0.3;
      url += `&viewbox=${perto.lng - d},${perto.lat + d},${perto.lng + d},${perto.lat - d}`;
    }
    try {
      const resp = await fetch(url, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const lista = await resp.json();
      if (Array.isArray(lista) && lista.length > 0) {
        const ponto = {
          lat: parseFloat(lista[0].lat),
          lng: parseFloat(lista[0].lon),
        };
        try {
          await AsyncStorage.setItem(chave, JSON.stringify(ponto));
        } catch (e) {}
        return ponto;
      }
    } catch (e) {}
    await esperar(1100); // Nominatim: no máximo 1 requisição por segundo
  }
  return null;
}

// Coordenadas -> texto curto, ex.: "Rua Luciola, 99 - Coutos"
export async function enderecoPorCoordenadas(lat, lng) {
  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1" +
      `&lat=${lat}&lon=${lng}`;
    const resp = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
    const dados = await resp.json();
    const a = dados && dados.address;
    if (!a) return "";
    const rua = a.road || a.pedestrian || a.footway || "";
    const numero = a.house_number ? `, ${a.house_number}` : "";
    const bairro =
      a.suburb || a.neighbourhood || a.city_district || a.city || a.town || "";
    const principal = `${rua}${numero}`.trim();
    return [principal, bairro].filter(Boolean).join(" - ");
  } catch (e) {
    return "";
  }
}

// Endereço (campos separados) -> { lat, lng, precisao } via OpenStreetMap (Nominatim).
// Tenta do mais preciso para o mais genérico e devolve o primeiro que achar:
//   precisao 'endereco' = rua + número | 'rua' = só a rua | 'cidade' = centro da cidade
// Nunca lança erro: se nada der certo (ou estiver sem internet), devolve null.
export async function coordenadasDoEndereco({
  rua,
  numero,
  bairro,
  cidade,
  uf,
}) {
  const consultas = [
    {
      precisao: "endereco",
      texto: `${rua}, ${numero}, ${bairro}, ${cidade}, ${uf}, Brasil`,
    },
    { precisao: "rua", texto: `${rua}, ${bairro}, ${cidade}, ${uf}, Brasil` },
    { precisao: "cidade", texto: `${cidade}, ${uf}, Brasil` },
  ];

  for (let i = 0; i < consultas.length; i++) {
    const { precisao, texto } = consultas[i];
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), 6000); // não espera mais que 6 s
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=" +
        encodeURIComponent(texto);
      const resp = await fetch(url, {
        headers: { "Accept-Language": "pt-BR" },
        signal: controle.signal,
      });
      const lista = await resp.json();
      if (Array.isArray(lista) && lista.length > 0) {
        return {
          lat: parseFloat(lista[0].lat),
          lng: parseFloat(lista[0].lon),
          precisao,
        };
      }
    } catch (e) {
      // sem internet / timeout: tenta a próxima consulta
    } finally {
      clearTimeout(relogio);
    }
    if (i < consultas.length - 1) await esperar(1100); // Nominatim: no máximo 1 requisição por segundo
  }
  return null;
}
