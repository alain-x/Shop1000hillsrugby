import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ApiService } from "../service/api.service";
import { CartService } from "../service/cart.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

declare var paypal: any;

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit, AfterViewInit {
  cart: any[] = [];
  message: string | null = null;
  totalPrice: number = 0;
  isCartEmpty: boolean = true;
  userId: number = 1;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngAfterViewInit(): void {
    if (!this.isCartEmpty) {
      this.initializePayPal();
    }
  }

  loadCart(): void {
    this.cart = this.cartService.getCart();
    this.calculateTotalPrice();
    this.isCartEmpty = this.cart.length === 0;
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  incrementItem(itemId: number): void {
    this.cartService.incrementItem(itemId);
    this.loadCart();
  }

  decrementItem(itemId: number): void {
    this.cartService.decrementItem(itemId);
    this.loadCart();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
    this.loadCart();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.loadCart();
  }

  handleCheckOut(): void {
    if (!this.apiService.isAuthenticated()) {
      this.message = "You need to log in before you can place an order.";
      setTimeout(() => {
        this.message = null;
        this.router.navigate(["/login"]);
      }, 3000);
      return;
    }

    const orderItems = this.cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    const orderRequest = {
      totalPrice: this.totalPrice,
      items: orderItems,
    };

    this.apiService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.message = response.message;
        if (response.status === 200) {
          this.cartService.clearCart();
          this.loadCart();
        }
      },
      error: (error) => {
        console.log(error);
        this.message = error?.error?.message || "Unable to place the order.";
      },
    });
  }

  initializePayPal(): void {
    const PAYPAL_SCRIPT_ID = "paypal-jssdk";
    const PAYPAL_SCRIPT_URL =
    
    "https://www.paypal.com/sdk/js?client-id=AeZBeO50BgYNw7e_mJ1QtcVjF24FNdQdoSQSOpGgrd9EZuPdgM6t2agYyR0DsA6aREmAkH3nxm0LvgJu";

    if (!document.getElementById(PAYPAL_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = PAYPAL_SCRIPT_ID;
      script.src = PAYPAL_SCRIPT_URL;
      script.onload = () => this.renderPayPalButton();
      document.body.appendChild(script);
    } else {
      this.renderPayPalButton();
    }
  }

  renderPayPalButton(): void {
    paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: this.totalPrice.toFixed(2) },
              },
            ],
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            if (details.status === "COMPLETED") {
              this.message = `Payment successful! Thank you, ${details.payer.name.given_name}.`;
              this.clearCart();
            }
          });
        },
        onError: (err: any) => {
          console.error("PayPal Checkout Error:", err);
          this.message =
            "An error occurred during the payment process. Please try again.";
        },
      })
      .render("#paypal-button-container");
  }
}
