import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useCatalog(query, page) {
  const [state, setState] = useState({ plants: [], lastPage: 1, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ plants: [], lastPage: 1, loading: true, error: "" });
    const timer = setTimeout(() => {
      api.getCatalog(query, page, controller.signal)
        .then((data) => { if (!controller.signal.aborted) setState({ ...data, loading: false, error: "" }); })
        .catch((err) => { if (!controller.signal.aborted) setState({ plants: [], lastPage: 1, loading: false, error: err.message }); });
    }, query.trim() ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, page, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}

export function useCatalogPlant(id) {
  const [state, setState] = useState({ plant: null, loading: !!id, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ plant: null, loading: !!id, error: "" });
    if (id) api.getCatalogPlant(id, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setState({ plant: data.plant, loading: false, error: "" }); })
      .catch((err) => { if (!controller.signal.aborted) setState({ plant: null, loading: false, error: err.message }); });
    return () => controller.abort();
  }, [id, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
