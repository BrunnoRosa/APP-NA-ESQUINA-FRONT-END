// Distância em km entre dois pontos (fórmula de Haversine)
export function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number')) return null;
  const R = 6371; // raio da Terra em km
  const rad = (graus) => (graus * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 100 m, 450 m, 1.3 km...
export function formatarDistancia(km) {
  if (km === null || km === undefined) return null;
  if (km < 1) return `${Math.round(km * 1000)}m de distância`;
  return `${km.toFixed(1)} km de distância`;
}

// Aceita "08:00:00", "08:00" ou [8, 0] e devolve minutos desde 00:00
function paraMinutos(hora) {
  if (hora === null || hora === undefined) return null;
  if (Array.isArray(hora)) return hora[0] * 60 + (hora[1] || 0);
  const [h, m] = String(hora).split(':');
  return Number(h) * 60 + Number(m || 0);
}

// "20:00:00" vira "20h" e "20:30:00" vira "20h30"
export function formatarHora(hora) {
  const min = paraMinutos(hora);
  if (min === null) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

// Está aberto agora? Sem horário cadastrado, considera aberto.
export function estaAberto(abertura, fechamento) {
  const ini = paraMinutos(abertura);
  const fim = paraMinutos(fechamento);
  if (ini === null || fim === null) return true;
  const agora = new Date();
  const atual = agora.getHours() * 60 + agora.getMinutes();
  // Se fecha depois da meia-noite (ex.: 18h às 02h)
  return ini <= fim ? atual >= ini && atual < fim : atual >= ini || atual < fim;
}