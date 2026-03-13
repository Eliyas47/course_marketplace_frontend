import axios from "axios";

const API = axios.create({
  baseURL: "https://online-course-marketplace-backend-dc66.onrender.com/api/",
});

export default API;