import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/api";
import { buscarCep } from "../../../services/cep";
import { cores } from "../../../theme";
import { geocodificar } from "../../../utils/geocodificacao";
import {
  limparEspacos,
  mascaraCep,
  mascaraHorario,
  mascaraTelefone,
  somenteDigitos,
  traduzirErro,
  validarCep,
  validarEndereco,
  validarHorario,
  validarNome,
  validarNomeFantasia,
  validarOrdemHorarios,
  validarTelefone,
} from "../../../utils/validacoes";
import { styles } from "./styles";

// Campo reutilizável: rótulo + input + mensagem de erro
function Campo({ rotulo, valor, aoMudar, erro, somenteLeitura, ...resto }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[
          styles.campo,
          erro && styles.campoErro,
          somenteLeitura && styles.campoBloqueado,
        ]}
        value={valor}
        onChangeText={aoMudar}
        editable={!somenteLeitura}
        placeholderTextColor="#A0A4A8"
        {...resto}
      />
      {!!erro && <Text style={styles.textoErro}>{erro}</Text>}
    </View>
  );
}

// O endereço precisa ter o número da loja (ex.: "Rua Chile, 123, Centro") ou "S/N".
function enderecoTemNumero(texto) {
  return /\d|\bs\/?n\b/i.test(texto);
}

// Descobre a posição no mapa, mas nunca deixa o "Salvar" travado:
// se o serviço de mapas não responder em 8 segundos, desiste e devolve null.
function descobrirPosicao(texto) {
  const limite = new Promise((resolve) =>
    setTimeout(() => resolve(null), 8000),
  );
  return Promise.race([geocodificar(texto).catch(() => null), limite]);
}

export default function EditarPerfil({ navigation }) {
  const { user, atualizarUsuario } = useAuth();
  const { exibirAlerta } = useToast(); // avisos (sucesso / erro / atenção) aparecem como toast no topo
  const ehComerciante = user?.perfil === "COMERCIANTE";

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Dados pessoais
  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState("");
  const email = user?.email || "";

  // Dados do mercado (só comerciante)
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  // Latitude/longitude NÃO aparecem mais na tela: ficam guardadas aqui só para reenviar
  // quando o endereço não mudou, e são recalculadas automaticamente quando ele muda.
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [abertura, setAbertura] = useState("");
  const [fechamento, setFechamento] = useState("");
  const [cnpj, setCnpj] = useState("");

  // Endereço/CEP como vieram do servidor: serve para saber se o usuário mudou o local
  const original = useRef({ endereco: "", cep: "" });
  // Último CEP já consultado: evita repetir a busca e ignora respostas atrasadas
  const ultimoCep = useRef("");

  // Senha (opcional)
  const [trocarSenha, setTrocarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [erros, setErros] = useState({});

  useEffect(() => {
    async function carregar() {
      // 1) Dados do usuário
      try {
        const res = await api.get("/api/usuarios/me");
        if (res.data?.nome) setNome(res.data.nome);
        if (res.data?.telefone) setTelefone(mascaraTelefone(res.data.telefone));
      } catch (e) {
        // Fallback: mantém dados do AuthContext
      }

      // 2) Dados do mercado (comerciante)
      if (ehComerciante && (user?.idMercadinho || user?.mercadinhoId)) {
        const idM = user.idMercadinho || user.mercadinhoId;
        try {
          let meu = null;
          try {
            const res = await api.get(`/api/mercadinhos/${idM}`);
            meu = res.data;
          } catch (e) {
            const res = await api.get("/api/mercadinhos");
            const lista = Array.isArray(res.data)
              ? res.data
              : res.data?.content || [];
            meu = lista.find(
              (m) => Number(m.idMercadinho || m.id) === Number(idM),
            );
          }

          if (meu) {
            setNomeFantasia(meu.nomeFantasia || "");
            setEndereco(meu.endereco || "");
            setCep(mascaraCep(meu.cep || ""));
            setLatitude(meu.latitude != null ? String(meu.latitude) : "");
            setLongitude(meu.longitude != null ? String(meu.longitude) : "");
            setAbertura(String(meu.horarioAbertura || "").slice(0, 5));
            setFechamento(String(meu.horarioFechamento || "").slice(0, 5));
            setCnpj(meu.cnpj || "");
            original.current = {
              endereco: limparEspacos(meu.endereco || ""),
              cep: somenteDigitos(meu.cep || ""),
            };
            ultimoCep.current = somenteDigitos(meu.cep || ""); // não busca de novo o CEP que já estava salvo
          }
        } catch (e) {
          exibirAlerta(
            "Erro ao carregar",
            "Não foi possível carregar os dados do mercado.",
          );
        }
      }
      setCarregando(false);
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehComerciante, user]);

  // O usuário mudou o local da loja? (endereço ou CEP diferentes do que está salvo)
  function mudouLocal() {
    return (
      limparEspacos(endereco) !== original.current.endereco ||
      somenteDigitos(cep) !== original.current.cep
    );
  }

  // ---------------------------- busca de CEP ----------------------------
  async function buscarEnderecoPorCep(digitos) {
    setBuscandoCep(true);
    try {
      const d = await buscarCep(digitos);
      if (ultimoCep.current !== digitos) return; // o usuário já digitou outro CEP

      setErros((a) => ({ ...a, cep: "" }));

      // CEP "geral" da cidade (sem rua): não mexe no endereço, só orienta
      if (!d.rua) {
        exibirAlerta(
          "CEP encontrado",
          `${d.cidade} - ${d.uf}. Esse CEP não tem rua: digite o endereço completo.`,
          "aviso",
        );
        return;
      }

      // Monta "Rua, Bairro, Cidade - UF". O NÚMERO a pessoa acrescenta depois da rua.
      const partes = [d.rua, d.bairro, `${d.cidade} - ${d.uf}`].filter(Boolean);
      setEndereco(partes.join(", "));
      setErros((a) => ({ ...a, endereco: "" }));
      exibirAlerta(
        "Endereço encontrado",
        "Acrescente o número depois da rua (ex.: Rua Chile, 123, Centro).",
        "sucesso",
      );
    } catch (erro) {
      if (ultimoCep.current !== digitos) return;
      if (erro.codigo === "NAO_ENCONTRADO") {
        setErros((a) => ({ ...a, cep: "CEP não encontrado." }));
        exibirAlerta(
          "CEP não encontrado",
          "Confira o número ou preencha o endereço manualmente.",
          "aviso",
        );
      } else {
        // Sem internet / serviço fora do ar: libera para tentar de novo com o mesmo CEP
        ultimoCep.current = "";
        exibirAlerta(
          "Sem conexão com o serviço de CEP",
          "Preencha o endereço manualmente ou tente de novo.",
          "erro",
        );
      }
    } finally {
      setBuscandoCep(false);
    }
  }

  // Chamado a cada letra digitada no CEP: aplica a máscara e, com 8 números, busca sozinho
  function aoMudarCep(valor) {
    const mascarado = mascaraCep(valor);
    setCep(mascarado);
    setErros((a) => ({ ...a, cep: "" }));

    const digitos = somenteDigitos(mascarado);
    if (digitos.length < 8) {
      ultimoCep.current = "";
      return;
    }
    if (digitos === ultimoCep.current) return; // mesmo CEP: não busca de novo
    ultimoCep.current = digitos;
    buscarEnderecoPorCep(digitos);
  }

  // ------------------------------ validação ------------------------------
  function validar() {
    const e = {};
    const eNome = validarNome(nome);
    if (eNome) e.nome = eNome;

    if (telefone) {
      const eTel = validarTelefone(telefone);
      if (eTel) e.telefone = eTel;
    }

    if (ehComerciante) {
      const eNf = validarNomeFantasia(nomeFantasia);
      if (eNf) e.nomeFantasia = eNf;

      const eEnd = validarEndereco(endereco);
      if (eEnd) e.endereco = eEnd;
      // Só cobra o número quando o local foi alterado (contas antigas continuam salvando normalmente)
      else if (mudouLocal() && !enderecoTemNumero(endereco))
        e.endereco =
          "Informe o número do local (ou S/N). Ex.: Rua Chile, 123, Centro";

      // CEP continua opcional aqui, mas se foi digitado precisa estar completo
      const eCep = validarCep(cep, false);
      if (eCep) e.cep = eCep;

      const eAb = validarHorario(abertura, "horário de abertura");
      if (eAb) e.abertura = eAb;

      const eFe = validarHorario(fechamento, "horário de fechamento");
      if (eFe) e.fechamento = eFe;

      if (!eAb && !eFe) {
        const eOrd = validarOrdemHorarios(abertura, fechamento);
        if (eOrd) e.fechamento = eOrd;
      }
    }

    if (trocarSenha) {
      if (!senhaAtual) e.senhaAtual = "Informe a senha atual.";
      if (novaSenha.length < 8 || novaSenha.length > 72)
        e.novaSenha = "A nova senha deve ter de 8 a 72 caracteres.";
      else if (!/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha))
        e.novaSenha = "Use letras e números.";
    }

    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function tentar(chamada) {
    try {
      await chamada();
      return "ok";
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) return "indisponivel";
      throw error;
    }
  }

  async function salvar() {
    if (!validar()) {
      exibirAlerta(
        "Confira os dados",
        "Corrija os campos destacados em vermelho.",
        "aviso",
      );
      return;
    }

    setSalvando(true);
    try {
      const resultados = [];
      let posicaoNaoAtualizada = false;

      // Atualiza usuário
      resultados.push(
        await tentar(() =>
          api.put("/api/usuarios/me", {
            nome: limparEspacos(nome),
            telefone: somenteDigitos(telefone) || undefined,
          }),
        ),
      );

      // Atualiza mercadinho
      const idM = user?.idMercadinho || user?.mercadinhoId;
      if (ehComerciante && idM) {
        // Posição no mapa: começa com a que já estava salva...
        let lat = latitude ? parseFloat(latitude.replace(",", ".")) : null;
        let lng = longitude ? parseFloat(longitude.replace(",", ".")) : null;

        // ...e só é recalculada se o endereço/CEP mudou
        if (mudouLocal()) {
          const ponto = await descobrirPosicao(limparEspacos(endereco));
          if (ponto) {
            lat = ponto.lat;
            lng = ponto.lng;
            setLatitude(String(lat));
            setLongitude(String(lng));
          } else {
            posicaoNaoAtualizada = true; // salva o endereço, mas avisa que o mapa ficou como estava
          }
        }

        resultados.push(
          await tentar(() =>
            api.put(`/api/mercadinhos/${idM}`, {
              nomeFantasia: limparEspacos(nomeFantasia),
              endereco: limparEspacos(endereco),
              cep: somenteDigitos(cep) || undefined,
              horarioAbertura: abertura ? `${abertura}:00` : undefined,
              horarioFechamento: fechamento ? `${fechamento}:00` : undefined,
              latitude: lat,
              longitude: lng,
            }),
          ),
        );

        // Passou a ser o "novo normal"; se a posição falhou, deixa para tentar de novo no próximo salvar
        if (!posicaoNaoAtualizada) {
          original.current = {
            endereco: limparEspacos(endereco),
            cep: somenteDigitos(cep),
          };
        }
      }

      // Alteração de senha
      if (trocarSenha) {
        resultados.push(
          await tentar(() =>
            api.put("/api/usuarios/me/senha", {
              senhaAtual,
              novaSenha,
              senha: novaSenha,
            }),
          ),
        );
      }

      if (resultados.includes("indisponivel")) {
        exibirAlerta(
          "Função indisponível",
          "Esta função ainda não está disponível no servidor. Avise a equipe do back-end.",
          "erro",
        );
        return;
      }

      await atualizarUsuario({ nome: limparEspacos(nome) });
      setSenhaAtual("");
      setNovaSenha("");
      setTrocarSenha(false);

      if (posicaoNaoAtualizada) {
        exibirAlerta(
          "Dados salvos, mas a posição não mudou",
          "Não foi possível localizar o novo endereço no mapa agora. Os clientes ainda veem a posição anterior; salve de novo mais tarde.",
          "aviso",
        );
      } else {
        exibirAlerta(
          "Dados atualizados",
          "Suas alterações foram salvas com sucesso.",
          "sucesso",
        );
      }
    } catch (error) {
      const t = traduzirErro(error);
      const camposDoServidor = { ...t.campos };
      // "Senha atual incorreta" vem como mensagem geral: marca o campo certo
      if (trocarSenha && /senha atual/i.test(t.mensagem || "")) {
        camposDoServidor.senhaAtual = t.mensagem;
      }
      setErros((antigos) => ({ ...antigos, ...camposDoServidor }));
      exibirAlerta(t.titulo, t.mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Editar perfil</Text>
            <Text style={styles.subtitulo}>
              {ehComerciante
                ? "Seus dados e os do mercado"
                : "Mantenha seus dados em dia"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.secao}>Dados pessoais</Text>
            <View style={styles.cartao}>
              <Campo
                rotulo="Nome completo"
                valor={nome}
                aoMudar={setNome}
                erro={erros.nome}
                autoCapitalize="words"
              />
              <Campo
                rotulo="Telefone"
                valor={telefone}
                aoMudar={(v) => setTelefone(mascaraTelefone(v))}
                erro={erros.telefone}
                keyboardType="phone-pad"
                placeholder="(71) 99999-9999"
              />
              <Campo
                rotulo="E-mail (não pode ser alterado)"
                valor={email}
                somenteLeitura
              />
            </View>

            {ehComerciante && (
              <>
                <Text style={styles.secao}>Dados do mercado</Text>
                <View style={styles.cartao}>
                  <Campo
                    rotulo="Nome do mercadinho"
                    valor={nomeFantasia}
                    aoMudar={setNomeFantasia}
                    erro={erros.nomeFantasia}
                  />
                  <Campo
                    rotulo={buscandoCep ? "CEP (buscando endereço...)" : "CEP"}
                    valor={cep}
                    aoMudar={aoMudarCep}
                    erro={erros.cep}
                    keyboardType="numeric"
                    placeholder="40000-000"
                    maxLength={9}
                  />
                  <Campo
                    rotulo="Endereço"
                    valor={endereco}
                    aoMudar={(v) => {
                      setEndereco(v);
                      setErros((a) => ({ ...a, endereco: "" }));
                    }}
                    erro={erros.endereco}
                    placeholder="Rua, número e bairro"
                  />

                  <View style={styles.linha}>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Abre às"
                        valor={abertura}
                        aoMudar={(v) => setAbertura(mascaraHorario(v))}
                        erro={erros.abertura}
                        keyboardType="number-pad"
                        placeholder="08:00"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Fecha às"
                        valor={fechamento}
                        aoMudar={(v) => setFechamento(mascaraHorario(v))}
                        erro={erros.fechamento}
                        keyboardType="number-pad"
                        placeholder="20:00"
                      />
                    </View>
                  </View>
                  {!!cnpj && (
                    <Campo
                      rotulo="CNPJ (não pode ser alterado)"
                      valor={cnpj}
                      somenteLeitura
                    />
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.linkSenha}
              onPress={() => setTrocarSenha(!trocarSenha)}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={cores.primaria}
              />
              <Text style={styles.linkSenhaTexto}>
                {trocarSenha ? "Cancelar troca de senha" : "Alterar senha"}
              </Text>
            </TouchableOpacity>

            {trocarSenha && (
              <View style={styles.cartao}>
                <Campo
                  rotulo="Senha atual"
                  valor={senhaAtual}
                  aoMudar={setSenhaAtual}
                  erro={erros.senhaAtual}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Campo
                  rotulo="Nova senha"
                  valor={novaSenha}
                  aoMudar={setNovaSenha}
                  erro={erros.novaSenha}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
              onPress={salvar}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
