import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../service/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-addproduct",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./addproduct.component.html",
  styleUrls: ["./addproduct.component.css"],
})
export class AddproductComponent implements OnInit {
  // Class properties
  imageUrl: string = ""; // Store the image URL
  categories: any[] = [];
  categoryId: number | null = null;
  name: string = "";
  description: string = "";
  price: string = "";
  message: string = "";

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getAllCategory().subscribe({
      next: (response) => {
        this.categories = response.categoryList || [];
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  handleSubmit(): void {
    if (
      !this.categoryId ||
      !this.name ||
      !this.description ||
      !this.price ||
      !this.imageUrl
    ) {
      this.message = "All fields are required!";
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("categoryId", this.categoryId.toString());
    formData.append("name", this.name);
    formData.append("description", this.description);
    formData.append("price", this.price);
    formData.append("imageUrl", this.imageUrl); // Send imageUrl

    this.apiService.addProduct(formData).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => {
          this.router.navigate(["/admin/products"]);
        }, 3000);
      },
      error: (error) => {
        console.error(error);
        this.message = error?.error?.message || "Unable to save the product.";
      },
    });
  }
}
