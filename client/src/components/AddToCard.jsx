import React, { useState } from "react";
import { useCart } from "../context/CardContext";
import toast from "react-hot-toast";
import { useAuth } from "../context/GlobalContext";

function AddToCard() {
  const {axios} = useAuth();
  const [country, setCountry] = useState({
    name: "Pakistan",
    shipping: 0,
    tax: 20,
  });
  const [address,setAddress] = useState("");
  const [loader,setLoader] = useState(false);

  const { cart, updateQty, removeFromCart } = useCart();

  const countries = [
    { name: "Pakistan", shipping: 0, tax: 20 },
    { name: "India", shipping: 50, tax: 30 },
    { name: "United States", shipping: 100, tax: 50 },
    { name: "United Kingdom", shipping: 100, tax: 50 },
    { name: "Canada", shipping: 120, tax: 50 },
    { name: "Germany", shipping: 200, tax: 50 },
    { name: "France", shipping: 130, tax: 50 },
    { name: "Japan", shipping: 150, tax: 50 },
    { name: "China", shipping: 70, tax: 30 },
  ];

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.offerPrice * item.qty,
    0
  );

  const totalAmount = grandTotal + country.shipping + country.tax;

const checkOut = async () => {
  setLoader(true);

  try {
    const orderData = {
      cart: cart.map(item => ({
        id: item.id,
        qty: item.qty
      })),
      country: country.name, // handle both string/object
      address,
      price: totalAmount
    };

    // Send to backend
    const { data } = await axios.post(
      "/api/orders/create",
      orderData,
      { withCredentials: true }
    );

    // Redirect user to Safepay checkout
    if (data.checkoutURL) {
      window.location.href = data.checkoutURL;
    } else {
      toast.error("No redirect URL returned from server");
    }

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
    console.error(error);
  } finally {
    setLoader(false);
  }
};


  return (
    <div className="py-10 flex lg:flex-row gap-2">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 text-center font-semibold truncate hidden md:block">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-semibold text-center truncate">
                  Qty
                </th>
                <th className="px-4 py-3 font-semibold truncate">Total</th>
                <th className="px-4 py-3 font-semibold truncate">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {cart.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <img
                        src={product.image}
                        alt="Product"
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 text-center max-sm:hidden">
                    ${product.offerPrice}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex">
                      <button
                        disabled={product.qty <= 1}
                        onClick={() => updateQty(product.id, "-")}
                        className="bg-gray-300 hover:bg-gray-400 text-red-800 text-xl font-bold py-1 px-3 rounded"
                      >
                        -
                      </button>
                      <span className="text-lg mx-2">{product.qty}</span>
                      <button
                        onClick={() => updateQty(product.id, "+")}
                        className="bg-gray-300 hover:bg-gray-400 text-green-800 text-xl font-bold py-1 px-3 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    ${product.offerPrice * product.qty}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="text-right border-t border-gray-500/20">
                <td colSpan={5} className="py-3 pr-10">
                  Grand Total:{" "}
                  <span className="font-semibold">${grandTotal}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="max-w-[360px] w-full bg-gray-100/40 p-5  md:mr-10 border border-gray-300/70 rounded-lg shadow-sm">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Country</p>
          <select
            value={country.name}
            onChange={(e) =>
              setCountry(countries.find((c) => c.name === e.target.value))
            }
            className="bg-white w-full focus:border-green-300 focus:outline-none hover:outline-none p-2 border border-gray-300 rounded mt-2 mb-3"
          >
            {countries.map((c, i) => (
              <option key={i} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <input
            className="bg-white w-full focus:border-green-300 focus:outline-none hover:outline-none p-2 border border-gray-300 rounded mt-2 mb-3"
            type="text"
            placeholder="Enter your location..."
            value={address}
            onChange={(e)=>setAddress(e.target.value)}
          />

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none rounded">
            <option value="COD">Cash On Delivery</option>
            <option value="Online" selected>
              Online Payment
            </option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-600 mt-4 space-y-2 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>${grandTotal}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">${country.shipping}</span>
          </p>
          <p className="flex justify-between">
            <span>Tax</span>
            <span>${country.tax}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>${totalAmount}</span>
          </p>
        </div>

        <button onClick={checkOut} disabled={cart.length === 0} className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition rounded">
          Place Order
        </button>
      </div>
    </div>
  );
}

export default AddToCard;
