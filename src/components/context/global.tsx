import { useState } from "react";
import { createContainer } from "unstated-next";

const Cont = () => {
  const [lang, setLang] = useState("ja");

  const set = (newLang:string) => {
    setLang(newLang)
  };

  return { lang,set };
};

export const GlobalContainer = createContainer(Cont);
