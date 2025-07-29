import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
const Login = () => {
  const [input, setInput] = useState({
    loginValue: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const loginHandler = async (e) => {
    console.log(input);
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({ ...input, [e.target.name]: e.target.value });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="flex items-center w-screen h-screen justify-center">
        <form
          className="w-full max-w-sm rounded-2xl bg-white shadow-lg flex flex-col gap-1 p-4"
          onSubmit={loginHandler}
          method="post"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-2xl">Flowfy</h1>
            <p className="text-center italic text-sm">Log in to Flowfy</p>
          </div>
          <div>
            <span className="font-medium">Email or Username</span>
            <Input
              text="text"
              name="loginValue"
              value={input.loginValue}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
              placeholder="Email or Username"
            />
          </div>
          <div>
            <span className="font-medium">Password</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
              placeholder="Password"
            />
          </div>
          {loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" className="mt-4 w-full">
              Log in
            </Button>
          )}
          <span className="text-center italic">
            Don't have an account? ?{" "}
            <Link to="/signup" className="text-blue-600">
              Sign Up
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
