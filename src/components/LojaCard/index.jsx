import { Text, TouchableOpacity, View } from 'react-native';
import { estaAberto, formatarDistancia, formatarHora } from '../../utils/mercado';
import { styles } from './styles';

// tipo "destaque" mostra o selo verde; tipo "perto" mostra a distância em laranja
export default function LojaCard({ mercadinho, tipo, distanciaKm, onPress }) {
  const nome = mercadinho?.nomeFantasia || 'Mercadinho';
  const inicial = nome.charAt(0).toUpperCase();
  const aberto = estaAberto(mercadinho?.horarioAbertura, mercadinho?.horarioFechamento);
  const fecha = formatarHora(mercadinho?.horarioFechamento);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.verMais}>
        <Text style={styles.verMaisTexto}>Ver mais</Text>
      </View>

      <View style={styles.linha}>
        {/* Sem logo no backend: círculo com a inicial */}
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>{inicial}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={2}>{nome}</Text>

          {tipo === 'destaque' && (
            <View style={[styles.selo, !aberto && styles.seloFechado]}>
              <Text style={styles.seloTexto}>
                {aberto ? (fecha ? `Aberto até às ${fecha}` : 'Aberto') : 'Fechado'}
              </Text>
            </View>
          )}

          {tipo === 'perto' && formatarDistancia(distanciaKm) && (
            <Text style={styles.distancia}>{formatarDistancia(distanciaKm)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}