//https://proxy.poyashi.me/bpim/api/v1/users/getRecommend
import { config } from "@/config";

export const _apiFetch = async (endpoint: string, _params: { [key: string]: any }) => {
  const params = new URLSearchParams();
  Object.keys(_params).map((item: string) => {
    params.append(item, _params[item]);
    return 0;
  })
  const t = await fetch(config.apiUrl + endpoint + "?" + params);
  const p = await t.json();
  return p;
}
