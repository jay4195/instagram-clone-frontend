import { toast } from "react-toastify";
export const timeSince = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    let ret = interval + "year";
    if (interval > 1) {
      ret += "s";
    }
    return ret;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) { 
    let ret = interval + " month";
    if (interval > 1) {
      ret += "s";
    }
    return ret;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    let ret = interval + " day";
    if (interval > 1) {
      ret += "s";
    }
    return ret;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    let ret = interval + " hour";
    if (interval > 1) {
      ret += "s";
    }
    return ret;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    let ret = interval + " minute";
    if (interval > 1) {
      ret += "s";
    }
    return ret;
  }

  return Math.floor(seconds) + " seconds";
};

export const client = (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  
  if (token) {
    headers.token = `${token}`;
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  return fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, config).then(
    async (res) => {
      const data = await res.json();

      if (res.ok) {
        return data;
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
        toast.error("token expired!");
      } else {
        return Promise.reject(data);
      }
    }
  );
};

export const uploadImage = (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "instagram");

  return fetch(process.env.REACT_APP_CLOUDINARY_URL, {
    method: "POST",
    body: data,
  }).then((res) => res.json());
};
