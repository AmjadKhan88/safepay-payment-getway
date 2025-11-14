import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/GlobalContext';
import { useCart } from '../context/CardContext';

function Navbar() {
    const [hidden,setHidden] = useState(true);
    const {cart} = useCart();
    const {logout} = useAuth();
  return (
    <>
    <nav className="h-[70px] relative w-full px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between z-20 bg-white text-gray-700 shadow-[0px_4px_25px_0px_#0000000D] transition-all">
        
    <Link to="/" className="text-indigo-600 text-xl font-bold">
        Testing
    </Link>

    <ul className="md:flex hidden items-center gap-10">
        <li><Link className="hover:text-gray-500/80 transition" to="/">Home</Link></li>
        <li><Link className="hover:text-gray-500/80 transition" to="/product">Products</Link></li>
        <li><Link className="hover:text-gray-500/80 transition" to="/admin">Admin</Link></li>
        <li><Link className="hover:text-gray-500/80 transition relative" to="/card">Card <span className='absolute border border-red-400 rounded-full h-5 w-5 ml-0.5 -top-1  text-center text-red-600 text-sm'>{cart.length}</span></Link></li>
    </ul>

    <button onClick={logout} type="button" className="bg-white text-red-600 border border-red-600 md:inline hidden text-sm hover:bg-gray-50 active:scale-95 transition-all w-40 h-11 rounded-full">
        Logout
    </button>

    <button aria-label="menu-btn" type="button" onClick={()=>setHidden(prev => !prev)} className="menu-btn inline-block md:hidden active:scale-90 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="#000">
            <path d="M 3 7 A 1.0001 1.0001 0 1 0 3 9 L 27 9 A 1.0001 1.0001 0 1 0 27 7 L 3 7 z M 3 14 A 1.0001 1.0001 0 1 0 3 16 L 27 16 A 1.0001 1.0001 0 1 0 27 14 L 3 14 z M 3 21 A 1.0001 1.0001 0 1 0 3 23 L 27 23 A 1.0001 1.0001 0 1 0 27 21 L 3 21 z"></path>
        </svg>
    </button>

    <div className={`mobile-menu absolute top-[70px] left-0 w-full bg-white p-6 ${hidden? "hidden":""} md:hidden`}>
        <ul className="flex flex-col space-y-4 text-lg">
            <li><Link to="/" className="text-sm">Home</Link></li>
            <li><Link to="/products" className="text-sm">Products</Link></li>
            <li><a href="#" className="text-sm">Portfolio</a></li>
            <li><a href="#" className="text-sm">Pricing</a></li>
        </ul>

        <button onClick={logout} type="button" className="bg-white text-red-600 border border-red-600 mt-6 text-sm hover:bg-gray-50 active:scale-95 transition-all w-40 h-11 rounded-full">
            Logout
        </button>
    </div>
</nav>


</>
  )
}

export default Navbar
