import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("mealcraft_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("mealcraft_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (meal) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === meal._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === meal._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...meal, quantity: 1 }];
    });
  };

  const addMultipleToCart = (mealsList) => {
    setCart((prevCart) => {
      let newCart = [...prevCart];
      mealsList.forEach((meal) => {
        const idx = newCart.findIndex((item) => item._id === meal._id);
        if (idx > -1) {
          newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + 1 };
        } else {
          newCart.push({ ...meal, quantity: 1 });
        }
      });
      return newCart;
    });
  };

  const removeFromCart = (mealId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== mealId));
  };

  const updateQuantity = (mealId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
