import { useState } from "react";
import API, { getApiErrorMessage } from "../api/api";

function Login() {

  const [form, setForm] = useState({
    email:"",
    password:""
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    API.post("auth/login/", form)
      .then(res => {

        localStorage.setItem(
          "token",
          res.data.access
        );

        alert("Login successful");

      })
      .catch((err) => setError(getApiErrorMessage(err)));
  };

  return (
    <form onSubmit={handleSubmit}>

      <h1>Login</h1>

      {error && <p>{error}</p>}

      <input
        placeholder="Email"
        onChange={(e)=>setForm({...form,email:e.target.value})}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})}
      />

      <button>Login</button>

    </form>
  );
}

export default Login;