import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cart: any[] = [];

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem("cart");
    this.cart = savedCart ? JSON.parse(savedCart) : [];
  }

  /**
   * Retrieve the entire cart.
   * @returns {any[]} - Array of cart items.
   */
  getCart(): any[] {
    return this.cart;
  }

  /**
   * Retrieve a single cart item by ID.
   * @param itemId - Unique identifier for the cart item.
   * @returns {any | undefined} - The found cart item or undefined.
   */
  getCartItem(itemId: number): any | undefined {
    return this.cart.find((cartItem) => cartItem.id === itemId);
  }

  /**
   * Save the cart to localStorage for persistence.
   */
  private saveCart(): void {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  /**
   * Add a new item to the cart or increment its quantity if it already exists.
   * @param item - Item to be added to the cart.
   */
  addItem(item: any): void {
    const existingItem = this.getCartItem(item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.saveCart();
  }

  /**
   * Remove an item from the cart by its ID.
   * @param itemId - Unique identifier for the cart item.
   */
  removeItem(itemId: number): void {
    this.cart = this.cart.filter((item) => item.id !== itemId);
    this.saveCart();
  }

  /**
   * Increment the quantity of a specific cart item.
   * @param itemId - Unique identifier for the cart item.
   */
  incrementItem(itemId: number): void {
    const item = this.getCartItem(itemId);
    if (item) {
      item.quantity += 1;
      this.saveCart();
    }
  }

  /**
   * Decrement the quantity of a specific cart item.
   * If quantity is reduced to 0, the item is removed from the cart.
   * @param itemId - Unique identifier for the cart item.
   */
  decrementItem(itemId: number): void {
    const item = this.getCartItem(itemId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        this.removeItem(itemId);
      }
      this.saveCart();
    }
  }

  /**
   * Clear the entire cart and remove it from localStorage.
   */
  clearCart(): void {
    this.cart = [];
    localStorage.removeItem("cart");
  }
}
