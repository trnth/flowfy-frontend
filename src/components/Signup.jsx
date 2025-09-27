import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
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
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
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
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
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
        success('toast.success.signup');
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
      error('toast.error.signup');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center w-screen h-screen justify-center">
        <form
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 theme-shadow-lg flex flex-col gap-1 p-4 border-slate-200 dark:border-slate-700 border"
          onSubmit={signUpHandler}
          method="post"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-2xl text-slate-900 dark:text-slate-100">Flowfy</h1>
            <p className="text-center italic text-sm text-slate-600 dark:text-slate-300">
              {t('auth.signupToFlow')}
            </p>
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.username')}</span>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.name')}</span>
            <Input
              type="text"
              name="name"
              value={input.name}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.email')}</span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>
          <div className="flex justify-between ">
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.gender')}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {input.gender ? labelMap[input.gender] : t('auth.selectGender')}
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
                    {t('auth.male')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="female">
                    {t('auth.female')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="other">
                    {t('auth.other')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.password')}</span>
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
              {t('auth.signup')}
            </Button>
          )}
          <span className="text-center italic text-slate-600 dark:text-slate-300">
            {t('auth.alreadyHaveAccount')} ?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-600-hover">
              {t('auth.login')}
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
