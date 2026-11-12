import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registrarParaNotificacoesPushAsync() {
  if (!Device.isDevice && Platform.OS !== 'web') {
    console.log('Notificações push requerem um dispositivo físico.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão para notificações não concedida.');
    return null;
  }

  try {
    // 1. FLUXO PARA WEB (usa VAPID diretamente, sem passar pelo servidor exp.host)
    if (Platform.OS === 'web') {
      const vapidPublicKey =
        Constants?.expoConfig?.notification?.vapidPublicKey ??
        "BICaUlJOdIdjQa_tlTYHZn3RVA1KJ_50Mhegdr9WHuCfPwZp2uFwHwK43cXRbpn2hHt1S4NRZujVSD1rW17-u2o";

      const deviceToken = await Notifications.getDevicePushTokenAsync({
        vapidPublicKey,
      });

      // Retorna o objeto { endpoint, keys: { p256dh, auth } } em string JSON para salvar no backend
      const webPushSubscription = JSON.stringify(deviceToken.data);
      console.log("Subscrição Web Push gerada com sucesso:", webPushSubscription);
      return webPushSubscription;
    }

    // 2. FLUXO PARA ANDROID / IOS (usa Expo Push Token)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      "9a794b1e-7e12-421b-853f-bdf123456789";

    const expoToken = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log("Expo Push Token gerado com sucesso:", expoToken);
    return expoToken;
  } catch (error) {
    console.error("Erro ao gerar o token:", error);
    return null;
  }
}