import React, {ReactPortal, useEffect, useState} from 'react';
import './App.scss';
import {useTypedSelector} from './redux/store';
import {useRefreshMutation} from './services/auth.api';
import Login from "./views/login";
import Main from "./views/main";
import Registration from "./views/registration";
import {Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./components/protected-route";
import Loader from "./components/loader";
import PopupMessage from "./components/popup-message";
import EventController from "./socket/event-controller";
import {createPortal} from "react-dom";

new EventController();

const App: React.FC = () => {
    useTypedSelector(state => null);
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const [refresh, refreshStatus] = useRefreshMutation();

    useEffect(() => {
        (async () => {
            try {
                await refresh().unwrap();
            } catch (e: any) {
                setPortal(createPortal(
                    <PopupMessage title={"Error"} message={e.message} icon={"error"} close={() => setPortal(null)}/>,
                    document.body));
            }
        })();
    }, [])

    return (
        <Loader isLoading={refreshStatus.isLoading || refreshStatus.isUninitialized}>
            <Routes>
                <Route path={"/registration"} element={<Registration/>}/>
                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/*"} element={<ProtectedRoute outlet={<Main/>} redirect={"/login"}/>}/>

                <Route path={"*"} element={<Navigate to={"/"}/>}/>
            </Routes>

            {portal}
        </Loader>
    );
}

export default App;