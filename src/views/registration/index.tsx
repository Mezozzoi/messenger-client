import React, {ChangeEventHandler, FC, FormEventHandler, ReactPortal, useState} from "react";
import {BsPersonFillAdd} from "react-icons/bs";
import Input from "../../components/input";
import Button from "../../components/button";
import {Link, Navigate} from "react-router-dom";
import {useRegisterMutation} from "../../services/auth.api";
import {useTypedSelector} from "../../redux/store";
import "./index.scss";
import {getUser} from "../../redux/reducers/authSlice";
import PopupMessage from "../../components/popup-message";
import {createPortal} from "react-dom";

type RegisterState = {
    email: string,
    password: string,
    repeatPassword: string,
    firstname: string,
    lastname: string
}

const Registration: FC = () => {
    const user = useTypedSelector(getUser);
    const [register, registerStatus] = useRegisterMutation();
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const [state, setState] = useState<RegisterState>({
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        repeatPassword: ""
    });

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (state.password !== state.repeatPassword)
            setPortal(createPortal(
                <PopupMessage title={"Registration error"} message={"Password did not match"} icon={"error"}
                              close={() => setPortal(null)}/>,
                document.body));
        else {
            try {
                !registerStatus.isLoading && await register({
                    email: state.email,
                    password: state.password,
                    firstname: state.firstname,
                    lastname: state.lastname
                }).unwrap();
            } catch (e) {
                setPortal(createPortal(
                    <PopupMessage title={"Registration error"}
                                  message={"Invalid input data or account with such email already exists"}
                                  icon={"error"} close={() => setPortal(null)}/>,
                    document.body));
            }
        }
    }

    const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({...state, email: e.target.value});
    }

    const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({...state, password: e.target.value});
    }

    const handlePasswordRepeatChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({...state, repeatPassword: e.target.value});
    }

    const handleFirstnameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({...state, firstname: e.target.value});
    }

    const handleLastnameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({...state, lastname: e.target.value});
    }

    if (user) return <Navigate to={"/"}/>;

    return (
        <div className={"registration-container"}>
            <form id={"registration-form"} onSubmit={handleSubmit} autoComplete={"on"}>
                <header className={"registration-form__header"}><BsPersonFillAdd size={30}/>Registration</header>

                <Input id={"registration"} type={"email"} required={true} autoComplete={"email"} autoSave={"on"}
                       placeholder={"Email"} onChange={handleEmailChange}/>
                <Input id={"password"} type={"password"} required={true} autoComplete={"current-password"}
                       autoSave={"on"} placeholder={"Password"} onChange={handlePasswordChange}/>
                <Input id={"password-repeat"} type={"password"} required={true} autoComplete={"current-password"}
                       autoSave={"on"} placeholder={"Repeat password"} onChange={handlePasswordRepeatChange}/>
                <Input id={"firstname"} placeholder={"Firstname"} required={true} onChange={handleFirstnameChange}/>
                <Input id={"lastname"} placeholder={"Lastname"} required={true} onChange={handleLastnameChange}/>

                <Button id={"submit"} className={"primary"} title={"Register"}/>
            </form>

            <div className={"registration-container__login"}>
                <span>Already have an account?</span>
                <Link to={"/register"}><Button title={"Go to login"} styleColor={"secondary"}/></Link>
            </div>

            {portal}
        </div>
    );
}

export default Registration;