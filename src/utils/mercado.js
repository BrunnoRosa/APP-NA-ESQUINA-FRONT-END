// Distância em km entre dois pontos (fórmula de Haversine)
export function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number')) return null;
  const R = 6371;
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
  if (hora === null || hora === undefined || hora === '') return null;
  if (Array.isArray(hora)) return hora[0] * 60 + (hora[1] || 0);
  const [h, m] = String(hora).split(':');
  if (isNaN(Number(h))) return null;
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

function temHorariosDetalhados(mercadinho) {
  return (
    mercadinho &&
    typeof mercadinho === 'object' &&
    !Array.isArray(mercadinho) &&
    (mercadinho.abreSegSex !== undefined && mercadinho.abreSegSex !== null ||
      mercadinho.abreSabado !== undefined && mercadinho.abreSabado !== null ||
      mercadinho.abreDomingo !== undefined && mercadinho.abreDomingo !== null)
  );
}

// Devolve { abertoHoje, abertura, fechamento } para a data informada
export function obterHorarioDoDia(mercadinho, data = new Date()) {
  if (!mercadinho || typeof mercadinho !== 'object') {
    return { abertoHoje: true, abertura: null, fechamento: null };
  }

  if (!temHorariosDetalhados(mercadinho)) {
    return {
      abertoHoje: true,
      abertura: mercadinho.horarioAbertura,
      fechamento: mercadinho.horarioFechamento,
    };
  }

  const dia = data.getDay(); // 0 = Domingo, 6 = Sábado, 1..5 = Seg a Sex
  if (dia === 0) {
    return {
      abertoHoje: Boolean(mercadinho.abreDomingo),
      abertura: mercadinho.horarioAberturaDomingo,
      fechamento: mercadinho.horarioFechamentoDomingo,
    };
  }
  if (dia === 6) {
    return {
      abertoHoje: Boolean(mercadinho.abreSabado),
      abertura: mercadinho.horarioAberturaSabado,
      fechamento: mercadinho.horarioFechamentoSabado,
    };
  }
  return {
    abertoHoje: Boolean(mercadinho.abreSegSex),
    abertura: mercadinho.horarioAberturaSegSex,
    fechamento: mercadinho.horarioFechamentoSegSex,
  };
}

// Aceita estaAberto(mercadinho) OU estaAberto(abertura, fechamento)
export function estaAberto(mercadinhoOuAbertura, fechamentoLegado) {
  let abertura = mercadinhoOuAbertura;
  let fechamento = fechamentoLegado;

  if (
    mercadinhoOuAbertura &&
    typeof mercadinhoOuAbertura === 'object' &&
    !Array.isArray(mercadinhoOuAbertura)
  ) {
    const hoje = obterHorarioDoDia(mercadinhoOuAbertura);
    if (!hoje.abertoHoje) return false;
    abertura = hoje.abertura;
    fechamento = hoje.fechamento;
  }

  const ini = paraMinutos(abertura);
  const fim = paraMinutos(fechamento);
  if (ini === null || fim === null) return true;
  const agora = new Date();
  const atual = agora.getHours() * 60 + agora.getMinutes();
  return ini <= fim ? atual >= ini && atual < fim : atual >= ini || atual < fim;
}

// Texto pronto para o selo dos cards ("Aberto até às 20h30" ou "Fechado")
export function obterTextoStatusHoje(mercadinho) {
  if (!estaAberto(mercadinho)) return 'Fechado';
  const { fechamento } = obterHorarioDoDia(mercadinho);
  const fecha = formatarHora(fechamento);
  return fecha ? `Aberto até às ${fecha}` : 'Aberto';
}

// Monta a lista formatada de horários para exibição nos detalhes da loja
export function formatarHorariosDetalhados(mercadinho) {
  if (!mercadinho) return [];

  if (!temHorariosDetalhados(mercadinho)) {
    const abre = formatarHora(mercadinho.horarioAbertura);
    const fecha = formatarHora(mercadinho.horarioFechamento);
    if (!abre || !fecha) return [];
    return [{ periodo: 'Funcionamento', horario: `${abre} às ${fecha}`, aberto: true }];
  }

  const segSex = Boolean(mercadinho.abreSegSex);
  const sab = Boolean(mercadinho.abreSabado);
  const dom = Boolean(mercadinho.abreDomingo);

  const abreSeg = formatarHora(mercadinho.horarioAberturaSegSex);
  const fechaSeg = formatarHora(mercadinho.horarioFechamentoSegSex);
  const abreSab = formatarHora(mercadinho.horarioAberturaSabado);
  const fechaSab = formatarHora(mercadinho.horarioFechamentoSabado);
  const abreDom = formatarHora(mercadinho.horarioAberturaDomingo);
  const fechaDom = formatarHora(mercadinho.horarioFechamentoDomingo);

  const linhas = [];

  if (segSex && sab && abreSeg && fechaSeg && abreSeg === abreSab && fechaSeg === fechaSab) {
    linhas.push({
      periodo: 'Seg a Sáb',
      horario: `${abreSeg} às ${fechaSeg}`,
      aberto: true,
    });
  } else {
    linhas.push({
      periodo: 'Seg a Sex',
      horario: segSex && abreSeg && fechaSeg ? `${abreSeg} às ${fechaSeg}` : 'Fechado',
      aberto: segSex,
    });
    linhas.push({
      periodo: 'Sábado',
      horario: sab && abreSab && fechaSab ? `${abreSab} às ${fechaSab}` : 'Fechado',
      aberto: sab,
    });
  }

  linhas.push({
    periodo: 'Domingo',
    horario: dom && abreDom && fechaDom ? `${abreDom} às ${fechaDom}` : 'Fechado',
    aberto: dom,
  });

  return linhas;
}

// Lojas abertas primeiro. As demais mantêm a ordem original.
export function ordenarAbertasPrimeiro(lojas) {
  return [...lojas].sort((a, b) => {
    const aAberta = estaAberto(a);
    const bAberta = estaAberto(b);
    return Number(bAberta) - Number(aAberta);
  });
}