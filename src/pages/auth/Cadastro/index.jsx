import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/api";
import { cores } from "../../../theme";
import {
  limparEspacos,
  mascaraCnpj,
  mascaraHorario,
  mascaraTelefone,
  somenteDigitos,
  traduzirErro,
  validarCnpj,
  validarEmail,
  validarEndereco,
  validarHorario,
  validarNome,
  validarNomeFantasia,
  validarOrdemHorarios,
  validarSenha,
  validarTelefone,
} from "../../../utils/validacoes";
import { styles } from "./styles";

function Campo({ rotulo, estiloExterno, erro, ...props }) {
  return (
    <View style={estiloExterno}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.campo, erro ? styles.campoErro : null]}
        placeholderTextColor={cores.icone}
        {...props}
      />
      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
  );
}

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState("CLIENTE");
  const [loading, setLoading] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [horarioAbertura, setHorarioAbertura] = useState("");
  const [horarioFechamento, setHorarioFechamento] = useState("");

  const [erros, setErros] = useState({});
  const [avisoForm, setAvisoForm] = useState("");

  const { exibirAlerta } = useToast();

  function definirErro(campo, mensagem) {
    setErros((atuais) => ({ ...atuais, [campo]: mensagem }));
  }

  function aoDigitar(campo, definirValor, valor) {
    definirValor(valor);
    if (erros[campo]) definirErro(campo, "");
    if (avisoForm) setAvisoForm("");
  }

  function aoSair(campo, valor, validar) {
    if (valor) definirErro(campo, validar(valor));
  }

  function validarFormulario() {
    const resultado = {
      nome: validarNome(nome),
      email: validarEmail(email),
      telefone: validarTelefone(telefone),
      senha: validarSenha(senha),
    };

    if (senha !== confirmarSenha) {
      resultado.confirmarSenha = "As senhas não coincidem.";
    }

    if (perfil === "COMERCIANTE") {
      resultado.nomeFantasia = validarNomeFantasia(nomeFantasia);
      resultado.cnpj = validarCnpj(cnpj);
      resultado.endereco = validarEndereco(endereco);
      resultado.horarioAbertura = validarHorario(
        horarioAbertura,
        "horário de abertura"
      );
      resultado.horarioFechamento = validarHorario(
        horarioFechamento,
        "horário de fechamento"
      );

      if (!resultado.horarioAbertura && !resultado.horarioFechamento) {
        resultado.horarioFechamento = validarOrdemHorarios(
          horarioAbertura,
          horarioFechamento
        );
      }
    }

    Object.keys(resultado).forEach((campo) => {
      if (!resultado[campo]) delete resultado[campo];
    });
    return resultado;
  }

  async function handleCadastro() {
    const errosEncontrados = validarFormulario();
    setErros(errosEncontrados);

    if (Object.keys(errosEncontrados).length > 0) {
      exibirAlerta(
        "Confira os dados",
        "Corrija os campos destacados em vermelho.",
        "aviso"
      );
      return;
    }
    setAvisoForm("");

    setLoading(true);
    let usuarioCriado = false;

    try {
      const userResponse = await api.post("/api/auth/register", {
        nome: limparEspacos(nome),
        email: email.trim().toLowerCase(),
        senha,
        confirmarSenha,
        telefone: somenteDigitos(telefone),
        perfil,
      });
      usuarioCriado = true;

      if (perfil === "COMERCIANTE") {
        const idComerciante = userResponse.data.id;

        await api.post("/api/mercadinhos", {
          nomeFantasia: limparEspacos(nomeFantasia),
          cnpj: somenteDigitos(cnpj),
          endereco: limparEspacos(endereco),
          latitude: -12.9714,
          longitude: -38.5014,
          horarioAbertura: horarioAbertura + ":00",
          horarioFechamento: horarioFechamento + ":00",
          idComerciante: idComerciante,
        });
      }

      exibirAlerta(
        "Sucesso!",
        "Conta criada com sucesso. Faça login para continuar."
      );
      navigation.navigate("Login");
    } catch (error) {
      console.log("Erro no cadastro:", error);
      const erro = traduzirErro(error);

      if (usuarioCriado) {
        exibirAlerta(
          "Conta criada, mas o mercadinho não foi salvo",
          `${erro.mensagem}\n\nSua conta já existe. Avise a equipe para vincular o mercadinho.`
        );
      } else if (error.response && error.response.status === 409) {
        definirErro("email", erro.mensagem);
        exibirAlerta(erro.titulo, erro.mensagem);
      } else if (Object.keys(erro.campos).length > 0) {
        setErros(erro.campos);
        exibirAlerta("Confira os dados", erro.mensagem, "aviso");
      } else {
        exibirAlerta(erro.titulo, erro.mensagem);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/images/fundo-abertura.jpg")}
        style={styles.fotoFundo}
        resizeMode="cover"
      />
      <View style={styles.camadaLaranja} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../../../assets/images/logo-na-esquina.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Na Esquina"
          />

          <View style={styles.cartao}>
            <View style={styles.seletor}>
              <TouchableOpacity
                style={[
                  styles.opcao,
                  perfil === "CLIENTE" && styles.opcaoAtiva,
                ]}
                onPress={() => setPerfil("CLIENTE")}
                accessibilityRole="button"
                accessibilityState={{ selected: perfil === "CLIENTE" }}
              >
                <Text
                  style={[
                    styles.opcaoTexto,
                    perfil === "CLIENTE" && styles.opcaoTextoAtivo,
                  ]}
                >
                  Cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.opcao,
                  perfil === "COMERCIANTE" && styles.opcaoAtiva,
                ]}
                onPress={() => setPerfil("COMERCIANTE")}
                accessibilityRole="button"
                accessibilityState={{ selected: perfil === "COMERCIANTE" }}
              >
                <Text
                  style={[
                    styles.opcaoTexto,
                    perfil === "COMERCIANTE" && styles.opcaoTextoAtivo,
                  ]}
                >
                  Dono do comércio
                </Text>
              </TouchableOpacity>
            </View>

            <Campo
              rotulo="Nome completo"
              placeholder="Digite seu nome"
              maxLength={100}
              value={nome}
              onChangeText={(t) => aoDigitar("nome", setNome, t)}
              onBlur={() => aoSair("nome", nome, validarNome)}
              erro={erros.nome}
            />
            <Campo
              rotulo="Email"
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={150}
              value={email}
              onChangeText={(t) => aoDigitar("email", setEmail, t)}
              onBlur={() => aoSair("email", email, validarEmail)}
              erro={erros.email}
            />
            <Campo
              rotulo="Telefone / WhatsApp"
              placeholder="(71) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
              value={telefone}
              onChangeText={(t) =>
                aoDigitar("telefone", setTelefone, mascaraTelefone(t))
              }
              onBlur={() => aoSair("telefone", telefone, validarTelefone)}
              erro={erros.telefone}
            />

            <Text style={styles.rotulo}>Senha</Text>
            <View
              style={[styles.campoSenha, erros.senha ? styles.campoErro : null]}
            >
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                maxLength={72}
                value={senha}
                onChangeText={(t) => aoDigitar("senha", setSenha, t)}
                onBlur={() => aoSair("senha", senha, validarSenha)}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Ionicons
                  name={mostrarSenha ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>
            {erros.senha ? (
              <Text style={styles.textoErro}>{erros.senha}</Text>
            ) : (
              <Text style={styles.textoDica}>
                Mínimo de 8 caracteres, com letras e números.
              </Text>
            )}

            <Text style={styles.rotulo}>Confirmar Senha</Text>
            <View
              style={[
                styles.campoSenha,
                erros.confirmarSenha ? styles.campoErro : null,
              ]}
            >
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Confirme sua senha"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
                maxLength={72}
                value={confirmarSenha}
                onChangeText={(t) =>
                  aoDigitar("confirmarSenha", setConfirmarSenha, t)
                }
                onBlur={() => {
                  if (confirmarSenha && confirmarSenha !== senha) {
                    definirErro("confirmarSenha", "As senhas não coincidem.");
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Ionicons
                  name={mostrarConfirmarSenha ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>
            {erros.confirmarSenha ? (
              <Text style={styles.textoErro}>{erros.confirmarSenha}</Text>
            ) : null}

            {perfil === "COMERCIANTE" && (
              <View>
                <Text style={styles.subtitulo}>Dados do mercadinho</Text>
                <Campo
                  rotulo="Nome fantasia"
                  placeholder="Nome do mercadinho"
                  maxLength={100}
                  value={nomeFantasia}
                  onChangeText={(t) =>
                    aoDigitar("nomeFantasia", setNomeFantasia, t)
                  }
                  onBlur={() =>
                    aoSair("nomeFantasia", nomeFantasia, validarNomeFantasia)
                  }
                  erro={erros.nomeFantasia}
                />
                <Campo
                  rotulo="CNPJ"
                  placeholder="00.000.000/0000-00"
                  keyboardType="numeric"
                  maxLength={18}
                  value={cnpj}
                  onChangeText={(t) =>
                    aoDigitar("cnpj", setCnpj, mascaraCnpj(t))
                  }
                  onBlur={() => aoSair("cnpj", cnpj, validarCnpj)}
                  erro={erros.cnpj}
                />
                <Campo
                  rotulo="Endereço completo"
                  placeholder="Rua, número, bairro"
                  maxLength={200}
                  value={endereco}
                  onChangeText={(t) => aoDigitar("endereco", setEndereco, t)}
                  onBlur={() => aoSair("endereco", endereco, validarEndereco)}
                  erro={erros.endereco}
                />
                <View style={styles.linhaHorarios}>
                  <Campo
                    estiloExterno={{ flex: 1 }}
                    rotulo="Abre às"
                    placeholder="08:00"
                    keyboardType="numeric"
                    maxLength={5}
                    value={horarioAbertura}
                    onChangeText={(t) =>
                      aoDigitar(
                        "horarioAbertura",
                        setHorarioAbertura,
                        mascaraHorario(t)
                      )
                    }
                    onBlur={() =>
                      aoSair("horarioAbertura", horarioAbertura, (v) =>
                        validarHorario(v, "horário de abertura")
                      )
                    }
                    erro={erros.horarioAbertura}
                  />
                  <Campo
                    estiloExterno={{ flex: 1 }}
                    rotulo="Fecha às"
                    placeholder="20:00"
                    keyboardType="numeric"
                    maxLength={5}
                    value={horarioFechamento}
                    onChangeText={(t) =>
                      aoDigitar(
                        "horarioFechamento",
                        setHorarioFechamento,
                        mascaraHorario(t)
                      )
                    }
                    onBlur={() =>
                      aoSair("horarioFechamento", horarioFechamento, (v) =>
                        validarHorario(v, "horário de fechamento")
                      )
                    }
                    erro={erros.horarioFechamento}
                  />
                </View>
              </View>
            )}

            {avisoForm ? (
              <Text style={styles.avisoFormulario}>{avisoForm}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.botao}
              onPress={handleCadastro}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.rodape}>
              <Text style={styles.textoRodape}>Já possui uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.linkVermelho}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}