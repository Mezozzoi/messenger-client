import "./index.scss"
import React, {FC, HTMLAttributes, ReactNode} from "react";

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
    /** Defines whether loader is spread on the whole parent */
    isSpread?: boolean,
    /** Defines whether loader position is absolutely centered */
    absolute?: boolean,
    scale?: number,
    isLoading?: boolean,
    dark?: boolean,
    children?: ReactNode
}

/** Spinning loader. If `children` and `isLoading` provided renders children on `isLoading` is `false` */
const Loader: FC<LoaderProps> = ({isSpread = true, absolute = false, scale = 1, isLoading, dark, children , ...props}) => {
    const loaderElement = <div {...props} className={`loader-container ${isSpread ? "spread" : ""} ${absolute ? "absolute" : ""} ${dark ? "dark" : ""} ${props.className || ""}`}>
        <div style={{scale}} className={"loader"}>
        </div>
    </div>;

    if (children) {
        return isLoading ? loaderElement : <>{children}</>;
    } else
        return loaderElement;
}

export default Loader;