import {FC, ReactElement} from "react";
import {useTypedSelector} from "../../redux/store";
import {Navigate} from "react-router-dom";
import {getUser} from "../../redux/reducers/authSlice";

export type ProtectedRouteProps = {
    outlet: ReactElement,
    redirect: string
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({outlet, redirect}) => {
    const user = useTypedSelector(getUser);

    if (user) return outlet;
    else return <Navigate to={redirect} />
}

export default ProtectedRoute;