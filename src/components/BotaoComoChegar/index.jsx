// components/BotaoComoChegar/index.jsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { cores } from '../../theme';
import { abrirRota, appsDisponiveis, temDestino } from '../../utils/rotas';
import { styles } from './styles';

/**
 * Props:
 *  - mercado: { nomeFantasia, endereco, latitude, longitude }
 *  - compacto: true => botão menor (para cards e balões do mapa)
 */
export default function BotaoComoChegar({ mercado, compacto = false }) {
  const { exibirAlerta } = useToast();
  const [aberto, setAberto] = useState(false);

  function aoPressionar() {
    if (!temDestino(mercado)) {
      exibirAlerta('Atenção', 'Este mercado ainda não tem localização cadastrada.', 'aviso');
      return;
    }
    setAberto(true);
  }

  async function escolher(idApp) {
    setAberto(false);
    try {
      await abrirRota(idApp, mercado);
    } catch (e) {
      exibirAlerta('Erro', 'Não foi possível abrir o aplicativo de mapas neste aparelho.');
    }
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.botao, compacto && styles.botaoCompacto]}
        onPress={aoPressionar}
        activeOpacity={0.85}
      >
        <Ionicons name="navigate" size={compacto ? 14 : 18} color="#FFFFFF" />
        <Text style={[styles.botaoTexto, compacto && styles.botaoTextoCompacto]}>Como chegar</Text>
      </TouchableOpacity>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.fundo} onPress={() => setAberto(false)}>
          <Pressable style={styles.folha} onPress={() => {}}>
            <Text style={styles.titulo}>Ir até {mercado?.nomeFantasia || 'o mercadinho'}</Text>
            {mercado?.endereco ? (
              <Text style={styles.endereco} numberOfLines={2}>
                {mercado.endereco}
              </Text>
            ) : null}

            {appsDisponiveis().map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.opcao}
                onPress={() => escolher(app.id)}
                activeOpacity={0.8}
              >
                <View style={styles.opcaoIcone}>
                  <Ionicons name={app.icone} size={20} color={cores.primaria} />
                </View>
                <View style={styles.opcaoInfo}>
                  <Text style={styles.opcaoNome}>{app.nome}</Text>
                  <Text style={styles.opcaoDescricao}>{app.descricao}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={cores.icone} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.cancelar} onPress={() => setAberto(false)} activeOpacity={0.8}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}