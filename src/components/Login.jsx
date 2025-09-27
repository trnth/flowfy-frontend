import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setVerified } from "@/redux/authSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
const Login = () => {
  const [input, setInput] = useState({
    loginValue: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setVerified(res.data.user));
        navigate("/");
        success('toast.success.login');
        setInput({ loginValue: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      error('toast.error.login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center w-screen h-screen justify-center">
        <form
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 theme-shadow-lg flex flex-col gap-1 p-4 border-slate-200 dark:border-slate-700 border"
          onSubmit={loginHandler}
          method="post"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-2xl text-slate-900 dark:text-slate-100">Flowfy</h1>
            <p className="text-center italic text-sm text-slate-600 dark:text-slate-300">{t('auth.loginToFlowfy')}</p>
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.emailOrUsername')}</span>
            <Input
              text="text"
              name="loginValue"
              value={input.loginValue}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
              placeholder={t('auth.emailOrUsername')}
            />
          </div>
          <div>
            <span className="font-medium text-slate-900 dark:text-slate-100">{t('auth.password')}</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
              placeholder={t('auth.password')}
            />
          </div>
          {loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" className="mt-4 w-full">
              {t('auth.login')}
            </Button>
          )}
          <span className="text-center italic text-slate-600 dark:text-slate-300">
            {t('auth.dontHaveAccount')} ?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-600-hover">
              {t('auth.signup')}
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
