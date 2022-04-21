import fbActions from "./actions";
import { getToken, getMessaging } from "firebase/messaging";
import fb from "@/components/firebase";
export const pubkey =
  "BHwX2FHmMWpVIWwnELeC0Go_TDXQO4TlCr-gUsW38gqXME0LLUp3runutAAU5lxIUGQYEXgo090CVuCK-7kajms";

export class messanger {
  checkPermission() {
    return Notification.permission === "granted";
  }

  getToken() {
    return getToken(getMessaging(fb));
  }

  refreshToken(refreshedToken?: string) {
    try {
      new fbActions().auth().onAuthStateChanged(async (user: any) => {
        console.info("Login Status:", user);
        if (user && user.uid) {
          const token = refreshedToken || (await this.getToken());
          new fbActions().updateToken(user.uid, token);
        } else {
          console.error("NOT LOGGED IN, REFRESH TOKEN HAS BEEN ABORTED");
        }
      });
    } catch (e: any) {
      alert(e);
    }
  }

  async requestPermission() {
    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          return true;
        }
        Notification.requestPermission((permission) => {
          if (permission === "granted") {
            return true;
          } else {
            return false;
          }
        });
      } else {
        alert("非対応ブラウザです。");
        return false;
      }
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }
}
