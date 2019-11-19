import axios from "axios";
import connectionUrl from "./connectionUrl";

const api = axios.create({
  baseURL: `${connectionUrl}`
});

export default api;
