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
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="updateBikeTemplate">Add</v-btn>
            <v-btn text @click="showBikeForm = false">Cancel</v-btn>
            <v-btn text color="success" @click="showGenericBikeForm = true; showBikeForm = false">
              <v-icon left>mdi-bike</v-icon>
              Create Generic Bike
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Generic Bike Dialog -->
      <v-dialog v-model="showGenericBikeForm" max-width="600px">
        <v-card>
          <v-card-title>Create Generic Bike</v-card-title>
          <v-card-text>
            <v-form ref="genericBikeForm" v-model="genericBikeFormValid">
              <v-text-field 
                v-model="genericBike.nickname"
                label="Bike Nickname"
                :rules="[v => !!v || 'Nickname is required']"
                outlined
              ></v-text-field>
              
              <v-card class="mt-4 mb-2 pa-4 grey lighten-5">
                <v-card-title class="text-subtitle-1">
                  <v-icon left color="primary">mdi-information-outline</v-icon>
                  Components Included
                </v-card-title>
                <v-card-text>
                  <p>This bike will be created with these standard components:</p>
                  <v-simple-table dense class="mt-2">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Lifespan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(component, index) in commonComponents" :key="index">
                          <td>{{ component.name }}</td>
                          <td>{{ component.defaultLifespan }} km</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="createGenericBike" :loading="isCreatingBike" :disabled="!genericBikeFormValid">
              <v-icon left>mdi-bike</v-icon>
              Create Generic Bike
            </v-btn>
            <v-btn text @click="showGenericBikeForm = false">Cancel</v-btn>
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
                        <!-- component Type Selection -->
                        <v-autocomplete
                          v-model="newComponent.type"
                          :items="componentTypeOptions"
                          label="Component Type *"
                          hint="Select or type custom component type"
                          persistent-hint
                          outlined
                          dense
                          :rules="[v => !!v || 'Component type is required']"
                          @blur="onTypeChange"
                          clearable
                          small-chips
                          auto-select-first
                          allow-overflow
                          cache-items
                          hide-no-data
                          hide-selected
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" md="6">
                        <!--Brand Selection -->
                        <v-autocomplete
                          v-model="newComponent.brand"
                          :items="brandOptions"
                          label="Brand *"
                          hint="Select or type custom brand"
                          persistent-hint
                          outlined
                          dense
                          :rules="[v => !!v || 'Brand is required']"
                          @blur="onBrandChange"
                          clearable
                          small-chips
                          auto-select-first
                          allow-overflow
                          hide-no-data
                          hide-selected
                          :disabled="!newComponent.type"
                        ></v-autocomplete>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <!-- Updated Model Selection -->
                        <v-autocomplete
                          v-model="newComponent.model"
                          :items="modelOptions"
                          label="Model"
                          hint="Select or type custom model"
                          persistent-hint
                          outlined
                          dense
                          clearable
                          small-chips
                          auto-select-first
                          allow-overflow
                          hide-no-data
                          hide-selected
                          :disabled="!newComponent.brand"
                          @blur="onModelChange"
                        ></v-autocomplete>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="newComponent.lifespan"
                          label="Expected Lifespan (km) *"
                          type="number"
                          outlined
                          dense
                          :hint="newComponent.model ? `Model default: ${newComponent.lifespan} km` : (newComponent.type ? `Type default: ${defaultLifespan} km` : 'Enter expected lifespan')"
                          persistent-hint
                          :rules="[
                            v => !!v || 'Lifespan is required',
                            v => (v && v > 0) || 'Lifespan must be greater than 0'
                          ]"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="newComponent.description"
                          label="Description (Optional)"
                          outlined
                          dense
                          rows="2"
                          hint="Leave blank to auto-generate based on selected brand and model"
                          persistent-hint
                        ></v-textarea>
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
      
      <!-- Updated subtitle to show brand and model -->
      <v-card-subtitle>
        {{ component.brand }}
        <span v-if="component.model">{{ " - " + component.model }}</span>
      </v-card-subtitle>
      
      <v-card-text>
        <!-- Remove description section as requested -->
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
      <v-dialog v-if="selectedComponent" v-model="dialog" max-width="600px" transition="dialog-bottom-transition"
        persistent>
        <v-card class="inspect-dialog-card">
          <v-card-title class="dialog-title">
            {{ selectedComponent?.type || 'Unnamed Component' }} Inspection
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" class="d-flex justify-center align-center">
                <!-- Component image placeholder -->
                <div class="component-image-placeholder">
                  <v-img 
                    :src="getComponentImage(selectedComponent?.type)" 
                    height="120" 
                    width="120" 
                    contain 
                    class="mx-auto"
                  />
                  <div class="text-caption text-center mt-2">Component illustration</div>
                </div>
              </v-col>
              
              <v-col cols="12" md="8">
                <!-- Component details -->
                <v-form ref="inspectForm" v-model="inspectFormValid">
                  <v-text-field
                    v-model="selectedComponent.brand"
                    label="Brand"
                    outlined
                    dense
                    class="mb-2"
                  ></v-text-field>
                  
                  <!-- Add model field to inspection dialog -->
                  <v-text-field
                    v-model="selectedComponent.model"
                    label="Model"
                    outlined
                    dense
                    class="mb-2"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model.number="selectedComponent.health.lifespan"
                    label="Expected Lifespan (km)"
                    type="number"
                    outlined
                    dense
                    class="mb-2"
                    :rules="[v => v > 0 || 'Lifespan must be greater than 0']"
                  ></v-text-field>
                  
                  <p><strong>Current Mileage:</strong> {{ selectedComponent?.health?.mileage ?? 0 }} km</p>
                  
                  <!-- health bar -->
                  <v-progress-linear 
                    :value="calculateHealth(selectedComponent)" 
                    :color="healthColor(selectedComponent)"
                    height="24" 
                    striped 
                    rounded 
                    class="my-4">
                    <strong class="mx-auto">{{ calculateHealth(selectedComponent) }}% HP</strong>
                  </v-progress-linear>
                </v-form>
              </v-col>
            </v-row>

            <!-- Simulate mileage update after ride -->
            <v-divider class="my-4"></v-divider>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model.number="mileageToAdd" 
                  label="Add Distance Ridden (km)" 
                  type="number" 
                  outlined
                />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-btn 
                  color="primary" 
                  @click="applyMileageUpdate"
                  :disabled="!mileageToAdd || mileageToAdd <= 0">
                  Update Mileage
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveComponentChanges">Save Changes</v-btn>
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
      inspectFormValid: true,
      
      defaultLifespan: 1000,
      componentTypeOptions: [],
    
      brandOptions: [],
      modelOptions: [],
      
      newComponent: {
        type: '', 
        brand: '',
        model: '', 
        lifespan: null,
        description: '',
      },
      dialog: false,
      selectedComponent: null,
      selectedIndex: null,
      mileageToAdd: 0,
      showDeleteConfirmation: false,
      
      // Generic bike properties
      showGenericBikeForm: false,
      genericBikeFormValid: false,
      isCreatingBike: false,
      genericBike: {
        nickname: '',
      },
      
      //properties for name editing
      showEditNameDialog: false,
      nameFormValid: false,
      editedBikeName: "",
      editedBikeBrand: "",
      editedBikeModel: "",
      
      showBikeForm: false,
      showBikeArray: true,
      showBike: false,
      defaultBikeImage: defBikeImage,
      
      localBikeTemplate: {
        nickname: "",
        brand: "",
        model: "",
        components: []
      },
      
      // Component images placeholders
      componentImages: {
        // These will be empty placeholders until we will add some new images of componets for user to understand
        "Chain": "",
        "Tires": "",
        "Brake Pads (Rim)": "",
        "Brake Pads (Disc)": "",
        "Cassette": "",
        "Chainrings": "",
        "Cables & Housing": "",
        "Bottom Bracket Bearings": "",
        "Front Derailleur": "",
        "Rear Derailleur": "",
        "Suspension Fork": "",
        "Hub Bearings": "",
        "Headset Bearings": "",
        "default": ""
      },
      
      componentLibrary: {
        "Chain": {
          defaultLifespan: 2500,
          brands: ["Shimano", "SRAM", "KMC"],
          models: {
            "Shimano": [
              { name: "CN-HG701", lifespan: 3000 },
              { name: "CN-HG601", lifespan: 2800 },
              { name: "CN-M8100", lifespan: 3200 }
            ],
            "SRAM": [
              { name: "PC-1130", lifespan: 2700 },
              { name: "PC-1170", lifespan: 3000 },
              { name: "GX Eagle", lifespan: 3500 }
            ],
            "KMC": [
              { name: "X11", lifespan: 3000 },
              { name: "X10", lifespan: 2500 },
              { name: "X9SL", lifespan: 2800 }
            ]
          }
        },
        "Tires": {
          defaultLifespan: 4500,
          brands: ["Continental", "Schwalbe", "Maxxis"],
          models: {
            "Continental": [
              { name: "Grand Prix 5000", lifespan: 5000 },
              { name: "Gatorskin", lifespan: 6000 },
              { name: "Terra Trail", lifespan: 4000 }
            ],
            "Schwalbe": [
              { name: "Marathon Plus", lifespan: 7000 },
              { name: "Pro One", lifespan: 4500 },
              { name: "Nobby Nic", lifespan: 3500 }
            ],
            "Maxxis": [
              { name: "Minion DHF", lifespan: 3500 },
              { name: "High Roller II", lifespan: 3000 },
              { name: "Re-Fuse", lifespan: 5000 }
            ]
          }
        },
        "Brake Pads (Rim)": {
          defaultLifespan: 2000,
          brands: ["Shimano", "SwissStop", "Jagwire"],
          models: {
            "Shimano": [
              { name: "R55C4", lifespan: 2200 },
              { name: "M50T", lifespan: 1800 },
              { name: "R50T2", lifespan: 2000 }
            ],
            "SwissStop": [
              { name: "FlashPro Black Prince", lifespan: 2500 },
              { name: "FlashPro BXP", lifespan: 2300 },
              { name: "RacePro Original Black", lifespan: 1800 }
            ],
            "Jagwire": [
              { name: "Basics Road", lifespan: 1500 },
              { name: "Pro Rim Pad Inserts", lifespan: 2000 },
              { name: "Road Sport Pads", lifespan: 1800 }
            ]
          }
        },
        "Brake Pads (Disc)": {
          defaultLifespan: 3500,
          brands: ["Shimano", "Jagwire", "SwissStop"],
          models: {
            "Shimano": [
              { name: "B01S", lifespan: 3500 },
              { name: "G03S", lifespan: 3800 },
              { name: "J04C", lifespan: 4000 }
            ],
            "Jagwire": [
              { name: "Pro Semi-Metallic", lifespan: 3200 },
              { name: "Elite Cooling", lifespan: 3800 },
              { name: "Sport Organic", lifespan: 2500 }
            ],
            "SwissStop": [
              { name: "Disc 25E", lifespan: 3500 },
              { name: "Disc 28EXO", lifespan: 4000 },
              { name: "Disc RS", lifespan: 3200 }
            ]
          }
        },
        "Cassette": {
          defaultLifespan: 8000,
          brands: ["Shimano", "SRAM", "Campagnolo"],
          models: {
            "Shimano": [
              { name: "CS-HG800", lifespan: 8000 },
              { name: "CS-R7000", lifespan: 8500 },
              { name: "CS-M8000", lifespan: 7500 }
            ],
            "SRAM": [
              { name: "PG-1130", lifespan: 7000 },
              { name: "XG-1150", lifespan: 8000 },
              { name: "PG-970", lifespan: 6500 }
            ],
            "Campagnolo": [
              { name: "Chorus 11s", lifespan: 9000 },
              { name: "Centaur 10s", lifespan: 8000 },
              { name: "Super Record 12s", lifespan: 10000 }
            ]
          }
        },
        "Chainrings": {
          defaultLifespan: 15000,
          brands: ["Shimano", "SRAM", "Campagnolo"],
          models: {
            "Shimano": [
              { name: "FC-R8000", lifespan: 15000 },
              { name: "FC-M8000", lifespan: 12000 },
              { name: "FC-R9100", lifespan: 18000 }
            ],
            "SRAM": [
              { name: "X-Sync 2 Eagle", lifespan: 15000 },
              { name: "Red AXS", lifespan: 18000 },
              { name: "Rival 1", lifespan: 12000 }
            ],
            "Campagnolo": [{ name: "Record 12s", lifespan: 18000 },
              { name: "Chorus 11s", lifespan: 15000 },
              { name: "Super Record 12s", lifespan: 20000 }
            ]
          }
        },
        "Cables & Housing": {
          defaultLifespan: 4000,
          brands: ["Jagwire", "Shimano", "Campagnolo"],
          models: {
            "Jagwire": [
              { name: "Pro Shift Kit", lifespan: 4500 },
              { name: "Sport Brake Kit", lifespan: 3500 },
              { name: "Elite Link", lifespan: 5000 }
            ],
            "Shimano": [
              { name: "OT-SP41", lifespan: 4000 },
              { name: "Dura-Ace Polymer Kit", lifespan: 5000 },
              { name: "SM-BH90", lifespan: 6000 }
            ],
            "Campagnolo": [
              { name: "Ultra-Low Friction Kit", lifespan: 5000 },
              { name: "Ergopower Cable Set", lifespan: 4500 },
              { name: "Mechanical Brake Cable Kit", lifespan: 4000 }
            ]
          }
        },
        "Bottom Bracket Bearings": {
          defaultLifespan: 7500,
          brands: ["Shimano", "Enduro Bearings", "Race Face"],
          models: {
            "Shimano": [
              { name: "SM-BB71-41B", lifespan: 7000 },
              { name: "BB-R60", lifespan: 6500 },
              { name: "SM-BBR60", lifespan: 7500 }
            ],
            "Enduro Bearings": [
              { name: "ABEC-3 BB86/92", lifespan: 8000 },
              { name: "XD-15 Angular Contact", lifespan: 10000 },
              { name: "Maxhit Threaded", lifespan: 9000 }
            ],
            "Race Face": [
              { name: "BSA30", lifespan: 7000 },
              { name: "Cinch BB92", lifespan: 8000 },
              { name: "BB392 EVO", lifespan: 8500 }
            ]
          }
        },
        "Front Derailleur": {
          defaultLifespan: 10000,
          brands: ["Shimano", "SRAM", "MicroSHIFT"],
          models: {
            "Shimano": [
              { name: "FD-R7000", lifespan: 12000 },
              { name: "FD-M8020", lifespan: 10000 },
              { name: "FD-R8000", lifespan: 15000 }
            ],
            "SRAM": [
              { name: "Force eTap AXS", lifespan: 15000 },
              { name: "Rival 22", lifespan: 12000 },
              { name: "Apex 1", lifespan: 10000 }
            ],
            "MicroSHIFT": [
              { name: "FD-M46", lifespan: 8000 },
              { name: "FD-R539", lifespan: 9000 },
              { name: "FD-R552", lifespan: 9500 }
            ]
          }
        },
        "Rear Derailleur": {
          defaultLifespan: 10000,
          brands: ["Shimano", "SRAM", "MicroSHIFT"],
          models: {
            "Shimano": [
              { name: "RD-R7000", lifespan: 12000 },
              { name: "RD-M8100", lifespan: 15000 },
              { name: "RD-RX812", lifespan: 13000 }
            ],
            "SRAM": [
              { name: "GX Eagle", lifespan: 12000 },
              { name: "Rival AXS", lifespan: 15000 },
              { name: "X01", lifespan: 18000 }
            ],
            "MicroSHIFT": [
              { name: "RD-M6205GM (Advent X)", lifespan: 9000 },
              { name: "RD-R45S", lifespan: 8000 },
              { name: "RD-M26L", lifespan: 7500 }
            ]
          }
        },
        "Suspension Fork": {
          defaultLifespan: 10000,
          brands: ["RockShox", "Fox", "SR Suntour"],
          models: {
            "RockShox": [
              { name: "Recon Silver RL", lifespan: 8000 },
              { name: "Judy Gold", lifespan: 9000 },
              { name: "Pike Ultimate", lifespan: 12000 }
            ],
            "Fox": [
              { name: "34 Float Performance", lifespan: 10000 },
              { name: "36 Factory GRIP2", lifespan: 12000 },
              { name: "32 Step-Cast", lifespan: 9000 }
            ],
            "SR Suntour": [
              { name: "XCR32 Air", lifespan: 7000 },
              { name: "Raidon XC LO", lifespan: 8000 },
              { name: "AION35 EVO", lifespan: 9000 }
            ]
          }
        },
        "Hub Bearings": {
          defaultLifespan: 10000,
          brands: ["Enduro Bearings", "Chris King", "DT Swiss"],
          models: {
            "Enduro Bearings": [
              { name: "6902 LLB", lifespan: 10000 },
              { name: "MR 2437 LLB", lifespan: 12000 },
              { name: "6805 MAX", lifespan: 11000 }
            ],
            "Chris King": [
              { name: "R45D", lifespan: 15000 },
              { name: "ISO B", lifespan: 14000 },
              { name: "Classic", lifespan: 12000 }
            ],
            "DT Swiss": [
              { name: "240 EXP", lifespan: 15000 },
              { name: "350 Classic", lifespan: 12000 },
              { name: "180 Ceramic", lifespan: 18000 }
            ]
          }
        },
        "Headset Bearings": {
          defaultLifespan: 10000,
          brands: ["Enduro Bearings", "Chris King", "FSA"],
          models: {
            "Enduro Bearings": [
              { name: "ACB6806", lifespan: 12000 },
              { name: "MR2437 LLB", lifespan: 11000 },
              { name: "110 Series", lifespan: 10000 }
            ],
            "Chris King": [
              { name: "NoThreadSet", lifespan: 15000 },
              { name: "InSet 7", lifespan: 14000 },
              { name: "DropSet 2", lifespan: 13000 }
            ],
            "FSA": [
              { name: "Orbit C-40 ACB", lifespan: 10000 },
              { name: "No. 42/ACB", lifespan: 9000 },
              { name: "Integrated No.8", lifespan: 9500 }
            ]
          }
        }
      }
    };
  },

  computed: {
    // Get component types from the centralized library
    componentTypes() {
      return this.$store.getters.getComponentTypes || [];
    },
    
    // get common component types for generic bike
    commonComponents() {
      return this.$store.getters.getCommonComponentTypes || [];
    },
    
    selectedBike() {
      return this.bikes.find(bike => bike.id === this.selectedBikeId) || null;
    }
  },

  watch: {
    'newComponent.type'(newType) {
      // Check if the new type is in our list of known types
      this.isCustomType = !this.componentTypeOptions.includes(newType);
    },
  },

  created() {
    // Initialize component options from the centralized library
    this.initializeComponentOptions();
  },

  methods: {
    // Initialize component options from the library
    initializeComponentOptions() {
      // Get simple string array of component types
      this.componentTypeOptions = Object.keys(this.componentLibrary);
    },
    
    // Handle type selection/input - triggers brand population
   onTypeChange() {
  setTimeout(() => {
    const type = this.newComponent.type?.trim();
    if (!type) {
      this.brandOptions = [];
      this.modelOptions = [];
      return;
    }
    if (!this.componentTypeOptions.includes(type)) {
      this.componentTypeOptions.push(type);
    }

    const libEntry = this.componentLibrary[type];
    if (libEntry) {
      this.defaultLifespan = libEntry.defaultLifespan;
      if (!this.newComponent.lifespan) {
        this.newComponent.lifespan = libEntry.defaultLifespan;
      }
    } else {
      this.defaultLifespan = 5000;
      if (!this.newComponent.lifespan) {
        this.newComponent.lifespan = 5000;
      }
    }

    this.getBrandOptions();
  }, 0);
},

    
    // Get brand options based on selected component type
    getBrandOptions() {
    if (!this.newComponent.type) {
      this.brandOptions = [];
      return;
    }
    
    // Check if we have this component type in our library
    if (this.componentLibrary[this.newComponent.type] && 
        this.componentLibrary[this.newComponent.type].brands) {
      this.brandOptions = [...this.componentLibrary[this.newComponent.type].brands];
    } else {
      // custom types, start with empty brand list
      this.brandOptions = [];
    }
  },
    
  onBrandChange() {
  setTimeout(() => {
    const brand = this.newComponent.brand?.trim();
    if (!brand) {
      this.modelOptions = [];
      return;
    }
    if (!this.brandOptions.includes(brand)) {
      this.brandOptions.push(brand);
    }

    this.getModelOptions();
  }, 0);
},
    
    
    getModelOptions() {
    if (!this.newComponent.type || !this.newComponent.brand) {
      this.modelOptions = [];
      return;
    }
    
    if (this.componentLibrary[this.newComponent.type] && 
        this.componentLibrary[this.newComponent.type].models && 
        this.componentLibrary[this.newComponent.type].models[this.newComponent.brand]) {
      
      const models = this.componentLibrary[this.newComponent.type]
        .models[this.newComponent.brand];
      
      this.modelOptions = models.map(model => model.name);
    } else {
    
      this.modelOptions = [];
    }
  },
    

  onModelChange() {
  setTimeout(() => {
    const model = this.newComponent.model?.trim();
    if (!model) return;

    if (!this.modelOptions.includes(model)) {
      this.modelOptions.push(model);
    }

    const models = this.componentLibrary[this.newComponent.type]?.models?.[this.newComponent.brand];
    if (models) {
      const selectedModel = models.find(m => m.name === model);
      if (selectedModel?.lifespan) {
        this.newComponent.lifespan = selectedModel.lifespan;
      }
    }
  }, 0);
}
,
    
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
      model: '', 
      lifespan: null,
      description: '',
    };
    
    this.formError = false;
    
    this.brandOptions = [];
    this.modelOptions = [];
    
    if (this.$refs.componentForm) {
      this.$refs.componentForm.resetValidation();
    }
  },
    
    validateAndAddComponent() {
      this.isSubmitting = true;
      
      if (this.$refs.componentForm) {
        this.$refs.componentForm.validate();
      }
      
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

    addManualComponent() {
      if (this.newComponent.type &&
          this.newComponent.brand &&
          this.newComponent.lifespan !== null && 
          this.newComponent.lifespan > 0) {
        
        let description = this.newComponent.description || '';
        if (this.newComponent.model && !description) {
          description = `${this.newComponent.brand} ${this.newComponent.model} ${this.newComponent.type}`;
        } else if (!description) {
          description = `${this.newComponent.brand} ${this.newComponent.type}`;
        }
        
        const componentToSend = {
          type: this.newComponent.type,
          brand: this.newComponent.brand,
          model: this.newComponent.model || '', 
          description: description,
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
        const updatedComponent = { ...this.selectedBike.components[index] };

        updatedComponent.inUse = updatedComponent.inUse ? 0 : 1;
        
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
      // Create a deep copy of the component to avoid direct mutation
      this.selectedComponent = JSON.parse(JSON.stringify(component));
      this.selectedIndex = index;
      this.mileageToAdd = 0;
      this.dialog = true;
    },
    
    // Save changes made in the inspection dialog
    saveComponentChanges() {
      if (this.$refs.inspectForm && this.inspectFormValid) {
        this.$emit("component-updated", {
          bikeId: this.selectedBike.id,
          componentIndex: this.selectedIndex,
          updatedComponent: this.selectedComponent
        });
        
        this.dialog = false;
      }
    },

    applyMileageUpdate() {
      const added = Number(this.mileageToAdd);
      if (!isNaN(added) && added > 0) {
        // Update the local copy of the component
        this.selectedComponent.health.mileage += added;
        
        this.$emit("component-updated", {
          bikeId: this.selectedBike.id,
          componentIndex: this.selectedIndex,
          updatedComponent: this.selectedComponent
        });
        
        // Also emit a check-maintenance event to trigger the checkForMaintenance action
        this.$emit("check-maintenance");
        
        this.mileageToAdd = 0;
      }
    },
    
    // component image based on component type
    getComponentImage(componentType) {
      if (!componentType) return this.componentImages.default;
      
      // Return the image for this component type, or default if not found
      return this.componentImages[componentType] || this.componentImages.default;
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
    
    // Create a generic bike with standard components
    async createGenericBike() {
      if (this.$refs.genericBikeForm.validate()) {
        this.isCreatingBike = true;
        
        try {
          await this.$store.dispatch('createGenericBike', {
            bikeName: this.genericBike.nickname,
            brand: "",
            model: "Generic Bike"
          });
          
          this.genericBike = {
            nickname: ''
          };
          
          this.showGenericBikeForm = false;
          
          this.showBikeArray = true;
          this.showBike = false;
        } catch (error) {
          console.error("Error creating generic bike:", error);
        } finally {
          this.isCreatingBike = false;
        }
      }
    },
    
    // Open the edit name dialog
    editBikeName() {
      if (this.selectedBike) {
        this.editedBikeName = this.selectedBike.nickname || "";
        this.editedBikeBrand = this.selectedBike.brand || "";
        this.editedBikeModel = this.selectedBike.model || "";
        this.showEditNameDialog = true;
      }
    },
    
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
        
        this.showEditNameDialog = false;
      }
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
  }
};
</script>

<style scoped>
.component-image-placeholder {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
}

.inspect-dialog-card {
  padding: 16px;
  border-radius: 16px;
  max-width: 600px;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.garage-container {
  padding-top: 40px;
}

.garage-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  margin: 30px 0;
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