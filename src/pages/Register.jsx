import { useState } from "react";
import API, { getApiErrorMessage } from "../api/api";

function Register() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    API.post("auth/register/", form)
      .then(() => alert("Account created"))
      .catch((err) => setError(getApiErrorMessage(err)));
  };

  return (
    <form onSubmit={handleSubmit}>

      <h1>Register</h1>

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

      <button>Create Account</button>

    </form>
  );
}

export default Register;