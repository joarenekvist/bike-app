<!--used in the routes page to show all available medals and those belonging to the user.-->
<template>
    <v-app>
    <div class="allContent">
    <div class = "listToTheLeft">
    <v-card class="mx-auto" max-width="300">
      <v-list>
      <template v-for="item in items" :key="item.id || item.title">
        <v-list-subheader v-if="item.type === 'subheader'">
            {{ item.title }}
        </v-list-subheader>
        <v-list-item
            v-else
            :class="{ 'bg-green': isCompleted(item.id) }"
            @click="currentSelectedMedal = item"
        >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </template>
      </v-list>
    </v-card>
    </div>
    <div class="contentToTheRight">
      <v-icon class="medal-icon" large v-if="currentSelectedMedal">{{ currentSelectedMedal.icon }}</v-icon>
      <h2 v-if="currentSelectedMedal">{{ currentSelectedMedal.title }}</h2>
      <h4 v-if="currentSelectedMedal">{{ currentSelectedMedal.category }}</h4>
      <p v-if="currentSelectedMedal">{{ currentSelectedMedal.description }}</p>
    </div>
</div>
</v-app>
</template>
  
<script>
export default {
  name: 'MedalsWidget',

  props: {
    medals: Array,
    totalDistanceTravelled: Number,
    userStatistics: Object, //things like manual part changes, maintenance performed, etc.
  },
  computed: {

  },
  components:{

  },
  emits: [], //
  async mounted() {
  
  },

  data() {
    return {
        items: [
            { type: 'subheader', title: 'Consistency' },
            {title: "Hot Streak: 10", id: 0, icon: 'mdi-fire', category: "Consistency", description: "Use the app to travel 10 days in a row with your bike."},
            {title: "Hot Streak: 25", id: 1, icon: 'mdi-fire', category: "Consistency", description: "Use the app to travel 25 days in a row with your bike."},
            {title: "Hot Streak: 50", id: 2, icon: 'mdi-fire', category: "Consistency", description: "Use the app to travel 50 days in a row with your bike."},
            {title: "Hot Streak: 100", id: 3, icon: 'mdi-fire', category: "Consistency", description: "Use the app to travel 100 days in a row with your bike."},
            { type: 'subheader', title: 'Maintenance' },
            {title: "Novice DIY Repairer", id: 4, icon: 'mdi-wrench',category: "Maintenance", description: "Perform maintenance on one of your components once."},
            {title: "Practised DIY Repairer", id : 5, icon: 'mdi-wrench',category: "Maintenance", description: "Perform maintenance on one or more of your components 10 times."},
            {title: "Expert DIY Repairer", id: 6, icon: 'mdi-wrench',category: "Maintenance", description: "Perform maintenance on one or more of your components 25 times."},
            {title: "DIY Guru", id: 7, icon: 'mdi-wrench',category: "Maintenance", description: "Perform maintenance on one or more of your components 50 times."},
            { type: 'subheader', title: 'Environment' },
            {title: "Environmental Friend", id: 8, icon: 'mdi-leaf-circle',category: "Environment", description: "Prevent an estimated 1 kg of CO-2 by travelling with your bike instead of a car."},
            {title: "Environmental Fighter", id: 9, icon: 'mdi-leaf-circle',category: "Environment", description: "Prevent an estimated 5 kg of CO-2 by travelling with your bike instead of a car."},
            {title: "Environmental Hero", id: 10, icon: 'mdi-leaf-circle',category: "Environment", description: "Prevent an estimated 10 kg of CO-2 by travelling with your bike instead of a car."},
            {title: "Skogsmulle", id: 11, icon: 'mdi-leaf-circle',category: "Environment", description: "Prevent an estimated 50 kg of CO-2 by travelling with your bike instead of a car."},
        ],
        currentSelectedMedal: 0,    
};
  },

  methods: {
    isCompleted(id) {
    // assumes medals is an array of medal IDs like [0, 3, 5]
    return this.medals.includes(id);
  },
},
}
</script>
  
  <style>
    .bg-green {
      background-color: green;
    }

.allContent{
  flex: 1;
  /*border: 1px solid gray; */
  padding: 16px;
  box-sizing: border-box;
  
  display: flex;
  flex-direction: row;
}

.listToTheLeft{
  flex: 1;
  /*border: 1px solid gray; */
  padding: 16px;
  box-sizing: border-box;
  
  flex-direction: column;
  min-width: 250px; /* or whatever minimum works well */
}

.contentToTheRight p {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.contentToTheRight{
  flex: 1;
  /*border: 1px solid gray; */
  padding: 16px;
  box-sizing: border-box;
 
  flex-direction: column;
}
  </style>
  