import React, {ChangeEventHandler, FormEventHandler, ReactPortal, useState} from "react";
import {useLoginMutation} from "../../services/auth.api";
import {useTypedSelector} from "../../redux/store";
import Button from "../../components/button";
import "./index.scss";
import Input from "../../components/input";
import {BsPersonFillLock} from "react-icons/bs";
import {Link, Navigate} from "react-router-dom";
import {getUser} from "../../redux/reducers/authSlice";
import {createPortal} from "react-dom";
import PopupMessage from "../../components/popup-message";

const Login: React.FC = () => {
    const user = useTypedSelector(getUser);
    const [login, loginStatus] = useLoginMutation();
    const [loginValue, setLogin] = useState<string>("");
    const [passwordValue, setPassword] = useState<string>("");
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    const handleLoginChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setLogin(e.target.value);
    }

    const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setPassword(e.target.value);
    }

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        try {
            await login({login: loginValue, password: passwordValue}).unwrap();
        } catch (e) {
            setPortal(createPortal(
                <PopupMessage title={"Login error"} message={"Invalid login or password"} icon={"error"}
                              close={() => setPortal(null)}/>,
                document.body
            ));
        }
    }

    if (user) return <Navigate to={"/"}/>;

    return (
        <div className={"login-container"}>
            <form id={"login-form"} onSubmit={handleSubmit} autoComplete={"on"}>
                <header className={"login-form__header"}><BsPersonFillLock size={30}/> Login</header>
                <Input id={"login"} type={"text"} autoComplete={"email"} autoSave={"on"} placeholder={"Email"}
                       onChange={handleLoginChange}/>
                <Input id={"password"} type={"password"} autoComplete={"current-password"} autoSave={"on"}
                       placeholder={"Password"} onChange={handlePasswordChange}/>
                <Button id={"submit"} className={"primary"} title={"Login"}/>
            </form>

            <div className={"login-container__register"}>
                <span>Don't have an account yet?</span>
                <Link to={"/registration"}><Button title={"Go to registration"} styleColor={"secondary"}/></Link>
            </div>

            {portal}
        </div>
    );
}

export default Login;