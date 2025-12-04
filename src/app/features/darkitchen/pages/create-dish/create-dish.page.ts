import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DishService } from '../../../../core/services/dish.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DarkitchenService } from '../../../../core/services/darkitchen.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
    selector: 'app-create-dish',
    templateUrl: './create-dish.page.html',
    styleUrls: ['./create-dish.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CreateDishPage implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private dishService = inject(DishService);
    private authService = inject(AuthService);
    private darkitchenService = inject(DarkitchenService);
    private toastService = inject(ToastService);
    private storage = inject(Storage);

    dishForm!: FormGroup;
    photos: string[] = [];
    photoFiles: File[] = [];
    tags: string[] = [];
    sizes: string[] = [];
    extras: string[] = [];
    isLoading = false;
    darkitchenId: string = '';

    ngOnInit(): void {
        this.initForm();
        this.loadDarkitchen();
    }

    initForm(): void {
        this.dishForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0.01)]],
            category: ['', Validators.required],
            preparationTime: [30, [Validators.required, Validators.min(1)]],
            restaurantName: [''],
            available: [true]
        });
    }

    async loadDarkitchen(): Promise<void> {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            this.darkitchenService.getDarkitchensByOwner(userId).subscribe(darkitchens => {
                if (darkitchens && darkitchens.length > 0) {
                    this.darkitchenId = darkitchens[0].id;
                }
            });
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file && this.photos.length < 5) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photos.push(e.target.result);
                this.photoFiles.push(file);
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto(index: number): void {
        this.photos.splice(index, 1);
        this.photoFiles.splice(index, 1);
    }

    addTag(value: any): void {
        if (value && value.trim() && !this.tags.includes(value.trim())) {
            this.tags.push(value.trim());
        }
    }

    removeTag(index: number): void {
        this.tags.splice(index, 1);
    }

    addSize(value: any): void {
        if (value && value.trim() && !this.sizes.includes(value.trim())) {
            this.sizes.push(value.trim());
        }
    }

    removeSize(index: number): void {
        this.sizes.splice(index, 1);
    }

    addExtra(value: any): void {
        if (value && value.trim() && !this.extras.includes(value.trim())) {
            this.extras.push(value.trim());
        }
    }

    removeExtra(index: number): void {
        this.extras.splice(index, 1);
    }

    async uploadImages(): Promise<string[]> {
        const uploadPromises = this.photoFiles.map(async (file, index) => {
            const timestamp = Date.now();
            const fileName = `dishes/${this.darkitchenId}/${timestamp}_${index}.jpg`;
            const storageRef = ref(this.storage, fileName);

            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        });

        return await Promise.all(uploadPromises);
    }

    async onSubmit(): Promise<void> {
        if (this.dishForm.valid && this.photos.length > 0 && this.darkitchenId) {
            this.isLoading = true;

            try {
                // Upload images
                const imageUrls = await this.uploadImages();

                // Prepare options
                const options: any = {};
                if (this.sizes.length > 0) options.sizes = this.sizes;
                if (this.extras.length > 0) options.extras = this.extras;

                // Prepare dish data matching Dish model
                const dishData: any = {
                    darkitchenId: this.darkitchenId,
                    name: this.dishForm.value.name,
                    description: this.dishForm.value.description,
                    price: parseFloat(this.dishForm.value.price),
                    category: this.dishForm.value.category,
                    images: imageUrls,
                    available: this.dishForm.value.available,
                    preparationTime: parseInt(this.dishForm.value.preparationTime),
                    rating: 0,
                    reviewCount: 0
                };

                // Add optional fields only if they have values
                if (Object.keys(options).length > 0) {
                    dishData.options = options;
                }
                if (this.tags.length > 0) {
                    dishData.tags = this.tags;
                }
                if (this.dishForm.value.restaurantName) {
                    dishData.restaurantName = this.dishForm.value.restaurantName;
                }

                // Create dish
                this.dishService.createDish(dishData).subscribe({
                    next: () => {
                        this.toastService.showSuccess('Platillo creado exitosamente');
                        this.router.navigate(['/darkitchen/dishes']);
                    },
                    error: (error) => {
                        console.error('Error creating dish:', error);
                        this.toastService.showError('Error al crear el platillo');
                        this.isLoading = false;
                    }
                });
            } catch (error) {
                console.error('Error uploading images:', error);
                this.toastService.showError('Error al subir las imágenes');
                this.isLoading = false;
            }
        }
    }
}
