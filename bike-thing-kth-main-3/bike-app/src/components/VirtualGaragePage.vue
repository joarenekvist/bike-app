<template>
  <v-app style="height: 100vh; background-color: #f0f2f5;">
    <v-container fluid class="garage-container">
      <!-- page title -->
      <h1 class="garage-title">My Virtual Bike Garage</h1>

      <!-- bike card -->
      <v-expand-transition>
        <v-container v-if="showBikeArray">
          <v-row>
            <!-- Loop over bikes array -->
            <v-col v-for="bike in bikes" :key="bike.id" cols="6" sm="6" md="4" lg="3">
              <v-card class="bike-card d-flex flex-column align-center text-center pa-4" outlined>
                <div class="bike-thumbnail">
                  <v-img :src="bike.image || defaultBikeImage" height="100" contain />
                </div>
                <div class="text-subtitle-1 mt-2">
                  {{ bike.nickname || 'Unnamed Bike' }}
                </div>
                <v-card-subtitle>
                  {{ bike.brand }} {{ bike.model }}
                </v-card-subtitle>
                <v-btn text small color="primary" @click="selectBike(bike.id)">View Bike</v-btn>
              </v-card>
            </v-col>

            <!-- Add New Bike Card -->
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-card class="bike-card d-flex flex-column align-center justify-center text-center pa-4 grey lighten-3"
                style="cursor: pointer; height: 100%;" @click="showBikeForm = true">
                <v-icon size="48">mdi-plus</v-icon>
                <div>Add New Bike</div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-expand-transition>
      <v-dialog v-model="showBikeForm" max-width="500px">
        <v-card>
          <v-card-title>Add a New Bike</v-card-title>
          <v-card-text>
            <v-text-field label="Nickname" v-model="localBikeTemplate.nickname" />
            <v-text-field label="Brand" v-model="localBikeTemplate.brand" />
            <v-text-field label="Model" v-model="localBikeTemplate.model" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateBikeTemplate">Add</v-btn>
            <v-btn text @click="showBikeForm = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- View bike -->
      <v-container fluid v-if="showBike != false">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1>{{ selectedBike.nickname || 'Unnamed Bike' }}</h1>
            
            <!-- Add brand and model display below the name -->
            <p class="text-subtitle-1 grey--text mb-3">
              {{ selectedBike.brand }} {{ selectedBike.model }}
            </p>

            <v-btn text small color="primary" @click="editBikeName">
              Edit Bike Name
            </v-btn>

            <div class="bike-detail-image">
              <v-img :src="selectedBike.image || defaultBikeImage" height="300" contain class="my-6" />
            </div>

            <v-btn text small color="secondary" @click="editBikePicture">
              Edit Bike Picture
            </v-btn>
            
            <div class="d-flex justify-center mt-3">
              <v-btn text @click="showBikeArray = true, showBike = false">
                <v-icon left>mdi-arrow-left</v-icon>
                Back to Garage
              </v-btn>
              
              <!-- Only show the Add Component button if there are existing components -->
              <v-btn 
                v-if="selectedBike.components && selectedBike.components.length > 0"
                color="primary"
                class="ml-4"
                @click="toggleComponentForm">
                <v-icon left>{{ showForm ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
                {{ showForm ? 'Hide Form' : 'Add Component' }}
              </v-btn>
              
              <v-btn text color="error" class="ml-4" @click="confirmDeleteBike">
                <v-icon left>mdi-delete</v-icon>
                Delete Bike
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Add Component Form -->
        <v-expand-transition>
          <v-row v-if="showForm" justify="center" class="mt-4">
            <v-col cols="12" md="8">
              <v-card class="add-component-card" outlined>
                <v-card-title class="primary--text">
                  <v-icon left color="primary">mdi-plus-circle</v-icon>
                  Add New Component
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-form ref="componentForm" v-model="formValid" @submit.prevent="validateAndAddComponent">
                    <v-row>
                      <v-col cols="12" md="6">
                        <!-- Component Type Selection with custom option -->
                        <v-combobox 
                          v-model="newComponent.type" 
                          :items="componentTypes" 
                          label="Component Type *"
                          hint="Select from list or enter custom type" 
                          persistent-hint 
                          outlined 
                          dense
                          :rules="[v => !!v || 'Component type is required']"
                          @change="onTypeChange" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <!-- Brand Selection with custom option -->
                        <v-combobox 
                          v-model="newComponent.brand" 
                          :items="filteredBrands" 
                          label="Brand *"
                          hint="Select from list or enter custom brand" 
                          persistent-hint 
                          outlined 
                          dense
                          :rules="[v => !!v || 'Brand is required']" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field 
                          v-model.number="newComponent.lifespan" 
                          label="Expected Lifespan (km) *" 
                          type="number" 
                          outlined 
                          dense
                          :rules="[
                            v => !!v || 'Lifespan is required',
                            v => (v && v > 0) || 'Lifespan must be greater than 0'
                          ]" />
                      </v-col>
                      <v-col cols="12">
                        <v-textarea 
                          v-model="newComponent.description" 
                          label="Description *" 
                          outlined 
                          dense 
                          rows="2"
                          :rules="[v => !!v || 'Description is required']" />
                      </v-col>
                    </v-row>
                    <div class="text-caption text-grey">* Required fields</div>
                    
                    <!-- Error alert -->
                    <v-alert
                      v-if="formError"
                      type="error"
                      dense
                      class="mt-3"
                      dismissible
                      @input="formError = false"
                    >
                      Please fill in all required fields correctly before adding the component.
                    </v-alert>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="cancelAddComponent">Cancel</v-btn>
                  <v-btn 
                    color="primary" 
                    @click="validateAndAddComponent"
                    :loading="isSubmitting">
                    Add Component
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-expand-transition>

        <!-- Components section header -->
        <v-row class="mt-6" v-if="selectedBike.components && selectedBike.components.length > 0">
          <v-col cols="12">
            <h2 class="components-header">
              <v-icon left>mdi-bike-fast</v-icon>
              Bike Components
              <span class="text-subtitle-1 ml-2">
                ({{ selectedBike.components.length }} total)
              </span>
            </h2>
            <v-divider></v-divider>
          </v-col>
        </v-row>

        <!-- display components -->
        <v-row class="mt-2">
          <v-col v-for="(component, index) in selectedBike.components" :key="index" cols="12" sm="6" md="4">
            <v-card class="garage-card" outlined elevation="2">
              <div class="status-dot" :class="(component.inUse ?? 1) ? 'active' : 'inactive'"></div>

              <v-card-title class="text-h6">
                {{ component.type || 'Unnamed Component' }}
              </v-card-title>
              <v-card-text>
                <p><strong>Brand:</strong> {{ component.brand || 'Unknown' }}</p>
                <p><strong>Description:</strong> {{ component.description || 'No description provided' }}</p>
                <p><strong>Mileage:</strong> {{ component.health?.mileage ?? 0 }} km</p>
                <p><strong>Lifespan:</strong> {{ component.health?.lifespan ?? 1000 }} km</p>

                <!-- Health bar -->
                <v-progress-linear
                  :value="calculateHealth(component)"
                  :color="healthColor(component)"
                  height="10"
                  striped
                  rounded
                  class="mt-2">
                </v-progress-linear>
                <div class="text-caption text-right">
                  {{ calculateHealth(component) }}% health
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn :color="(component.inUse ?? 1) ? 'red' : 'green'" @click="toggleActive(index)">
                  {{ (component.inUse ?? 1) ? 'Deactivate' : 'Activate' }}
                </v-btn>
                <v-btn color="primary" @click="openInspect(component, index)">Inspect</v-btn>
                <v-btn text color="grey" @click="removeComponent(index)">Remove</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Empty state for no components -->
          <v-col v-if="!selectedBike.components || selectedBike.components.length === 0" cols="12" class="text-center">
            <v-card flat class="pa-5 grey lighten-4">
              <v-icon x-large color="grey">mdi-bike</v-icon>
              <p class="text-h6 mt-3">No Components Added Yet</p>
              <p class="text-body-1 grey--text">Add your first component to start tracking maintenance.</p>
              <v-btn color="primary" @click="showForm = true" class="mt-3">
                <v-icon left>mdi-plus</v-icon>
                Add First Component
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- inspect dialog -->
      <v-dialog v-if="selectedComponent" v-model="dialog" max-width="500px" transition="dialog-bottom-transition"
        persistent>
        <v-card class="inspect-dialog-card">
          <v-card-title class="dialog-title">
            {{ selectedComponent?.type || 'Unnamed Component' }} Inspection
          </v-card-title>

          <v-card-text>
            <div class="dialog-description">
              <p><strong>Brand:</strong> {{ selectedComponent?.brand || 'Unknown' }}</p>
              <p><strong>Description:</strong> {{ selectedComponent?.description || 'No description provided' }}</p>
              <p><strong>Mileage:</strong> {{ selectedComponent?.health?.mileage ?? 0 }} km</p>
              <p><strong>Lifespan:</strong> {{ selectedComponent?.health?.lifespan ?? 1000 }} km</p>
            </div>

            <!-- health bar -->
            <v-progress-linear :value="calculateHealth(selectedComponent)" :color="healthColor(selectedComponent)"
              height="24" striped rounded class="my-4">
              <strong class="mx-auto">{{ calculateHealth(selectedComponent) }}% HP</strong>
            </v-progress-linear>

            <!-- Simulate mileage update after ride -->
            <v-text-field v-model.number="mileageToAdd" label="Add Distance Ridden (km)" type="number" outlined
              class="mt-4" />

            <v-btn color="primary" class="mt-2" @click="applyMileageUpdate">
              Update Mileage
            </v-btn>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Bike Confirmation Dialog -->
      <v-dialog v-model="showDeleteConfirmation" max-width="400px">
        <v-card>
          <v-card-title class="headline error--text">Delete Bike</v-card-title>
          <v-card-text>
            Are you sure you want to delete "{{ selectedBike?.nickname || 'this bike' }}"? This action cannot be undone.
            All components associated with this bike will also be deleted.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showDeleteConfirmation = false">Cancel</v-btn>
            <v-btn color="error" @click="deleteBike">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Edit Bike Name Dialog -->
      <v-dialog v-model="showEditNameDialog" max-width="400px">
        <v-card>
          <v-card-title>Edit Bike Details</v-card-title>
          <v-card-text>
            <v-form ref="nameForm" v-model="nameFormValid">
              <v-text-field
                v-model="editedBikeName"
                label="Bike Name"
                :rules="[v => !!v || 'Bike name is required']"
                outlined
                autofocus
              ></v-text-field>
              
              <v-text-field
                v-model="editedBikeBrand"
                label="Brand"
                outlined
              ></v-text-field>
              
              <v-text-field
                v-model="editedBikeModel"
                label="Model"
                outlined
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showEditNameDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveBikeName">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import defBikeImage from '@/assets/bike.png';

export default {
  name: 'VirtualGaragePage',

  props: {
    bikeComponents: Array,
    user: {
      type: Object,
      required: true,
    },
    bikes: {
      type: Array,
      required: true
    },
    selectedBikeId: {
      type: String,
      required: false
    },
  },

  data() {
    return {
      show: false,
      showForm: false,
      isCustomType: false,
      formValid: false,
      formError: false,
      isSubmitting: false,
      newComponent: {
        type: '',
        brand: '',
        lifespan: null,
        description: '',
      },
      dialog: false,
      selectedComponent: null,
      selectedIndex: null,
      mileageToAdd: 0,
      showDeleteConfirmation: false,
      
      // New properties for name editing
      showEditNameDialog: false,
      nameFormValid: false,
      editedBikeName: "",
      editedBikeBrand: "",
      editedBikeModel: "",
      
      componentTypes: [
        "Frame", "Wheels", "Rims", "Spokes", "Hubs", "Tires", "Tubes", "Brakes", "Brake Pads",
        "Rotors", "Brake Cables", "Brake Levers", "Chain", "Cassette", "Chainrings", "Crankset",
        "Bottom Bracket", "Pedals", "Front Derailleur", "Rear Derailleur", "Shifters", "Gear Cables",
        "Headset", "Handlebars", "Stem", "Saddle", "Seatpost", "Suspension Fork", "Rear Shock",
        "Lights", "Electronics", "Bottle Cages", "Racks", "Fenders"
      ],
      brandOptions: {
        Frame: ["Specialized", "Trek", "Giant", "Cannondale", "BMC", "Scott", "Santa Cruz", "Canyon", "Orbea"],
        Wheels: ["Mavic", "DT Swiss", "Zipp", "Fulcrum", "Bontrager", "Shimano", "Industry Nine", "Hope", "Roval"],
        Rims: ["DT Swiss", "Mavic", "Zipp", "ENVE", "Alexrims", "WTB"],
        Spokes: ["DT Swiss", "Sapim", "Pillar", "Wheelsmith"],
        Hubs: ["DT Swiss", "Hope", "Shimano", "Chris King", "Industry Nine", "Novatec"],
        Tires: ["Continental", "Schwalbe", "Maxxis", "Vittoria", "Pirelli", "Michelin", "Panaracer"],
        Tubes: ["Schwalbe", "Continental", "Michelin", "Slime", "Tubolito"],
        Brakes: ["Shimano", "SRAM", "Magura", "TRP", "Hope", "Avid", "Formula"],
        "Brake Pads": ["Shimano", "SRAM", "Kool Stop", "Jagwire", "SwissStop"],
        Rotors: ["Shimano", "SRAM", "Magura", "Hope", "TRP"],
        "Brake Cables": ["Shimano", "SRAM", "Jagwire", "Magura", "TRP"],
        "Brake Levers": ["Shimano", "SRAM", "TRP", "Magura", "Tektro"],
        Chain: ["Shimano", "SRAM", "KMC", "Wippermann", "YBN"],
        Cassette: ["Shimano", "SRAM", "Campagnolo", "SunRace"],
        Chainrings: ["Shimano", "SRAM", "Race Face", "AbsoluteBLACK", "Wolf Tooth", "FSA"],
        Crankset: ["Shimano", "SRAM", "FSA", "Race Face", "Praxis", "Campagnolo"],
        "Bottom Bracket": ["Shimano", "SRAM", "Hope", "Chris King", "Wheels Mfg", "Enduro"],
        Pedals: ["Shimano", "Crankbrothers", "Look", "Time", "HT", "Race Face"],
        "Front Derailleur": ["Shimano", "SRAM", "Campagnolo", "MicroSHIFT"],
        "Rear Derailleur": ["Shimano", "SRAM", "Campagnolo", "MicroSHIFT"],
        Shifters: ["Shimano", "SRAM", "Campagnolo", "MicroSHIFT"],
        "Gear Cables": ["Jagwire", "Shimano", "SRAM"],
        Headset: ["FSA", "Cane Creek", "Chris King", "Hope"],
        Handlebars: ["Race Face", "ENVE", "Ritchey", "Zipp", "FSA", "Renthal"],
        Stem: ["Race Face", "Ritchey", "FSA", "Thomson", "Zipp", "ENVE"],
        Saddle: ["Fizik", "Selle Italia", "Selle Royal", "WTB", "Brooks", "Prologo"],
        Seatpost: ["Thomson", "RockShox (Reverb)", "KS", "Fox", "Race Face", "FSA"],
        "Suspension Fork": ["RockShox", "Fox", "Marzocchi", "Manitou", "SR Suntour"],
        "Rear Shock": ["Fox", "RockShox", "Öhlins", "Cane Creek", "DVO"],
        Lights: ["Lezyne", "Knog", "Cateye", "Bontrager", "Garmin", "NiteRider"],
        Electronics: ["Garmin", "Wahoo", "Cateye", "Bryton", "Sigma"],
        "Bottle Cages": ["Tacx", "Elite", "Bontrager", "Lezyne", "Blackburn"],
        Racks: ["Topeak", "Blackburn", "Tubus", "Ortlieb", "Axiom"],
        Fenders: ["SKS", "Topeak", "Zefal", "Mucky Nutz", "Crud"]
      },
      showBikeForm: false,
      showBikeArray: true,
      showBike: false,
      defaultBikeImage: defBikeImage,
      
      localBikeTemplate: {
        nickname: "",
        brand: "",
        model: "",
        components: []
      }
    };
  },

  computed: {
    filteredBrands() {
      if (this.isCustomType || !this.brandOptions[this.newComponent.type]) {
        return [];
      }
      return this.brandOptions[this.newComponent.type];
    },
    selectedBike() {
      return this.bikes.find(bike => bike.id === this.selectedBikeId) || null;
    }
  },

  watch: {
    'newComponent.type'(newType) {
      this.isCustomType = !this.componentTypes.includes(newType);
    },
  },

  methods: {
    toggleComponentForm() {
      this.showForm = !this.showForm;
      if (this.showForm) {
        this.resetComponentForm();
      }
    },
    
    resetComponentForm() {
      this.newComponent = {
        type: '',
        brand: '',
        lifespan: null,
        description: '',
      };
      this.formError = false;
      if (this.$refs.componentForm) {
        this.$refs.componentForm.resetValidation();
      }
    },
    
    validateAndAddComponent() {
      this.isSubmitting = true;
      
      // First, validate the form
      if (this.$refs.componentForm) {
        this.$refs.componentForm.validate();
      }
      
      // Check if all required fields are filled
      if (this.formValid) {
        this.addManualComponent();
      } else {
        this.formError = true;
        this.isSubmitting = false;
      }
    },
    
    cancelAddComponent() {
      this.showForm = false;
      this.resetComponentForm();
    },
    
    onTypeChange() {
      this.newComponent.brand = '';
    },

    addManualComponent() {
      if (this.newComponent.type &&
          this.newComponent.brand &&
          this.newComponent.lifespan !== null && 
          this.newComponent.lifespan > 0 &&
          this.newComponent.description) {
        
        const componentToSend = {
          type: this.newComponent.type,
          brand: this.newComponent.brand,
          description: this.newComponent.description,
          inUse: 1,
          health: {
            mileage: 0,
            lifespan: this.newComponent.lifespan,
          },
        };

        if (this.selectedBike) {
          this.$emit("component-added", {
            bikeId: this.selectedBike.id,
            component: componentToSend
          });
          
          // Reset form
          this.resetComponentForm();
          this.showForm = false;
        } else {
          console.error("No bike selected to add the component to");
        }
      } else {
        this.formError = true;
      }
      
      this.isSubmitting = false;
    },

    removeComponent(index) {
      if (this.selectedBike) {
        this.$emit("component-removed", {
          bikeId: this.selectedBike.id,
          componentIndex: index
        });
      } else {
        console.error("No bike selected to remove component from");
      }
    },

    toggleActive(index) {
      if (this.selectedBike && this.selectedBike.components) {
        // Create a copy of the component to modify
        const updatedComponent = { ...this.selectedBike.components[index] };
        
        // Toggle the inUse property
        updatedComponent.inUse = updatedComponent.inUse ? 0 : 1;
        
        // Emit the event with the bike ID, component index and updated component
        this.$emit("component-updated", {
          bikeId: this.selectedBike.id,
          componentIndex: index,
          updatedComponent
        });
      } else {
        console.error("No bike selected or no components available");
      }
    },

    openInspect(component, index) {
      this.selectedComponent = { ...component };
      this.selectedIndex = index;
      this.mileageToAdd = 0;
      this.dialog = true;
    },

    applyMileageUpdate() {
      const added = Number(this.mileageToAdd);
      if (!isNaN(added) && added > 0) {
        const updatedComponent = { ...this.selectedComponent };
        updatedComponent.health.mileage += added;
        
        // Updated to include bikeId in the event
        this.$emit("component-updated", {
          bikeId: this.selectedBike.id,
          componentIndex: this.selectedIndex,
          updatedComponent
        });
        
        // Also emit a check-maintenance event to trigger the checkForMaintenance action
        this.$emit("check-maintenance");
        
        this.selectedComponent = updatedComponent;
        this.mileageToAdd = 0;
      }
    },

    calculateHealth(component) {
      const mileage = component?.health?.mileage ?? 0;
      const lifespan = component?.health?.lifespan ?? 1000;
      return Math.max(0, Math.round(((lifespan - mileage) / lifespan) * 100));
    },

    healthColor(component) {
      const hp = this.calculateHealth(component);
      if (hp < 20) return 'red';
      if (hp < 60) return 'orange';
      return 'green';
    },

    selectBike(bikeId) {
      this.$emit("select-bike", bikeId);
      console.log("User clicked bike", bikeId);
      this.showBike = true;
      this.showForm = false;
      this.showBikeArray = false;
    },

    updateBikeTemplate() {
      this.$emit("update-bikeTemplate", { ...this.localBikeTemplate });

      this.showBikeForm = false;
      // Reset form
      this.localBikeTemplate.nickname = "";
      this.localBikeTemplate.brand = "";
      this.localBikeTemplate.model = "";
      this.localBikeTemplate.components = [];
    },
    
    // Open the edit name dialog
    openEditNameDialog() {
      if (this.selectedBike) {
        this.editedBikeName = this.selectedBike.nickname || "";
        this.editedBikeBrand = this.selectedBike.brand || "";
        this.editedBikeModel = this.selectedBike.model || "";
        this.showEditNameDialog = true;
      }
    },
    
    // Save the updated bike name
    saveBikeName() {
      if (this.$refs.nameForm) {
        this.$refs.nameForm.validate();
      }
      
      if (this.nameFormValid && this.selectedBike) {
        // Emit events to update the bike's name, brand, and model
        this.$emit("update-bike-field", {
          bikeId: this.selectedBike.id,
          field: "nickname",
          value: this.editedBikeName
        });
        
        this.$emit("update-bike-field", {
          bikeId: this.selectedBike.id,
          field: "brand",
          value: this.editedBikeBrand
        });
        
        this.$emit("update-bike-field", {
          bikeId: this.selectedBike.id,
          field: "model",
          value: this.editedBikeModel
        });
        
        // Close the dialog
        this.showEditNameDialog = false;
      }
    },
    
    
    editBikeName() {
      this.openEditNameDialog();
    },
    
    editBikePicture() {
      console.log("Clicked on edit bike picture button. Not yet implemented.");
    },
    
    confirmDeleteBike() {
      this.showDeleteConfirmation = true;
    },
    
    deleteBike() {
      if (this.selectedBike) {
        this.$emit("delete-bike", this.selectedBike.id);
        this.showDeleteConfirmation = false;
        this.showBikeArray = true;
        this.showBike = false;
      }
    }
  },
};
</script>

<style scoped>
.garage-container {
  padding-top: 40px;
}

.garage-title {
  font-family: 'Segoe UI', sans-serif;
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.bike-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  border-radius: 10px;
  overflow: hidden;
}

.bike-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.bike-thumbnail {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bike-detail-image {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 15px;
  margin: 20px auto;
  max-width: 500px;
}

.add-component-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 700px;
  margin: 0 auto 40px auto;
  padding: 20px;
}

.add-component-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.components-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.garage-card {
  position: relative;
  transition: transform 0.2s ease-in-out;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.garage-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
}

.garage-card .v-card__text {
  flex-grow: 1;
}

.status-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-dot.active {
  background-color: green;
}

.status-dot.inactive {
  background-color: red;
}

.inspect-dialog-card {
  padding: 16px;
  border-radius: 16px;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.dialog-description p {
  margin: 8px 0;
}

.clickable-label {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976d2;
  cursor: pointer;
  user-select: none;
}
</style>