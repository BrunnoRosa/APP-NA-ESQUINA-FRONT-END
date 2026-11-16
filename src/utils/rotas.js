// utils/rotas.js
// Abre a rota até um mercadinho em outro aplicativo (Google Maps, Waze ou Apple Maps).
//
// Usa links "universais" (https://...). Eles funcionam no celular (abrem o app instalado ou o
// navegador), na web, e não exigem chave de API nem configuração extra de permissões.
// Sem origem no link: o próprio app de mapas usa a localização atual da pessoa.
import { Linking, Platform } from 'react-native';

// Aceita { latitude, longitude, endereco }. Prefere coordenadas; sem elas, usa o endereço.
function resolverDestino(mercado) {
  const lat = Number(mercado?.latitude);
  const lng = Number(mercado?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    return { coord: `${lat},${lng}` };
  }
  const endereco = mercado?.endereco?.trim();
  return endereco ? { texto: encodeURIComponent(endereco) } : null;
}

export function temDestino(mercado) {
  return resolverDestino(mercado) !== null;
}

const APPS = [
  {
    id: 'google',
    nome: 'Google Maps',
    descricao: 'Rota com trânsito em tempo real',
    icone: 'map',
    url: (d) =>
      `https://www.google.com/maps/dir/?api=1&destination=${d.coord || d.texto}&travelmode=driving`,
  },
  {
    id: 'waze',
    nome: 'Waze',
    descricao: 'Navegação com avisos da comunidade',
    icone: 'navigate',
    url: (d) =>
      d.coord
        ? `https://waze.com/ul?ll=${d.coord}&navigate=yes`
        : `https://waze.com/ul?q=${d.texto}&navigate=yes`,
  },
  {
    id: 'apple',
    nome: 'Apple Maps',
    descricao: 'Mapa padrão do iPhone',
    icone: 'logo-apple',
    soIos: true,
    url: (d) => `https://maps.apple.com/?daddr=${d.coord || d.texto}&dirflg=d`,
  },
];

// Lista dos apps que fazem sentido na plataforma atual
export function appsDisponiveis() {
  return APPS.filter((a) => !a.soIos || Platform.OS === 'ios');
}

// Abre a rota no app escolhido. Lança erro se não houver destino ou se o link não abrir.
export async function abrirRota(idApp, mercado) {
  const destino = resolverDestino(mercado);
  if (!destino) throw new Error('SEM_DESTINO');

  const app = APPS.find((a) => a.id === idApp) || APPS[0];
  await Linking.openURL(app.url(destino));
}