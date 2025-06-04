import useSWR from "swr";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const fetcher = (url, token) =>
  axios
    .get(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

export const usePendingReportsCount = (token) =>
  useSWR(
    token ? [`${BASE_URL}/api/reports/count`, token] : null,
    ([url, token]) => fetcher(url, token)
  );
