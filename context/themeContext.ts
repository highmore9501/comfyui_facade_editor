import { Dispatch,SetStateAction,createContext } from "react";

type ThemeContextType = {
    darkTheme:boolean;
    setDarkTheme:Dispatch<SetStateAction<boolean>>;
}

const ThemeContext = createContext<ThemeContextType>({
    darkTheme:false,
    setDarkTheme:()=> null,
});

export default ThemeContext;