import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
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
import { buscarCep } from "../../../services/cep";
import { cores } from "../../../theme";
import { coordenadasDoEndereco } from "../../../utils/geocodificacao";
import {
  limparEspacos,
  mascaraCep,
  mascaraCnpj,
  mascaraHorario,
  mascaraTelefone,
  somenteDigitos,
  traduzirErro,
  validarBairro,
  validarCep,
  validarCidade,
  validarCnpj,
  validarComplemento,
  validarEmail,
  validarHorario,
  validarNome,
  validarNomeFantasia,
  validarNumeroEndereco,
  validarOrdemHorarios,
  validarRua,
  validarSenha,
  validarTelefone,
  validarUf,
} from "../../../utils/validacoes";
import { styles } from "./styles";

// inputRef (opcional): permite à tela mandar o cursor para este campo (ex.: depois da busca de CEP)
function Campo({ rotulo, estiloExterno, erro, inputRef, ...props }) {
  return (
    <View style={estiloExterno}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        ref={inputRef}
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

  // Dados do mercadinho (Comerciante)
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [horarioAbertura, setHorarioAbertura] = useState("");
  const [horarioFechamento, setHorarioFechamento] = useState("");

  const [erros, setErros] = useState({});
  const [avisoForm, setAvisoForm] = useState("");

  const { exibirAlerta } = useToast();

  // --- Busca de CEP -------------------------------------------------------
  // numeroRef / ruaRef: para levar o cursor ao campo certo depois de preencher.
  // contadorBusca: identifica a busca mais recente (ignora respostas "velhas").
  // ultimoCep: evita buscar duas vezes o mesmo CEP seguido.
  const numeroRef = useRef(null);
  const ruaRef = useRef(null);
  const contadorBusca = useRef(0);
  const ultimoCep = useRef("");

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

  // Chamada a cada letra digitada no CEP. Com 8 números completos, busca o endereço.
  function aoMudarCep(texto) {
    const mascarado = mascaraCep(texto);
    aoDigitar("cep", setCep, mascarado);

    const digitos = somenteDigitos(mascarado);
    if (digitos.length === 8) {
      buscarEnderecoPorCep(digitos);
    } else {
      // CEP incompleto: cancela qualquer busca em andamento (a resposta será ignorada)
      contadorBusca.current += 1;
      ultimoCep.current = "";
      setBuscandoCep(false);
    }
  }

  async function buscarEnderecoPorCep(digitos) {
    if (digitos === ultimoCep.current) return;
    ultimoCep.current = digitos;
    contadorBusca.current += 1;
    const minhaBusca = contadorBusca.current;
    setBuscandoCep(true);

    try {
      const e = await buscarCep(digitos);
      if (minhaBusca !== contadorBusca.current) return; // a pessoa já mudou o CEP

      // Preenche os campos (continuam editáveis) e limpa erros antigos deles
      setRua(e.rua);
      setBairro(e.bairro);
      setCidade(e.cidade);
      setUf(e.uf);
      setErros((atuais) => ({
        ...atuais,
        cep: "",
        rua: "",
        bairro: "",
        cidade: "",
        uf: "",
      }));

      if (e.rua) {
        exibirAlerta(
          "Endereço encontrado",
          `${e.rua}, ${e.bairro} - ${e.cidade}/${e.uf}. Agora informe o número.`,
          "sucesso",
        );
        numeroRef.current?.focus();
      } else {
        // CEP "geral" da cidade (cidades pequenas): não traz rua nem bairro
        exibirAlerta(
          "CEP encontrado",
          `Esse CEP é de ${e.cidade}/${e.uf} e não traz a rua. Preencha a rua e o bairro.`,
          "aviso",
        );
        ruaRef.current?.focus();
      }
    } catch (erro) {
      if (minhaBusca !== contadorBusca.current) return;
      ultimoCep.current = ""; // permite tentar de novo
      if (erro.codigo === "NAO_ENCONTRADO") {
        definirErro("cep", "CEP não encontrado.");
        exibirAlerta(
          "CEP não encontrado",
          "Confira os números ou preencha o endereço manualmente.",
          "aviso",
        );
      } else {
        exibirAlerta(
          "Sem conexão com o serviço de CEP",
          "Não foi possível buscar o endereço agora. Preencha manualmente.",
          "erro",
        );
      }
    } finally {
      if (minhaBusca === contadorBusca.current) setBuscandoCep(false);
    }
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
      resultado.cep = validarCep(cep);
      resultado.rua = validarRua(rua);
      resultado.numero = validarNumeroEndereco(numero);
      resultado.bairro = validarBairro(bairro);
      resultado.complemento = validarComplemento(complemento);
      resultado.cidade = validarCidade(cidade);
      resultado.uf = validarUf(uf);
      resultado.horarioAbertura = validarHorario(
        horarioAbertura,
        "horário de abertura",
      );
      resultado.horarioFechamento = validarHorario(
        horarioFechamento,
        "horário de fechamento",
      );

      if (!resultado.horarioAbertura && !resultado.horarioFechamento) {
        resultado.horarioFechamento = validarOrdemHorarios(
          horarioAbertura,
          horarioFechamento,
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
        "aviso",
      );
      return;
    }
    setAvisoForm("");

    setLoading(true);
    let usuarioCriado = false;

    try {
      // Descobre a localização no mapa a partir do endereço (o botão fica em "carregando")
      let coordenadas = null;
      if (perfil === "COMERCIANTE") {
        coordenadas = await coordenadasDoEndereco({
          rua: limparEspacos(rua),
          numero: limparEspacos(numero),
          bairro: limparEspacos(bairro),
          cidade: limparEspacos(cidade),
          uf,
        });
      }

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
          // Endereço em campos separados: o back valida e monta o texto completo
          cep: somenteDigitos(cep),
          rua: limparEspacos(rua),
          numero: limparEspacos(numero),
          bairro: limparEspacos(bairro),
          complemento: limparEspacos(complemento),
          cidade: limparEspacos(cidade),
          uf,
          // Se não achou o endereço no mapa, usa um ponto padrão de Salvador
          latitude: coordenadas ? coordenadas.lat : -12.9714,
          longitude: coordenadas ? coordenadas.lng : -38.5014,
          horarioAbertura: horarioAbertura + ":00",
          horarioFechamento: horarioFechamento + ":00",
          idComerciante: idComerciante,
        });
      }

      if (
        perfil === "COMERCIANTE" &&
        (!coordenadas || coordenadas.precisao !== "endereco")
      ) {
        // Cadastrou, mas a posição no mapa é aproximada
        exibirAlerta(
          "Conta criada com sucesso",
          "Não achamos o número exato no mapa, então a posição do mercadinho é aproximada. Faça login para continuar.",
          "sucesso",
        );
      } else {
        exibirAlerta(
          "Sucesso!",
          "Conta criada com sucesso. Faça login para continuar.",
        );
      }
      navigation.navigate("Login");
    } catch (error) {
      console.log("Erro no cadastro:", error);
      const erro = traduzirErro(error);

      if (usuarioCriado) {
        exibirAlerta(
          "Conta criada, mas o mercadinho não foi salvo",
          `${erro.mensagem}\n\nSua conta já existe. Avise a equipe para vincular o mercadinho.`,
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
                  name={
                    mostrarConfirmarSenha ? "eye-outline" : "eye-off-outline"
                  }
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
                  rotulo="CEP"
                  placeholder="40015-000"
                  keyboardType="numeric"
                  maxLength={9}
                  value={cep}
                  onChangeText={aoMudarCep}
                  onBlur={() => aoSair("cep", cep, validarCep)}
                  erro={erros.cep}
                />
                {buscandoCep ? (
                  <Text style={styles.textoDica}>Buscando endereço...</Text>
                ) : null}
                <Campo
                  inputRef={ruaRef}
                  rotulo="Rua / Avenida"
                  placeholder="Nome da rua"
                  maxLength={80}
                  value={rua}
                  onChangeText={(t) => aoDigitar("rua", setRua, t)}
                  onBlur={() => aoSair("rua", rua, validarRua)}
                  erro={erros.rua}
                />
                <View style={styles.linhaHorarios}>
                  <Campo
                    inputRef={numeroRef}
                    estiloExterno={{ flex: 1 }}
                    rotulo="Número"
                    placeholder="123 ou S/N"
                    maxLength={10}
                    value={numero}
                    onChangeText={(t) => aoDigitar("numero", setNumero, t)}
                    onBlur={() =>
                      aoSair("numero", numero, validarNumeroEndereco)
                    }
                    erro={erros.numero}
                  />
                  <Campo
                    estiloExterno={{ flex: 2 }}
                    rotulo="Bairro"
                    placeholder="Bairro"
                    maxLength={40}
                    value={bairro}
                    onChangeText={(t) => aoDigitar("bairro", setBairro, t)}
                    onBlur={() => aoSair("bairro", bairro, validarBairro)}
                    erro={erros.bairro}
                  />
                </View>
                <Campo
                  rotulo="Complemento (opcional)"
                  placeholder="Sala, loja, bloco, ponto de referência..."
                  maxLength={60}
                  value={complemento}
                  onChangeText={(t) =>
                    aoDigitar("complemento", setComplemento, t)
                  }
                  onBlur={() =>
                    aoSair("complemento", complemento, validarComplemento)
                  }
                  erro={erros.complemento}
                />
                <View style={styles.linhaHorarios}>
                  <Campo
                    estiloExterno={{ flex: 2 }}
                    rotulo="Cidade"
                    placeholder="Cidade"
                    maxLength={50}
                    value={cidade}
                    onChangeText={(t) => aoDigitar("cidade", setCidade, t)}
                    onBlur={() => aoSair("cidade", cidade, validarCidade)}
                    erro={erros.cidade}
                  />
                  <Campo
                    estiloExterno={{ flex: 1 }}
                    rotulo="UF"
                    placeholder="BA"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={2}
                    value={uf}
                    onChangeText={(t) =>
                      aoDigitar(
                        "uf",
                        setUf,
                        t.toUpperCase().replace(/[^A-Z]/g, ""),
                      )
                    }
                    onBlur={() => aoSair("uf", uf, validarUf)}
                    erro={erros.uf}
                  />
                </View>

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
                        mascaraHorario(t),
                      )
                    }
                    onBlur={() =>
                      aoSair("horarioAbertura", horarioAbertura, (v) =>
                        validarHorario(v, "horário de abertura"),
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
                        mascaraHorario(t),
                      )
                    }
                    onBlur={() =>
                      aoSair("horarioFechamento", horarioFechamento, (v) =>
                        validarHorario(v, "horário de fechamento"),
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