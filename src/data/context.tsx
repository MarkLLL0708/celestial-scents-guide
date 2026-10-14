import { createContext, useContext, useState, type ReactNode } from "react";
import * as api from "./api";
import type { BirthProfile, Prefs, ChartResult, CartItem } from "./types";
const initialProfile: BirthProfile = {
  name: "",
  day: 0,
  month: 0,
  year: 0,
  hour: 12,
  minute: 0,
  city: "",
  country: "",
};
const initialPrefs: Prefs = { avoid: [], style: "any", budget: "any" };
interface Store {
  profile: BirthProfile;
  setProfile: (p: BirthProfile) => void;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  result: ChartResult | null;
  setResult: (r: ChartResult) => void;
  user: boolean;
  setUser: (v: boolean) => void;
  cartItems: CartItem[];
  setCartItems: (v: CartItem[]) => void;
  add: (id: string) => Promise<void>;
  notify: (text: string, kind?: "info" | "error") => void;
  notice: { text: string; kind: "info" | "error" } | null;
  dismiss: () => void;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(initialProfile);
  const [prefs, setPrefs] = useState(initialPrefs);
  const [result, setResult] = useState<ChartResult | null>(null);
  const [user, setUser] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState<Store["notice"]>(null);
  const add = async (id: string) => setCartItems(await api.addToCart(id));
  return (
    <Context.Provider
      value={{
        profile,
        setProfile,
        prefs,
        setPrefs,
        result,
        setResult,
        user,
        setUser,
        cartItems,
        setCartItems,
        add,
        notify: (text, kind = "info") => setNotice({ text, kind }),
        notice,
        dismiss: () => setNotice(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("StoreProvider missing");
  return context;
}
