import  { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const { register, handleSubmit } = useForm();

  const handleRegister = async (data) => {
    data.phone = `+91${data.phone}`;
    await axios
      .post("http://localhost:4000/api/v1/user/register", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        toast.success(res.data.message);
        navigateTo(`/otp-verification/${data.email}/${data.phone}`);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
   if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div>
        <form
          className="auth-form"
          onSubmit={handleSubmit((data) => handleRegister(data))}
        >
          <h2>Register</h2>
          <input type="text" placeholder="Name" required {...register("name")}/>
        <div>
          <span>+91</span>
          <input type="number" placeholder="Phone number" required {...register("phone")}/>

        </div>
          <input type="email" placeholder="Email" required {...register("email")}/>
          <input type="password" placeholder="Password" required {...register("password")}/>
          <div className="verification-method">
            <p>select Verification</p>
            <div className="wrapper">

            <label >
              <input type="radio" name="verificationMethod" value={"email"} {...register("verificationMethod")} required/>
              email
            </label>
            <label >
              <input type="radio" name="verificationMethod" value={"phone"} {...register("verificationMethod")} required/>
              phone
            </label>
            </div>
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
};

export default Register;
