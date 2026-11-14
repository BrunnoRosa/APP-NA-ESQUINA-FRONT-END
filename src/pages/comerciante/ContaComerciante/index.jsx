import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { usePedidosPendentes } from "../../../context/PedidosPendentesContext";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/api";
import { cores } from "../../../theme";
import { styles } from "./styles";

// Uma linha do menu: ícone + texto + seta (+ selo opcional)
function ItemMenu({ icone, texto, aoPressionar, selo }) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={aoPressionar}
      activeOpacity={0.8}
    >
      <View style={styles.itemIcone}>
        <Ionicons name={icone} size={20} color={cores.primaria} />
      </View>
      <Text style={styles.itemTexto}>{texto}</Text>
      {selo > 0 && (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>{selo > 99 ? "99+" : selo}</Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={cores.textoSecundario}
      />
    </TouchableOpacity>
  );
}

export default function ContaComerciante({ navigation }) {
  const { user, signOut } = useAuth();
  const { pendentes } = usePedidosPendentes();
  const { confirmar } = useToast();
  const [sobreVisivel, setSobreVisivel] = useState(false);
  const [nomeMercado, setNomeMercado] = useState("");

  const idMercadinho = user?.idMercadinho;

  // Busca o nome da loja (se falhar, mostramos o nome do usuário)
  useFocusEffect(
    useCallback(() => {
      async function carregarNomeLoja() {
        if (!idMercadinho) return;
        try {
          const res = await api.get("/api/mercadinhos");
          const lojas = Array.isArray(res.data)
            ? res.data
            : res.data?.content || [];
          const minha = lojas.find(
            (m) => Number(m.idMercadinho || m.id) === Number(idMercadinho),
          );
          setNomeMercado(minha?.nomeFantasia || "");
        } catch (e) {
          console.warn("Não foi possível carregar o nome da loja:", e);
        }
      }
      carregarNomeLoja();
    }, [idMercadinho]),
  );

  const nome = nomeMercado || user?.nome || "Minha loja";
  const inicial = nome.trim().charAt(0).toUpperCase();

  // Pergunta antes de sair (quadro no centro da tela, igual na web e no celular)
  async function confirmarSaida() {
    const sim = await confirmar({
      titulo: "Sair da conta",
      mensagem: "Deseja realmente sair da sua conta?",
      textoConfirmar: "Sim, sair",
      tipo: "perigo",
    });
    if (sim) signOut();
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.avatar}>
          {inicial ? (
            <Text style={styles.avatarLetra}>{inicial}</Text>
          ) : (
            <Ionicons name="storefront" size={40} color={cores.primaria} />
          )}
        </View>
        <Text style={styles.nome} numberOfLines={1}>
          {nome}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user?.email}
        </Text>
      </LinearGradient>

      <View style={styles.folha}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.secao}>Minha conta</Text>
          <View style={styles.cartao}>
            <ItemMenu
              icone="create-outline"
              texto="Editar perfil"
              aoPressionar={() => navigation.navigate("EditarPerfil")}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="cube-outline"
              texto="Catálogo de produtos"
              aoPressionar={() => navigation.navigate("GerenciarProdutos")}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="receipt-outline"
              texto="Pedidos recebidos"
              selo={pendentes}
              aoPressionar={() => navigation.navigate("GerenciarPedidos")}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="star-outline"
              texto="Ofertas e destaques"
              aoPressionar={() => navigation.navigate("GerenciarVitrine")}
            />
          </View>

          <Text style={styles.secao}>Ajuda</Text>
          <View style={styles.cartao}>
            <ItemMenu
              icone="information-circle-outline"
              texto="Sobre o Na Esquina"
              aoPressionar={() => setSobreVisivel(true)}
            />
          </View>

          <TouchableOpacity
            style={styles.botaoSair}
            onPress={confirmarSaida}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.botaoSairTexto}>Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal "Sobre" */}
      <Modal
        visible={sobreVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setSobreVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <View style={styles.modalIcone}>
              <Ionicons
                name="storefront-outline"
                size={32}
                color={cores.primaria}
              />
            </View>
            <Text style={styles.modalTitulo}>Na Esquina</Text>
            <Text style={styles.modalTexto}>
              Aplicativo que aproxima os clientes dos mercadinhos do bairro:
              cadastre seus produtos, destaque suas ofertas e gerencie os
              pedidos recebidos.
            </Text>
            <Text style={styles.modalRodape}>
              Projeto de TCC • SENAI Dendezeiros
            </Text>
            <TouchableOpacity
              style={styles.modalBotao}
              onPress={() => setSobreVisivel(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBotaoTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}