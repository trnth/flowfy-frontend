import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    gender: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const labelMap = {
    male: "Male",
    female: "Female",
    other: "Other",
  };
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const signUpHandler = async (e) => {
    console.log(input);
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          name: "",
          email: "",
          password: "",
          gender: null,
        });
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
          onSubmit={signUpHandler}
          method="post"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-2xl">Flowfy</h1>
            <p className="text-center italic text-sm">
              Sign Up to "flow" with your friends
            </p>
          </div>
          <div>
            <span className="font-medium">Username</span>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div>
            <span className="font-medium">Name</span>
            <Input
              type="text"
              name="name"
              value={input.name}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div>
            <span className="font-medium">Email</span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div className="flex justify-between ">
            <span className="font-medium">Gender</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {input.gender ? labelMap[input.gender] : "Select gender"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={input.gender ?? ""}
                  onValueChange={(val) =>
                    setInput({ ...input, gender: val || null })
                  }
                >
                  <DropdownMenuRadioItem value="male">
                    Male
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="female">
                    Female
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="other">
                    Other
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <span className="font-medium">Password</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          {loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" className="mt-4 w-full">
              Sign Up
            </Button>
          )}
          <span className="text-center italic">
            Already have an account ?{" "}
            <Link to="/login" className="text-blue-600">
              Log in
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
