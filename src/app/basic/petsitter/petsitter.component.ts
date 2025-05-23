import { Component } from '@angular/core';
import { PetsitterService } from '../../services/petsitter.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DropdownModule } from 'primeng/dropdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCardModule } from 'ng-zorro-antd/card';

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}
interface PetSitter{
  id: number | null;
  first_name: string;
  last_name: string;
  gender:Gender,
  phone:string,
  bith_date: string;
  email: string;
  password: string;
  password_confirmation: string;
  status: string;
}
@Component({
  standalone: true,
  selector: 'app-petsitter',
  imports: [CommonModule , 
    FormsModule,
    NzModalModule,
    NzFormModule, 
    NzIconModule, 
    NzInputModule,
    ReactiveFormsModule,
        NzButtonModule,
        DropdownModule,
        NzDividerModule,
        NzRadioModule,
        NzCardModule
  ],
  templateUrl: './petsitter.component.html',
  styleUrl: './petsitter.component.css'
})
export class PetsitterComponent {
  petSitters : any[] = [];
  statutOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: ' Pending' },
    { value: 'Deleted', label: 'Deleted' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Suspended', label: 'Suspended' }
   ];
  
   genderOptions = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' },
    { value: Gender.Other, label: 'Other' }
  ];
   isModalVisible = false;
   isEditMode = false;
   showAddForm = false;
   newPetSitter = {
    id: null,
    first_name: '',
    last_name: '',
    gender:Gender.Female,
    phone: '',
    birth_date: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'Pending',
  
    personal_address: {
      city: '',
      street: '',
      zipcode: ''
    },
    kennel_address: {
      city: '',
      street: '',
      zipcode: ''
    }
  };
  
  
    searchSubject = new Subject<string>();
    isDeletedStatus = false;
    searchTerm = '';
    selectedStatus: string | null = null;  // lié au nz-select
    ACACED: File | null = null;




  constructor( private petsitterService: PetsitterService,
     private modal: NzModalService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) { }

  ngOnInit(): void {

    this.loadPetSitters();
     this.searchSubject.pipe(
              debounceTime(500),
              distinctUntilChanged(),
              switchMap(term => {
                return term ? this.petsitterService.getByEmailPhoneName(term) : this.petsitterService.getPetsitters();
              })
            ).subscribe({
              next: (data) => {
                console.log('Résultat de la recherche :', data);
            
                // 1) Si service renvoie directement un tableau
                if (Array.isArray(data)) {
                  this.petSitters = data;
            
                // 2) Si service renvoie { data: [...] }
                } else if (Array.isArray((data as any).data)) {
                  this.petSitters = (data as any).data;
            
                // 3) Cas unique : un seul objet
                } else {
                  this.petSitters = [data];
                }
            
          
              },
              error: (err) => {
                console.error(err);
                this.petSitters = [];
               
              }
            });
    
  }
  
  loadPetSitters() {
    this.petsitterService.getPetsitters().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.petSitters = Array.isArray(data) ? data : [];
  },
  error: (err) => {
    console.error('Erreur de récupération des données:', err);
    this.petSitters = []; // Réinitialiser les données
    
  }
});
      
  }
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm.trim());
  } 
  resetSearch(): void {
    this.searchTerm = '';
    this.loadPetSitters(); // Réutilise la méthode existante
  }
onStatusFilter(status: string): void {
  this.petsitterService.getByStatus(status).subscribe({
    next: data => {
      console.log('Résultat filtre statut :', data);
      if (Array.isArray(data)) {
        this.petSitters = data;
  
      }
      this.isDeletedStatus = (status === 'Deleted');
      
    },
    error: err => {
      console.error(err);
      this.petSitters = [];
      
    }
  });
}


  

updatePetSitterStatus(petSitterId: number, newStatus: string) : void {
     // Accéder à la liste des petOwners [petOwners, msg, success]
  const petSitter = this.petSitters[0].petSitters.find((p: { id: number; }) => p.id === petSitterId);

  const oldStatus = petSitter.status;
  petSitter.status = newStatus;

  this.petsitterService.updateStatut(petSitterId, newStatus).subscribe({
      next: (response) => {
          console.log('Mise à jour réussie', response);
          this.loadPetSitters
      },
      error: (err) => {
          console.error('Erreur de mise à jour:', err);
          petSitter.status = oldStatus;
      },
      complete: () => {
          console.log('Mise à jour terminée');
      }
  });
}

onEditPetSitter(petSitter: any): void {
  this.newPetSitter = {
    ...petSitter,
    personal_address: {
      city: petSitter.personal_address?.city || '',
      street: petSitter.personal_address?.street || '',
      zipcode: petSitter.personal_address?.zipcode || '',
    },
    kennel_address: {
      city: petSitter.kennel_address?.city || '',
      street: petSitter.kennel_address?.street || '',
      zipcode: petSitter.kennel_address?.zipcode || '',
    }
  };
  console.log(this.newPetSitter);  // Vérifie les données ici
  this.isEditMode = true;
  this.showAddForm = true;
}


onSubmitPetSitter(form: NgForm): void {
  if (form.invalid) return;

  if (this.isEditMode && this.newPetSitter.id !== null) {
    this.petsitterService.updatePetSitter(this.newPetSitter.id, this.newPetSitter).subscribe({
      next: () => {
        this.message.success('Gardien modifié avec succès');
        this.resetForm();
        this.loadPetSitters();
      },
      error: (err: any) => {
        this.message.error('Erreur lors de la modification');
        console.error(err);
      }
    });
  } else {
    // Construction du FormData pour l'ajout avec fichier
    const formData = new FormData();

    formData.append('first_name', this.newPetSitter.first_name);
    formData.append('last_name', this.newPetSitter.last_name);
    formData.append('gender', this.newPetSitter.gender);
    formData.append('phone', this.newPetSitter.phone);
    formData.append('birth_date', this.newPetSitter.birth_date);
    formData.append('email', this.newPetSitter.email);
    formData.append('password', this.newPetSitter.password);
    formData.append('password_confirmation', this.newPetSitter.password_confirmation);
    formData.append('status', this.newPetSitter.status);

    // Adresses : aplatir les objets
    formData.append('personal_address[city]', this.newPetSitter.personal_address.city);
    formData.append('personal_address[street]', this.newPetSitter.personal_address.street);
    formData.append('personal_address[zipcode]', this.newPetSitter.personal_address.zipcode);

    formData.append('kennel_address[city]', this.newPetSitter.kennel_address.city);
    formData.append('kennel_address[street]', this.newPetSitter.kennel_address.street);
    formData.append('kennel_address[zipcode]', this.newPetSitter.kennel_address.zipcode);

    // Fichier ACACED
    if (this.ACACED) {
      formData.append('ACACED', this.ACACED);
    }

    this.petsitterService.addPetSitter(formData).subscribe({
      next: () => {
        this.message.success('gardien ajouté avec succès');
        this.resetForm();
        this.loadPetSitters();
      },
      error: (err: any) => {
        this.message.error("Erreur lors de l'ajout");
        console.error(err);
      }
    });
  }
}
onAcacedFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.ACACED = file;
  }
}



resetForm(): void {
  this.newPetSitter = {
    id: null,
    first_name: '',
    last_name: '',
    gender: Gender.Female,
    phone: '',
    birth_date: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'Active',
    personal_address: {
      city: '',
      street: '',
      zipcode: ''
    },
    kennel_address: {
      city: '',
      street: '',
      zipcode: ''
    }
  };
  this.isEditMode = false;
  this.showAddForm = false;
}

openAddModal(): void {
  this.isModalVisible = true;
  this.showAddForm = true;
  this.resetForm();
}

viewPetSitter(petSitterId: number): void {
  this.petsitterService.getPetSitterById(petSitterId).subscribe({
    next: (response) => {
      const petSitter = response.petSitter;
      const createdAt = response.created_at;
      const updatedAt = response.updated_at;
      const deletedAt = response.deleted_at ?? 'Non supprimé';

      if (petSitter) {
        this.modal.create({
          nzTitle: 'Détails du Petsitter',
          nzContent: `
            <div class="custom-modal-content">
              <p><strong>Nom :</strong> ${petSitter.first_name} ${petSitter.last_name}</p>
              <p><strong>Email :</strong> ${petSitter.email}</p>
              <p><strong>Phone :</strong> ${petSitter.phone}</p>
              <p><strong>Experience :</strong> ${petSitter.experience}</p>
              <p><strong>personalQualities :</strong> ${petSitter.personalQualities}</p>
              <p><strong>skills :</strong> ${petSitter.skills}</p>
              <p><strong>Statut :</strong> ${petSitter.status}</p>
              <p><strong>Créé le :</strong> ${createdAt}</p>
              <p><strong>Mis à jour le :</strong> ${updatedAt}</p>
              <p><strong>Supprimé le :</strong> ${deletedAt}</p>
            </div>
          `,
          nzClosable: true,
          nzFooter: null,
          nzWidth: '600px',
          nzStyle: { top: '20px' },
          nzBodyStyle: { padding: '20px', background: '#fff' }, // <-- Force un fond blanc
          nzMaskStyle: { background: 'rgba(0, 0, 0, 0.5)' } // <-- Assure un overlay semi-transparent
        });
      } else {
        this.modal.error({
          nzTitle: 'Erreur',
          nzContent: 'Petsitter non trouvé.',
          nzMaskClosable: false
        });
      }
    },
    error: (err) => {
      console.error('Erreur :', err);
      this.modal.error({
        nzTitle: 'Erreur serveur',
        nzContent: 'Impossible de charger les données.',
        nzMaskClosable: false
      });
    }
  });
}
ondeleteSitter(petSitterId: number): void {
  this.modal.confirm({
    nzTitle: 'Suppression du Gardien',
    nzContent: `
      <div class="custom-modal-content">
        <p>Voulez-vous vraiment supprimer ce gardien ?</p>
      </div>
    `,
    nzOkText: 'Supprimer',
    nzCancelText: 'Annuler',
    nzClosable: true,
    nzStyle: { top: '20px' },
    nzBodyStyle: { padding: '20px', background: '#fff' },
    nzMaskStyle: { background: 'rgba(0, 0, 0, 0.5)' },
    nzOnOk: () => {
      this.petsitterService.deletePetSitter(petSitterId).subscribe({
        next: () => {
          this.message.success('Gardien supprimé avec succès');
          this.loadPetSitters();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  });
}
restoreSitter(petSitterId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment restaurer ce gardien ?',
    nzOnOk: () => {
      this.petsitterService.restoreSitter(petSitterId).subscribe({
        next: () => {
          this.message.success('Gardien restauré avec succès');
          this.loadPetSitters();
        },
        error: (err) => {
          this.message.error('Erreur lors de la restauration');
          console.error(err);
        }
      });
    }
  });

 
}

forceDeleteSitter(petSitterId: number): void {
  this.modal.confirm({
    nzTitle: 'Voulez-vous vraiment supprimer définitivement ce Gardien ?',
    nzOnOk: () => {
      this.petsitterService.forceDelete(petSitterId).subscribe({
        next: () => {
          this.message.success('Gardien supprimé définitivement avec succès');
          this.loadPetSitters();
        },
        error: (err) => {
          this.message.error('Erreur lors de la suppression définitive');
          console.error(err);
        }
      });
    }
  });
}

}