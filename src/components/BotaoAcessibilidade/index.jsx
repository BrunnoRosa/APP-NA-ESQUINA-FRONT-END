import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAcessibilidade } from "../../context/AcessibilidadeContext";
import { NIVEIS_FONTE } from "../../theme";
import { styles } from "./styles";

export default function BotaoAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  const {
    tema,
    nivelFonte,
    paleta,
    alterarTema,
    alterarNivelFonte,
    aumentarFonte,
    diminuirFonte,
    resetarAcessibilidade,
  } = useAcessibilidade();

  const escuro = tema === "escuro";
  const indiceAtual = NIVEIS_FONTE.findIndex((n) => n.id === nivelFonte);
  const podeDiminuir = indiceAtual > 0;
  const podeAumentar = indiceAtual < NIVEIS_FONTE.length - 1;

  const fundoCard = escuro ? "#1E1E1E" : "#FFFFFF";
  const fundoSecao = escuro ? "#2A2A2A" : "#F5F6F9";
  const corTexto = escuro ? "#F3F4F6" : "#232447";
  const corSubtexto = escuro ? "#B8BCC2" : "#6C7278";

  return (
    <>
      {/* Botão flutuante no canto inferior esquerdo (não conflita com BotaoCarrinho na direita) */}
      <TouchableOpacity
        style={[
          styles.botaoFlutuante,
          { backgroundColor: escuro ? "#2563EB" : "#1F4E8C" },
        ]}
        onPress={() => setAberto(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Abrir opções de acessibilidade"
        accessibilityHint="Permite escolher tema claro ou escuro e ajustar o tamanho das letras"
      >
        <Ionicons name="accessibility" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setAberto(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: fundoCard }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <View style={styles.header}>
              <View style={styles.headerTituloLinha}>
                <View style={styles.iconeCirculo}>
                  <Ionicons name="accessibility" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.titulo, { color: corTexto }]}>
                    Acessibilidade
                  </Text>
                  <Text style={[styles.subtitulo, { color: corSubtexto }]}>
                    Personalize a visualização do app
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btnFechar, { backgroundColor: fundoSecao }]}
                onPress={() => setAberto(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu de acessibilidade"
              >
                <Ionicons name="close" size={20} color={corTexto} />
              </TouchableOpacity>
            </View>

            {/* Seção 1: Tema Claro / Escuro */}
            <Text style={[styles.secaoLabel, { color: corSubtexto }]}>
              Tema de cores
            </Text>
            <View style={styles.opcoesLinha}>
              <TouchableOpacity
                style={[
                  styles.opcaoTema,
                  {
                    backgroundColor: !escuro ? "#FFF2D0" : fundoSecao,
                    borderColor: !escuro ? "#FB8701" : "transparent",
                  },
                ]}
                onPress={() => alterarTema("claro")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: !escuro }}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={!escuro ? "#FB8701" : corSubtexto}
                />
                <Text
                  style={[
                    styles.opcaoTemaTexto,
                    { color: !escuro ? "#B45309" : corTexto },
                  ]}
                >
                  Claro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.opcaoTema,
                  {
                    backgroundColor: escuro ? "#1E3A8A" : fundoSecao,
                    borderColor: escuro ? "#60A5FA" : "transparent",
                  },
                ]}
                onPress={() => alterarTema("escuro")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: escuro }}
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={escuro ? "#93C5FD" : corSubtexto}
                />
                <Text
                  style={[
                    styles.opcaoTemaTexto,
                    { color: escuro ? "#FFFFFF" : corTexto },
                  ]}
                >
                  Escuro
                </Text>
              </TouchableOpacity>
            </View>

            {/* Seção 2: Tamanho das letras (3 níveis) */}
            <Text style={[styles.secaoLabel, { color: corSubtexto }]}>
              Tamanho das letras
            </Text>

            <View style={styles.controleFonteLinha}>
              <TouchableOpacity
                style={[
                  styles.btnPassoFonte,
                  {
                    backgroundColor: fundoSecao,
                    opacity: podeDiminuir ? 1 : 0.4,
                  },
                ]}
                onPress={diminuirFonte}
                disabled={!podeDiminuir}
                accessibilityRole="button"
                accessibilityLabel="Diminuir tamanho das letras"
              >
                <Text style={[styles.btnPassoTexto, { color: corTexto }]}>
                  A-
                </Text>
              </TouchableOpacity>

              <View style={styles.niveisGrupo}>
                {NIVEIS_FONTE.map((nivel) => {
                  const ativo = nivel.id === nivelFonte;
                  return (
                    <TouchableOpacity
                      key={nivel.id}
                      style={[
                        styles.nivelChip,
                        {
                          backgroundColor: ativo ? paleta.primaria : fundoSecao,
                        },
                      ]}
                      onPress={() => alterarNivelFonte(nivel.id)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativo }}
                    >
                      <Text
                        style={[
                          styles.nivelChipExemplo,
                          { color: ativo ? "#FFFFFF" : corTexto },
                        ]}
                      >
                        {nivel.exemplo}
                      </Text>
                      <Text
                        style={[
                          styles.nivelChipRotulo,
                          { color: ativo ? "#FFFFFF" : corSubtexto },
                        ]}
                      >
                        {nivel.rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.btnPassoFonte,
                  {
                    backgroundColor: fundoSecao,
                    opacity: podeAumentar ? 1 : 0.4,
                  },
                ]}
                onPress={aumentarFonte}
                disabled={!podeAumentar}
                accessibilityRole="button"
                accessibilityLabel="Aumentar tamanho das letras"
              >
                <Text style={[styles.btnPassoTexto, { color: corTexto }]}>
                  A+
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rodapé: Restaurar padrão */}
            {(tema !== "claro" || nivelFonte !== "normal") && (
              <TouchableOpacity
                style={styles.btnResetar}
                onPress={resetarAcessibilidade}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={paleta.primaria}
                />
                <Text
                  style={[styles.btnResetarTexto, { color: paleta.primaria }]}
                >
                  Restaurar padrão
                </Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}