<template>
  <v-app style="height: 100vh; background-color: #f5f7fa;">
    <v-container fluid>
      <!-- Page title -->
      <h1 class="maintenance-title">Bike Maintenance Hub</h1>

      <!-- Tab navigation -->
      <v-tabs
        v-model="activeTab"
        background-color="primary"
        dark
        centered
        grow
        class="mb-4 elevation-1 rounded"
      >
        <v-tab value="needed">Maintenance Needed</v-tab>
        <v-tab value="components">Component Library</v-tab>
        <v-tab value="shops">Nearby Shops</v-tab>
      </v-tabs>

      <!-- Tab content -->
      <v-window v-model="activeTab" class="mt-4">
        <!-- Maintenance Needed Tab -->
        <v-window-item value="needed">
          <v-card flat class="my-4 pa-4">
            <v-card-title class="headline">Components Needing Attention</v-card-title>
            <v-card-subtitle>These components have less than 20% health remaining</v-card-subtitle>
            
            <v-divider class="my-4"></v-divider>
            
            <div v-if="bikeComponentsMaintenance.length === 0" class="text-center pa-6">
              <v-icon size="48" color="success">mdi-check-circle</v-icon>
              <h2 class="text-h5 mt-4">All Components Look Good!</h2>
              <p class="mt-2">No components currently need maintenance.</p>
            </div>
            
            <div v-else>
              <div v-for="(bikeGroup, bikeIndex) in groupedMaintenanceComponents" :key="bikeIndex" class="mb-6">
                <h3 class="text-h6 mb-3">
                  <v-icon left color="primary">mdi-bike</v-icon>
                  {{ bikeGroup.bikeName }}
                </h3>
                
                <v-row>
                  <v-col v-for="(component, index) in bikeGroup.components" :key="index" cols="12" sm="6" lg="4">
                    <v-card outlined hover class="maintenance-card" @click="viewComponentInfo(component.type)">
                      <div class="health-indicator" :class="getHealthColorClass(component.healthPercentage)"></div>
                      <v-card-title class="text-subtitle-1">{{ component.type }}</v-card-title>
                      <v-card-subtitle>{{ component.brand }}</v-card-subtitle>
                      <v-card-text>
                        <v-progress-linear
                          :value="component.healthPercentage"
                          :color="getHealthColor(component.healthPercentage)"
                          height="8"
                          rounded
                        ></v-progress-linear>
                        <div class="d-flex justify-space-between mt-1">
                          <span class="text-caption">Health: {{ component.healthPercentage }}%</span>
                          <span class="text-caption">{{ component.currentMileage }} / {{ component.maxLifespan }} km</span>
                        </div>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn 
                          color="success" 
                          block
                          @click.stop="openMaintenanceDialog({
                            component: component, 
                            bikeId: bikeGroup.bikeId, 
                            componentIndex: component.componentIndex
                          })"
                        >
                          <v-icon left>mdi-wrench-check</v-icon>
                          Mark as Maintained
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
                
                <v-divider v-if="bikeIndex < groupedMaintenanceComponents.length - 1" class="my-4"></v-divider>
              </div>
            </div>
          </v-card>
        </v-window-item>

        <!-- Component Library Tab -->
        <v-window-item value="components">
          <v-card flat class="my-4 pa-4">
            <v-card-title class="headline">Component Maintenance Library</v-card-title>
            <v-card-subtitle>Find maintenance guides for all bike components</v-card-subtitle>
            
            <v-divider class="my-4"></v-divider>
            
            <!-- Search section -->
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="searchQuery"
                  label="Search components"
                  outlined
                  dense
                  append-icon="mdi-magnify"
                  clearable
                  @input="filterComponents"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <!-- Component grid -->
            <v-row>
              <v-col v-for="(component, index) in filteredComponentsList" :key="index" cols="12" sm="6" md="4" lg="3">
                <v-card outlined hover @click="viewComponentInfo(component.name)" class="component-card">
                  <v-card-title class="text-subtitle-1">{{ component.name }}</v-card-title>
                  <v-card-subtitle>Typical lifespan: {{ component.defaultLifespan }} km</v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="primary" text block>View Guide</v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-window-item>

        <!-- Nearby Shops Tab -->
        <v-window-item value="shops">
          <v-card flat class="my-4 pa-4">
            <v-card-title class="headline">Find Bike Shops Nearby</v-card-title>
            <v-card-subtitle>Locate professional bike mechanics near your location</v-card-subtitle>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="text-center my-6">
              <p class="mb-4">Need professional help? Find bicycle repair shops near your current location.</p>
              <v-btn 
                @click="findNearbyBikeShop" 
                color="primary" 
                large 
                class="elevation-2"
                :loading="isLoadingShops"
              >
                <v-icon left>mdi-map-marker</v-icon>
                Find nearby bike shops
              </v-btn>
            </div>
            
            <div v-if="foundShops.length > 0" class="mt-6">
              <h3 class="text-h6 mb-3">Bike Shops Found ({{ foundShops.length }})</h3>
              <v-list two-line>
                <v-list-item v-for="(shop, index) in foundShops" :key="index">
                  <v-list-item-avatar>
                    <v-icon color="primary">mdi-store</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ shop.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ shop.vicinity || shop.formatted_address }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="openDirections(shop)">
                      <v-icon>mdi-directions</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-window-item>
      </v-window>

      <!-- Component Detail Dialog -->
      <v-dialog v-model="componentDialog" max-width="800px">
        <v-card v-if="selectedComponentInfo">
          <v-card-title class="headline primary--text">
            {{ selectedComponentInfo.name }} Maintenance
            <v-spacer></v-spacer>
            <v-btn icon @click="componentDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-tabs v-model="infoTab" background-color="transparent" grow>
              <v-tab value="guide">Maintenance Guide</v-tab>
              <v-tab value="video">Video Tutorial</v-tab>
            </v-tabs>
            
            <v-window v-model="infoTab" class="mt-4">
              <v-window-item value="guide">
                <h3>How to Maintain Your {{ selectedComponentInfo.name }}</h3>
                <p class="my-3">{{ selectedComponentInfo.maintenanceText }}</p>
                
                <v-divider class="my-4"></v-divider>
                
                <h3>Recommended Maintenance Schedule</h3>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-calendar-check</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Regular check</v-list-item-title>
                      <v-list-item-subtitle>Every {{ selectedComponentInfo.maintenanceInterval }} km</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-tools</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Thorough maintenance</v-list-item-title>
                      <v-list-item-subtitle>Every {{ selectedComponentInfo.maintenanceInterval * 2 }} km</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-refresh</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>Consider replacement</v-list-item-title>
                      <v-list-item-subtitle>Around {{ selectedComponentInfo.defaultLifespan }} km (or when health drops below 10%)</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                
                <v-divider class="my-4"></v-divider>
                
                <h3>Recommended Tools</h3>
                <v-chip-group>
                  <v-chip v-for="(tool, index) in selectedComponentInfo.tools" :key="index" outlined class="ma-1">
                    {{ tool }}
                  </v-chip>
                </v-chip-group>
              </v-window-item>
              
              <v-window-item value="video">
                <div v-if="selectedComponentInfo.videoId" class="video-container">
                  <iframe 
                    width="100%" 
                    height="450" 
                    :src="`https://www.youtube.com/embed/${selectedComponentInfo.videoId}`" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                  ></iframe>
                </div>
                <div v-else class="text-center pa-6">
                  <v-icon size="48" color="grey">mdi-video-off</v-icon>
                  <p class="mt-4">No video tutorial available for this component yet.</p>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
          
          <v-card-actions>
            <!-- Only show the maintenance button if the component is found in the maintenance needed list
                 AND we're in the maintenance tab, or viewing it from the maintenance tab -->
            <v-btn 
              v-if="activeTab === 'needed' || selectedFromMaintenanceTab"
              color="success" 
              @click="openMaintenanceDialog(getComponentForMaintenance(selectedComponentInfo.name))"
            >
              <v-icon left>mdi-wrench-check</v-icon>
              Mark as Maintained
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="componentDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Map Dialog for Bike Shops -->
      <v-dialog v-model="mapDialog" max-width="800px">
        <v-card>
          <v-card-title>
            Nearby Bike Shops
            <v-spacer></v-spacer>
            <v-btn icon @click="mapDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div ref="mapContainer" style="height: 500px; width: 100%; border-radius: 8px;"></div>
          </v-card-text>
        </v-card>
      </v-dialog>
      
      <!-- Maintenance Complete Dialog -->
      <v-dialog v-model="showMaintenanceDialog" max-width="500px">
        <v-card>
          <v-card-title class="headline success--text">
            <v-icon left color="success">mdi-checkbox-marked-circle</v-icon>
            Record Maintenance
          </v-card-title>
          <v-card-text>
            <p>Record maintenance for {{ selectedMaintComponent?.type || 'this component' }}.</p>
            
            <v-form ref="maintenanceForm" v-model="maintenanceFormValid">
              <v-select
                v-model="maintenanceType"
                :items="maintenanceTypes"
                label="Maintenance Type"
                outlined
                dense
                class="mt-4"
                :rules="[v => !!v || 'Please select a maintenance type']"
              ></v-select>
              
              <v-text-field
                v-model="maintenanceNotes"
                label="Notes (Optional)"
                placeholder="Describe what was done or replaced"
                outlined
                class="mt-4"
              ></v-text-field>
              
              <v-slider
                v-model="healthRestorePercentage"
                label="Health Restoration"
                thumb-label="always"
                min="0"
                max="100"
                class="mt-6"
                :hint="`Restore component to ${healthRestorePercentage}% health`"
                persistent-hint
              ></v-slider>
            </v-form>

            <v-alert
              type="info"
              dense
              outlined
              class="mt-4"
            >
              <v-icon left>mdi-information-outline</v-icon>
              The component's health will be restored according to the selected percentage.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showMaintenanceDialog = false">Cancel</v-btn>
            <v-btn 
              color="success" 
              @click="completeMaintenance"
              :disabled="!maintenanceFormValid"
            >
              <v-icon left>mdi-check</v-icon>
              Complete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Success Snackbar -->
      <v-snackbar
        v-model="snackbarVisible"
        :timeout="3000"
        :color="snackbarColor"
        bottom
      >
        {{ snackbarMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbarVisible = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </v-app>
</template>

<script>
/* global google */

export default {
  name: 'MaintenancePage',

  props: {
    bikeComponentsMaintenance: {
      type: Array,
      default: () => []
    },
    maintenanceInfo: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      activeTab: 'needed',
      infoTab: 'guide',
      
      componentDialog: false,
      mapDialog: false,
      
      map: null,
      userLocation: null,
      isLoadingShops: false,
      foundShops: [],
      
      searchQuery: '',
      filteredComponentsList: [],
      
      selectedComponentInfo: null,
      
      selectedFromMaintenanceTab: false,
      
      
      showMaintenanceDialog: false,
      maintenanceFormValid: true, 
      maintenanceType: null,
      maintenanceNotes: "",
      healthRestorePercentage: 100,
      selectedMaintComponent: null,
      selectedBikeId: null,
      selectedComponentIndex: null,
      maintenanceTypes: [
        'Regular service',
        'Cleaning',
        'Adjustment',
        'Part replacement',
        'Complete overhaul'
      ],
      
      // Snackbar
      snackbarVisible: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },

  computed: {
    // Group maintenance components by bike
    groupedMaintenanceComponents() {
      if (!this.bikeComponentsMaintenance || this.bikeComponentsMaintenance.length === 0) {
        return [];
      }
      
      const bikeMap = new Map();
      
      this.bikeComponentsMaintenance.forEach(component => {
        const bikeId = component.bikeId || 'unknown';
        const bikeName = component.bikeName || 'Unknown Bike';
        
        if (!bikeMap.has(bikeId)) {
          bikeMap.set(bikeId, {
            bikeId,
            bikeName,
            components: []
          });
        }
        
        bikeMap.get(bikeId).components.push(component);
      });
      
      return Array.from(bikeMap.values());
    }
  },

  watch: {
    // Re-fetch maintenance needs when returning to this tab 
    activeTab(newVal) {
      if (newVal === 'needed') {
        this.$emit('check-maintenance');
      }
    }
  },

  mounted() {
    // Initialize component list
    this.filterComponents();
    
    // Check if we should pre-select a tab based on query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      this.activeTab = tab;
    }
    
    // Check if we should pre-select a component
    const component = urlParams.get('component');
    if (component) {
      this.viewComponentInfo(component);
    }
    
    // Ensure maintenance list is fresh
    this.$emit('check-maintenance');
  },

  methods: {
    // Filter components based on search query
    filterComponents() {
      let filtered = this.$store.getters.getComponentTypes || [];
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(component => 
          component.name.toLowerCase().includes(query)
        );
      }
      
      this.filteredComponentsList = filtered;
    },
    
    // View component info
    viewComponentInfo(componentName) {
      // Find matching component in library
      const component = this.$store.getters.getComponentTypes.find(comp => 
        comp.name.toLowerCase() === componentName.toLowerCase()
      );
      
      if (component) {
        this.selectedComponentInfo = component;
        
        this.selectedFromMaintenanceTab = this.activeTab === 'needed';
        
        this.componentDialog = true;
        this.infoTab = 'guide'; 
        
        this.$emit('component-selected', component);
      } else {
        console.error(`Component not found: ${componentName}`);
      }
    },
    
    // Helper method to find a component for maintenance from the component info
    getComponentForMaintenance(componentType) {
      // First check if we have any components of this type that need maintenance
      const needsMaintenance = this.bikeComponentsMaintenance.find(
        comp => comp.type.toLowerCase() === componentType.toLowerCase()
      );
      
      if (needsMaintenance) {
        // We found a component of this type that needs maintenance
        return {
          component: needsMaintenance,
          bikeId: needsMaintenance.bikeId, 
          componentIndex: needsMaintenance.componentIndex
        };
      }
      
      // if no components need maintenance, check all bikes for the first component of this type
      const allBikes = this.$store.getters.getBike || [];
      for (const bike of allBikes) {
        if (bike && bike.components) {
          const componentIndex = bike.components.findIndex(
            comp => comp.type.toLowerCase() === componentType.toLowerCase() && comp.inUse
          );
          
          if (componentIndex !== -1) {
            // We found a component of this type
            const component = bike.components[componentIndex];
            return {
              component: {
                type: component.type,
                brand: component.brand,
                currentMileage: component.health?.mileage || 0,
                maxLifespan: component.health?.lifespan || 1000,
                healthPercentage: this.calculateHealth(component)
              },
              bikeId: bike.id,
              componentIndex: componentIndex
            };
          }
        }
      }
      
      return null;
    },
    
    // Open maintenance dialog for a component
    openMaintenanceDialog(componentData) {
      if (!componentData) {
        // No component of this type found, show a message
        this.showErrorSnackbar("No active components of this type found on your bikes");
        return;
      }
      
      this.selectedMaintComponent = componentData.component;
      this.selectedBikeId = componentData.bikeId;
      this.selectedComponentIndex = componentData.componentIndex;
      
      // Set default values
      this.maintenanceType = 'Regular service';
      this.maintenanceNotes = '';
      this.healthRestorePercentage = 100; // Default to full restoration
      
      // Show the dialog
      this.showMaintenanceDialog = true;
    },
    
    // Process maintenance completion
    completeMaintenance() {
      if (!this.maintenanceFormValid || !this.selectedMaintComponent) return;
      
      // Create maintenance record
      const maintenanceRecord = {
        date: new Date().toISOString(),
        type: this.maintenanceType,
        notes: this.maintenanceNotes,
        healthRestored: this.healthRestorePercentage,
        componentType: this.selectedMaintComponent.type,
        componentBrand: this.selectedMaintComponent.brand
      };
      
      // Emit an event to the presenter to record maintenance
      this.$emit('record-maintenance', {
        bikeId: this.selectedBikeId,
        componentIndex: this.selectedComponentIndex,
        maintenanceRecord: maintenanceRecord,
        healthPercentage: this.healthRestorePercentage
      });
      
      // Close both dialogs
      this.showMaintenanceDialog = false;
      this.componentDialog = false;
      
      // Show success notification
      this.showSuccessSnackbar(`Maintenance recorded: ${this.maintenanceType}`);
    },
    
    // Get color based on health percentage
    getHealthColor(percentage) {
      if (percentage < 10) return 'error';
      if (percentage < 30) return 'warning';
      return 'success';
    },
    
    // Get CSS class based on health percentage
    getHealthColorClass(percentage) {
      if (percentage < 10) return 'health-critical';
      if (percentage < 30) return 'health-warning';
      return 'health-ok';
    },
    
    // Calculate component health
    calculateHealth(component) {
      const mileage = component?.health?.mileage ?? 0;
      const lifespan = component?.health?.lifespan ?? 1000;
      return Math.max(0, Math.round(((lifespan - mileage) / lifespan) * 100));
    },
    
    // Success notification
    showSuccessSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbarColor = 'success';
      this.snackbarVisible = true;
    },
    
    // Error notification
    showErrorSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbarColor = 'error';
      this.snackbarVisible = true;
    },
    
    // Find nearby bike shops
    async findNearbyBikeShop() {
      try {
        this.isLoadingShops = true;
        
        // Get user location
        this.userLocation = await this.getUserLocation();
        console.log("Got user location:", this.userLocation);
        
        // Search for bike shops
        const shops = await this.searchForBikeShops(this.userLocation);
        this.foundShops = shops;
        
        // Show map dialog
        this.mapDialog = true;
        
        // Initialize map (after dialog is visible)
        this.$nextTick(() => {
          this.initializeMap();
        });
        
        // Emit event
        this.$emit("bike-shops-found", shops);
      } catch (error) {
        console.error('Error finding bike shops:', error.message);
      } finally {
        this.isLoadingShops = false;
      }
    },

    // Get user's geolocation
    async getUserLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("User location:", lat, lng);
            resolve({ lat, lng });
          },
          (error) => {
            console.error("Error getting user location:", error);
            reject(error);
          }
        );
      });
    },

    // Search for bike shops near a location
    async searchForBikeShops(location) {
      if (!location) {
        console.log("No location provided for bike shop search.");
        return [];
      }

      try {
        const { PlacesService } = await google.maps.importLibrary("places");
        
        // Initialize a temporary map for the PlacesService
        const tempMapDiv = document.createElement('div');
        const tempMap = new google.maps.Map(tempMapDiv);
        
        const request = {
          query: "bike shop",
          location: location,
          radius: 5000, // 5km radie
          fields: ["name", "geometry", "formatted_address", "vicinity", "website", "opening_hours"],
        };

        const service = new PlacesService(tempMap);

        return new Promise((resolve, reject) => {
          service.textSearch(request, (results, status) => {
            console.log('Search results:', results);
            console.log('Search status:', status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              reject(new Error(`Search failed: ${status}`));
            }
          });
        });
      } catch (error) {
        console.error("An error occurred during place search:", error);
        return [];
      }
    },

    // Initialize Google Map
    async initializeMap() {
      try {
        if (!this.userLocation) {
          console.error("No user location available for map initialization");
          return;
        }
        
        // Load Google Maps libraries
        const { Map } = await google.maps.importLibrary("maps");
        const { Marker } = await google.maps.importLibrary("marker");
        
        // Create map centered on user location
        this.map = new Map(this.$refs.mapContainer, {
          center: this.userLocation,
          zoom: 13,
        });
        
        // Add marker for user location
        new Marker({
          map: this.map,
          position: this.userLocation,
          title: "Your location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        });
        
        // Add markers for bike shops
        this.foundShops.forEach(shop => {
          if (shop.geometry?.location) {
            new Marker({
              map: this.map,
              position: shop.geometry.location,
              title: shop.name || "Bike Shop",
              animation: google.maps.Animation.DROP
            });
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    },

    // Open Google Maps directions to shop
    openDirections(shop) {
      if (!shop.geometry?.location) return;
      
      const destination = `${shop.geometry.location.lat()},${shop.geometry.location.lng()}`;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${shop.place_id}`;
      window.open(url, '_blank');
    }
  }
};
</script>

<style scoped>
.maintenance-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  margin: 30px 0;
}

.maintenance-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
  height: 100%;
}

.maintenance-card:hover {
  transform: translateY(-5px);
}

.health-indicator {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 8px;
}

.health-critical {
  background-color: #f44336;
}

.health-warning {
  background-color: #ff9800;
}

.health-ok {
  background-color: #4caf50;
}

.component-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.component-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
}

.video-container {
  position: relative;
  overflow: hidden;
  padding-top: 56.25%; 
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>