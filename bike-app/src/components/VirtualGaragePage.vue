<template> 
  <v-app style="height: 100vh; background-color: #f0f2f5;">
    <v-container fluid class="garage-container">
      <!-- page title -->
      <h1 class="garage-title">My Virtual Bike Garage</h1>

      <!-- section for adding new components -->
      <div class="clickable-label" @click="showForm = !showForm">
        {{ showForm ? '➖ Hide' : '➕ Add New Component' }}
      </div>

      <!-- Add Component Form  -->
      <v-expand-transition>
        <v-card v-if="showForm" class="add-component-card mb-6" outlined>
          <v-card-text>
            <v-form @submit.prevent="addManualComponent">
              <!-- Component Type Selection with custom option -->
              <v-combobox
                v-model="newComponent.type"
                :items="componentTypes"
                label="Component Type"
                hint="Select from list or enter custom type"
                persistent-hint
                outlined
                dense
                class="mb-4"
                required
                @change="onTypeChange"
              />
              
              <!-- Brand Selection with custom option -->
              <v-combobox
                v-model="newComponent.brand"
                :items="filteredBrands"
                label="Brand"
                hint="Select from list or enter custom brand"
                persistent-hint
                outlined
                dense
                class="mb-4"
                required
              />

              <v-text-field 
                v-model.number="newComponent.lifespan" 
                label="Expected Lifespan (km)" 
                type="number" 
                outlined
                dense
                class="mb-4"
                required 
              />
              
              <v-textarea 
                v-model="newComponent.description" 
                label="Description" 
                outlined
                dense
                rows="2"
                class="mb-4"
                required 
              />
              
              <v-btn 
                color="primary" 
                type="submit"
                elevation="2"
                class="px-6"
              >
                Add Component
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- display components -->
      <v-row>
        <v-col
          v-for="(component, index) in bikeComponents"
          :key="index"
          cols="12" sm="6" md="4"
        >
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
            </v-card-text>
            <v-card-actions>
              <v-btn
                :color="(component.inUse ?? 1) ? 'red' : 'green'"
                @click="toggleActive(index)"
              >
                {{ (component.inUse ?? 1) ? 'Deactivate' : 'Activate' }}
              </v-btn>
              <v-btn color="primary" @click="openInspect(component, index)">Inspect</v-btn>
              <v-btn text color="grey" @click="removeComponent(index)">Remove</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- inspect dialog -->
      <v-dialog
        v-if="selectedComponent"
        v-model="dialog"
        max-width="500px"
        transition="dialog-bottom-transition"
        persistent
      >
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
            <v-progress-linear
              :value="calculateHealth(selectedComponent)"
              :color="healthColor(selectedComponent)"
              height="24"
              striped
              rounded
              class="my-4"
            >
              <strong class="mx-auto">{{ calculateHealth(selectedComponent) }}% HP</strong>
            </v-progress-linear>

            <!-- Simulate mileage update after ride -->
            <v-text-field
              v-model.number="mileageToAdd"
              label="Add Distance Ridden (km)"
              type="number"
              outlined
              class="mt-4"
            />

            <v-btn
              color="primary"
              class="mt-2"
              @click="applyMileageUpdate"
            >
              Update Mileage
            </v-btn>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'VirtualGaragePage',

  props: {
    bikeComponents: Array,
    user: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      showForm: false,
      isCustomType: false,
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
    };
  },

  computed: {
    filteredBrands() {
      if (this.isCustomType || !this.brandOptions[this.newComponent.type]) {
        return [];
      }
      return this.brandOptions[this.newComponent.type];
    },
  },

  watch: {
    'newComponent.type'(newType) {
      this.isCustomType = !this.componentTypes.includes(newType);
    },
  },

  methods: {
    onTypeChange() {
      this.newComponent.brand = '';
    },

    addManualComponent() {
      if (
        this.newComponent.type &&
        this.newComponent.brand &&
        this.newComponent.lifespan !== null &&
        this.newComponent.description
      ) {
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

        this.$emit("component-added", componentToSend);

        // Reset form
        this.newComponent.type = '';
        this.newComponent.brand = '';
        this.newComponent.lifespan = null;
        this.newComponent.description = '';
      }
    },

    removeComponent(index) {
      this.$emit("component-removed", index);
    },

    toggleActive(index) {
      const updatedComponent = { ...this.bikeComponents[index] };
      updatedComponent.inUse = updatedComponent.inUse ? 0 : 1;
      this.$emit("component-updated", { index, updatedComponent });
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
        this.$emit("component-updated", {
          index: this.selectedIndex,
          updatedComponent
        });
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

.add-component-card {
  max-width: 700px;
  margin: 0 auto 40px auto;
  padding: 20px;
  border-radius: 12px;
}

.garage-card {
  position: relative;
  transition: transform 0.2s ease-in-out;
  border-radius: 12px;
}
.garage-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
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