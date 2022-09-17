import { useEffect, useMemo, useMutation, useQuery } from "../../../deps.ts";
import { NotificationTopic } from "../../../types/notification.types.ts";
import {
  DELETE_FCM_TOKEN_MUTATION,
  FCM_TOKEN_QUERY,
  UPSERT_FCM_TOKEN_MUTATION,
} from "../../gql/fcm-token.ts";
import {
  NOTIFICATION_TOPIC_QUERY,
  UPSERT_NOTIFICATION_SUBSCRIPTION_MUTATION,
} from "../../gql/notifications.gql.ts";
import { useFcmTokenManager } from "../../mod.ts";

export function useNotificationTopics() {
  const [{ data: notificationTopicData, fetching }] = useQuery({ query: NOTIFICATION_TOPIC_QUERY });
  const notificationTopics: NotificationTopic[] = useMemo(
    () => notificationTopicData?.notificationTopicConnection?.nodes,
    [notificationTopicData],
  );

  const [_upsertResults, upsertNotificationSubscription] = useMutation(
    UPSERT_NOTIFICATION_SUBSCRIPTION_MUTATION,
  );
  const subscribeToNotificationTopic = async (topic: NotificationTopic) => {
    await upsertNotificationSubscription({
      subscriptions: [{
        notificationTopicId: topic.id,
        isSubscribed: true,
      }],
    }, { additionalTypenames: ["NotificationTopicConnection"] });
  };
  const unSubscribeFromNotificationTopic = async (topic: NotificationTopic) => {
    await upsertNotificationSubscription({
      subscriptions: [{
        notificationTopicId: topic.id,
        isSubscribed: false,
      }],
    }, { additionalTypenames: ["NotificationTopicConnection"] });
  };

  return {
    notificationTopics,
    fetching,
    subscribeToNotificationTopic,
    unSubscribeFromNotificationTopic,
  };
}

export function useFcmNotificationMediumConfig(token: string | undefined) {
  const [{ data: fcmTokenData, fetching }] = useQuery({
    query: FCM_TOKEN_QUERY,
    variables: { token },
    context: useMemo(() => ({
      additionalTypenames: ["NotificationMediumUserConfig"],
    }), []),
  });

  const isTokenRegistered = useMemo(() => Boolean(fcmTokenData?.notificationMediumUserConfig), [
    fcmTokenData,
  ]);

  const [_upsertResult, upsertFcmToken] = useMutation(UPSERT_FCM_TOKEN_MUTATION);
  const [_deleteResult, deleteFcmToken] = useMutation(DELETE_FCM_TOKEN_MUTATION);

  const registerToken = async () => {
    if (token) {
      console.log("registering fcmToken with mycelium");
      await upsertFcmToken({ token });
    }
  };

  const unregisterToken = async () => {
    if (token) {
      console.log("unregistering fcmToken with mycelium");
      await deleteFcmToken({ token });
    }
  };

  return { isTokenRegistered, registerToken, unregisterToken, fetching };
}

export function useDesktopNotificationSetting() {
  const { fcmToken, requestNotificationPermission, notificationPermission } = useFcmTokenManager();
  const { isTokenRegistered, registerToken, unregisterToken } = useFcmNotificationMediumConfig(
    fcmToken,
  );

  useEffect(() => {
    console.log("fcm token", fcmToken);
  }, [fcmToken]);

  const isDesktopNotificationsEnabled = isTokenRegistered && notificationPermission === "granted";
  const setDesktopNotificationPref = (enable: boolean) => {
    // enable desktop notifications
    if (enable) {
      // alert them if they haven't enabled browser notification perms
      if (notificationPermission === "default") {
        // TODO: make this a prettier dialog
        alert("Please allow notifications in your browser first.");
        return;
      } else if (notificationPermission === "denied") {
        // TODO: make this a prettier dialog
        alert(
          "It looks like you have explicitly denied notifications for this site. Please enable them in your browser settings.",
        );
        return;
      }

      registerToken();

      // disable desktop notifications
    } else {
      unregisterToken();
    }
  };

  // prompt the user to enable desktop notifications if they haven't done so
  useEffect(() => {
    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  }, [notificationPermission]);

  return { isDesktopNotificationsEnabled, setDesktopNotificationPref };
}