import { Dimensions, Platform, StyleSheet } from "react-native";
import { cores } from "../../../theme";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Platform.OS === "web" ? "100vw" : width,
    height: Platform.OS === "web" ? "100vh" : height,
    overflow: "hidden",
  },
  imagemFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Platform.OS === "web" ? "100vw" : width,
    height: Platform.OS === "web" ? "100vh" : height,
  },
  containerSplash: {
    flex: 1,
    width: Platform.OS === "web" ? "100vw" : width,
    height: Platform.OS === "web" ? "100vh" : height,
    justifyContent: "center",
    alignItems: "center",
  },
  areaConteudoSplash: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoSplash: {
    width: width * 0.55,
    height: 200,
    marginBottom: 20,
  },
  areaTexto: {
    alignItems: "center",
    marginTop: 10,
  },
  textoSlogan: {
    color: "#D03010",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  textoDestaque: {
    color: "#D03010",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 4,
  },
  camadaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  containerFinal: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaLogoFinal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  logoFinal: {
    width: width * 0.5,
    height: 160,
  },
  cartao: {
    backgroundColor: cores.fundoCartaoLogin || "#FFFFFF",
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    borderRadius: 32,
    marginBottom: Platform.OS === "web" ? 40 : 0,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  botaoPrincipal: {
    backgroundColor: cores.primaria || "#E52421",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  textoBotaoPrincipal: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  botaoSecundario: {
    backgroundColor: cores.fundoBotaoSecundario || "#FFFFFF",
    borderWidth: 1.5,
    borderColor: cores.primaria || "#E52421",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  textoBotaoSecundario: {
    color: cores.primaria || "#E52421",
    fontSize: 15,
    fontWeight: "600",
  },
  areaAcessarCom: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  linhaDivisora: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  textoAcessarCom: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#888888",
  },
  areaSociais: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  botaoSocial: {
    padding: 8,
  },
  iconeSocial: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
