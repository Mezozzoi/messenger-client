import {createContext} from "react";
import {ContextMenuProps} from "../components/context-menu";

export type ContextMenuContextType = {
    value: ContextMenuProps | null,
    setValue: (value: ContextMenuProps | null) => void
}

export const ContextMenuContext = createContext<ContextMenuContextType>({
    value: null, setValue: () => {
    }
});