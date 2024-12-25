import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css']
})
export class EditproductComponent implements OnInit {

  editProductForm!: FormGroup;
  categories: any[] = [];
  message: any = null;
  imageUrl: any = null;
  productId: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Get productId from route params
    this.productId = this.route.snapshot.paramMap.get('productId') || '';

    // Initialize form group
    this.editProductForm = this.fb.group({
      image: [''],  // Initially an empty string for URL
      categoryId: [''],
      name: [''],
      description: [''],
      price: ['']
    });

    // Fetch all categories
    this.apiService.getAllCategory().subscribe(res => {
      this.categories = res.categoryList;
    });

    // If productId exists, fetch product details to populate the form
    if (this.productId) {
      this.apiService.getProductById(this.productId).subscribe(res => {
        this.editProductForm.patchValue({
          categoryId: res.product.categoryId,
          name: res.product.name,
          description: res.product.description,
          price: res.product.price,
          image: res.product.imageUrl  // Populate the image URL from the database
        });
        this.imageUrl = res.product.imageUrl;  // Set the existing image URL
      });
    }
  }

  // Handle image URL change
  handleImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.value) {
      this.imageUrl = input.value;
      this.editProductForm.patchValue({ image: input.value }); // Patch the URL into the form
    }
  }

  // Handle form submission
  handleSubmit(): void {
    const formData = new FormData();
    const formValues = this.editProductForm.value;
  
    formData.append('productId', this.productId);
  
    if (formValues.categoryId) {
      formData.append('categoryId', formValues.categoryId);
    }
    if (formValues.name) {
      formData.append('name', formValues.name);
    }
    if (formValues.description) {
      formData.append('description', formValues.description);
    }
    if (formValues.price) {
      formData.append('price', formValues.price.toString());
    }
  
    // Add image or URL to formData
    if (formValues.image instanceof File) {
      formData.append('image', formValues.image); // File upload
    } else if (formValues.image) {
      formData.append('imageUrl', formValues.image); // URL
    }
  
    this.apiService.updateProduct(formData).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => {
          this.message = '';
          this.router.navigate(['/admin/products']);
        }, 3000);
      },
      error: (error) => {
        console.error(error);
        this.message = error?.error?.message || 'Unable to update the product';
      }
    });
  }
     

}
