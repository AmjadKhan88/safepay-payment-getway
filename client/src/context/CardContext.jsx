import { useContext, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./GlobalContext";



const cardContext = createContext();



export const CardContext = ({children})=> {
    const {axios} = useAuth();
    const [cart,setCart] = useState([]);

    // add to cart
    const addToCart = async (product)=> {
        setCart((prev)=> {
            const exsisting = prev.find((item)=> item.id === product.id);
            if(exsisting){
                return prev.map((item)=> item.id === product.id ? {...item,qty:item.qty+1}: item)
            }
            return [...prev,{...product,qty:1}]
        })
    }

    // remove from cart
    const removeFromCart = (id)=> {
        setCart((prev)=> prev.filter((item)=> item.id !== id))
    }

    // update qty of product in cart
    const updateQty = (id,sate)=> {
        if(sate === "+"){
            setCart((prev)=> prev.map((item)=> item.id === id ? {...item,qty:item.qty+1}:item))
        }else{
            setCart((prev)=> prev.map((item)=> item.id === id ? {...item,qty:item.qty-1}:item))
        }
    }

    // place order 
    const placeOrder = async (order)=>{
        try {
            const {data} = await axios.post('')
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const value = {
        cart,
        setCart,
        addToCart,
        updateQty,
        removeFromCart
    }

    return (
        <cardContext.Provider value={value}>
            {children}
        </cardContext.Provider>
    )
}


export const useCart = ()=> useContext(cardContext);