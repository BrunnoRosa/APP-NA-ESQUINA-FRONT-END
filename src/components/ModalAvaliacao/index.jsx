import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { cores } from "../../theme";
import { traduzirErro } from "../../utils/validacoes";
import { styles } from "./styles";

const CRITERIOS = [
  {
    chave: "notaAtendimento",
    titulo: "Atendimento",
    descricao: "Cordialidade e atenção da equipe",
    icone: "happy-outline",
  },
  {
    chave: "notaProdutos",
    titulo: "Qualidade dos produtos",
    descricao: "Estado, validade e conservação dos itens",
    icone: "basket-outline",
  },
  {
    chave: "notaLocalizacao",
    titulo: "Localização e acesso",
    descricao: "Facilidade para encontrar e retirar o pedido",
    icone: "location-outline",
  },
  {
    chave: "notaAgilidade",
    titulo: "Agilidade",
    descricao: "Rapidez na separação e entrega",
    icone: "flash-outline",
  },
  {
    chave: "notaCustoBeneficio",
    titulo: "Custo-benefício",
    descricao: "Preços justos pelos produtos",
    icone: "pricetag-outline",
  },
];

export default function ModalAvaliacao({
  visivel,
  pedido,
  onFechar,
  onAvaliacaoEnviada,
}) {
  const { exibirAlerta } = useToast();
  const [notas, setNotas] = useState({
    notaAtendimento: 0,
    notaProdutos: 0,
    notaLocalizacao: 0,
    notaAgilidade: 0,
    notaCustoBeneficio: 0,
  });
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (visivel) {
      setNotas({
        notaAtendimento: 0,
        notaProdutos: 0,
        notaLocalizacao: 0,
        notaAgilidade: 0,
        notaCustoBeneficio: 0,
      });
      setComentario("");
      setEnviando(false);
    }
  }, [visivel, pedido?.idPedido]);

  if (!pedido) return null;

  const valores = Object.values(notas);
  const todasPreenchidas = valores.every((v) => v >= 1 && v <= 5);
  const soma = valores.reduce((acc, v) => acc + v, 0);
  const mediaAtual = todasPreenchidas ? (soma / 5).toFixed(1) : null;

  function selecionarEstrela(chave, valor) {
    setNotas((prev) => ({ ...prev, [chave]: valor }));
  }

  async function enviarAvaliacao() {
    if (!todasPreenchidas) {
      exibirAlerta(
        "Avaliação incompleta",
        "Por favor, dê de 1 a 5 estrelas para todos os 5 critérios.",
        "aviso",
      );
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        idPedido: pedido.idPedido,
        ...notas,
        comentario: comentario.trim() || null,
      };

      const response = await api.post("/api/avaliacoes", payload);
      exibirAlerta(
        "Avaliação enviada! ⭐",
        "Obrigado por ajudar a comunidade do Na Esquina.",
        "sucesso",
      );
      onAvaliacaoEnviada?.(pedido.idPedido, response.data);
    } catch (error) {
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={onFechar}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>Avaliar experiência</Text>
              <Text style={styles.subtitulo} numberOfLines={1}>
                Pedido #{pedido.idPedido} •{" "}
                {pedido.mercadinho?.nomeFantasia || "Mercadinho"}
              </Text>
            </View>

            {mediaAtual && (
              <View style={styles.mediaBadge}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={styles.mediaTexto}>{mediaAtual}</Text>
              </View>
            )}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {CRITERIOS.map((crit) => {
              const notaAtual = notas[crit.chave];
              return (
                <View key={crit.chave} style={styles.criterioBox}>
                  <View style={styles.criterioHeader}>
                    <Ionicons
                      name={crit.icone}
                      size={17}
                      color={cores.primaria}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.criterioTitulo}>{crit.titulo}</Text>
                      <Text style={styles.criterioDesc}>{crit.descricao}</Text>
                    </View>
                  </View>

                  <View style={styles.estrelasLinha}>
                    {[1, 2, 3, 4, 5].map((estrela) => {
                      const ativa = estrela <= notaAtual;
                      return (
                        <TouchableOpacity
                          key={estrela}
                          onPress={() => selecionarEstrela(crit.chave, estrela)}
                          activeOpacity={0.7}
                          style={styles.estrelaBtn}
                          accessibilityLabel={`${crit.titulo}: ${estrela} estrelas`}
                        >
                          <Ionicons
                            name={ativa ? "star" : "star-outline"}
                            size={28}
                            color={ativa ? "#F59E0B" : "#CBD5E1"}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <Text style={styles.comentarioLabel}>Comentário (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Conte como foi sua experiência com o mercadinho..."
              placeholderTextColor="#999999"
              value={comentario}
              onChangeText={setComentario}
              multiline
              maxLength={500}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.contador}>{comentario.length}/500</Text>
          </ScrollView>

          <View style={styles.botoes}>
            <TouchableOpacity
              style={styles.btnDepois}
              onPress={onFechar}
              disabled={enviando}
              activeOpacity={0.85}
            >
              <Text style={styles.btnDepoisTexto}>Avaliar depois</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnEnviar,
                (!todasPreenchidas || enviando) && styles.btnEnviarDesabilitado,
              ]}
              onPress={enviarAvaliacao}
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnEnviarTexto}>Enviar avaliação</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}