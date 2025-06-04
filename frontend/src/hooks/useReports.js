import useSWR from "swr";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const fetcher = (url, token) =>
  axios
    .get(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

export const useReports = (token) => {
  const swrResponse = useSWR(
    token ? [`${BASE_URL}/api/reports`, token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/api/reports/${reportId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      swrResponse.mutate(); // обновить список
    } catch (error) {
      console.error("Ошибка при обновлении статуса жалобы:", error);
      throw error;
    }
  };

  return {
    ...swrResponse,
    updateReportStatus,
  };
};
