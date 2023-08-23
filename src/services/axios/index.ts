import axios from "axios";
const BASE_URL = "https://api.dropboxapi.com/2";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_DROPBOX_TOKEN}`,
  },
});

export default api;
